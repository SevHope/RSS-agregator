import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import { uniqueId, isEmpty } from 'lodash';
import parse from './parse.js';
import render from './render.js';
import resources from './locales/index';

const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return proxyUrl.toString();
};

const addIds = (posts, feedId) => posts.map((post) => {
  const id = uniqueId();
  post.id = id;
  post.feedId = feedId;
  return post;
});

const updatePosts = (watchedState) => {
  const promises = watchedState.data.feeds.map((feed) => axios.get(addProxy(feed.link))
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const postsFromState = watchedState.data.posts;
      const postsWithCurrentId = postsFromState.filter((post) => post.feedId === feed.id);
      const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
      const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));
      if (!isEmpty(newPosts)) {
        addIds(newPosts, feed.id);
        watchedState.data.posts.unshift(...newPosts);
        watchedState.formState.status = 'updating';
      }
    })
    .catch((error) => {
      console.error(`Error fetching data from feed ${feed.id}:`, error);
    }));
  return Promise.all(promises).finally(() => setTimeout(updatePosts, 5000, watchedState));
};

const handleData = (data, watchedState, url) => {
  const { feed, posts } = data;
  feed.id = uniqueId();
  console.log(feed, 'feed v handleData');
  feed.link = url;
  addIds(posts, feed.id);
  watchedState.data.posts.push(...posts);
  watchedState.data.feeds.push(feed);
  watchedState.formState.status = 'added';
};

const handleError = (error) => {
  if (error.isParsingError) {
    return 'notRss';
  }

  if (axios.isAxiosError(error)) {
    return 'networkError';
  }

  return error.message.key ?? 'unknown';
};

export default async () => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'notUrl' }),
      required: () => ({ key: 'empty' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'alreadyInList' }),
    },
  });

  const i18nextInstance = i18next.createInstance();
  await i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submit: document.querySelector("button[type = 'submit']"),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.querySelector('.modal'),
    modalHeader: document.querySelector('.modal-header'),
    modalBody: document.querySelector('.modal-body'),
    modalHref: document.querySelector('.full-article'),
  };

  const state = {
    formState: {
      status: 'filling',
      error: null,
    },
    data: {
      feeds: [],
      posts: [],
    },
    uiState: {
      displayedPost: null,
      viewedPostIds: new Set(),
    },
    modal: {
      postId: null,
    },
  };

  const watchedState = onChange(state, (path) => {
    render(state, elements, i18nextInstance, path);
  });

  const schema = yup
    .string()
    .required()
    .url();

  const validateSchema = (links) => schema.concat(yup.string().notOneOf(links));

  const validateURL = (url, addedLinks) => {
    const dynamicSchema = validateSchema(addedLinks);
    return dynamicSchema.validate(url);
  };

  const loadData = (url) => axios.get(addProxy(url))
    .then((response) => {
      const data = parse(response.data.contents);
      return data;
    });

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const addedLinks = watchedState.data.feeds.map((feed) => feed.link);
    try {
      await validateURL(url, addedLinks);
    } catch (error) {
      watchedState.formState.error = handleError(error);
      watchedState.formState.status = 'failed';
      return;
    }
    watchedState.formState.status = 'adding';
    try {
      const data = await loadData(url);
      handleData(data, watchedState, url);
      watchedState.formState.status = 'added';
    } catch (error) {
      watchedState.formState.error = handleError(error);
      watchedState.formState.status = 'failed';
    }
  });

  elements.posts.addEventListener('click', (e) => {
    const postId = e.target.dataset.id;
    if (postId) {
      watchedState.uiState.displayedPost = postId;
      watchedState.uiState.viewedPostIds.add(postId);
    }
  });
  updatePosts(watchedState);
};
