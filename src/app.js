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

const getData = (url) => axios.get(addProxy(url));

const addIds = (posts, feedId) => {
  posts.forEach((post) => {
    post.id = uniqueId();
    post.feedId = feedId;
  });
};

const updatePosts = (watchedState) => {
  const promises = watchedState.form.feeds.map((feed) => getData(feed.link)
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const postsFromState = watchedState.form.posts;
      const postsWithCurrentId = postsFromState.filter((post) => post.feedId === feed.id);
      const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
      const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));
      if (!isEmpty(newPosts)) {
        addIds(newPosts, feed.id);
        watchedState.form.posts.unshift(...newPosts);
      }
    })
    .catch((error) => {
      console.error(`Error fetching data from feed ${feed.id}:`, error);
    }));
  return Promise.all(promises).finally(() => setTimeout(updatePosts, 5000, watchedState));
};

const handleData = (data, watchedState) => {
  const { feed, posts } = data;
  feed.id = uniqueId();
  watchedState.form.feeds.push(feed);
  addIds(posts, feed.id);
  watchedState.form.posts.push(...posts);
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
    form: {
      links: [],
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
    error: null,
  };

  const watchedState = onChange(state, (path) => {
    render(state, elements, i18nextInstance, path);
  });

  const schema = yup
    .string()
    .required()
    .url();

  const validateSchema = (links) => schema.concat(yup.string().notOneOf(links));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const dynamicSchema = validateSchema(watchedState.form.links);
    dynamicSchema.validate(url)
      .then(() => getData(url))
      .then((response) => {
        const data = parse(response.data.contents, url);
        handleData(data, watchedState);
        watchedState.form.links.push(url);
      })
      .catch((err) => {
        watchedState.error = handleError(err);
      });
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
