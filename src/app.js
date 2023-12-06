import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import render from './render.js';
import resources from './locales/index';

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
  };

  const state = {
    form: {
      valid: null,
      feeds: [],
    },
    error: null,
  };

  const watchedState = onChange(state, (path, value) => {
    console.log(state, 'state v onChange');
    console.log(path, 'path');
    console.log(value, 'value в onchange');
    if (path === 'form.valid') {
      console.log('вызываем рендер');
      render(state, elements, i18nextInstance);
    }
  });

  const schema = yup
    .string()
    .required()
    .url();

  const validateSchema = (feeds) => schema.concat(yup.string().notOneOf(feeds));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // console.log(formData, 'formdata');
    const url = formData.get('url');
    const dynamicSchema = validateSchema(watchedState.form.feeds);
    dynamicSchema.validate(url)
      .then(() => {
      // console.log('нет ошибки');
        watchedState.form.valid = 'true';
        // console.log(watchedState.form.valid, 'validnost');
        watchedState.form.feeds.push(url);
        // console.log(watchedState.form.feeds, 'feeds');
        return {};
      })
      .catch((err) => {
        // console.log('есть ошибка');
        console.log(err.message, 'err.message v catch');
        watchedState.error = err.message.key;
        console.log(watchedState.error, 'watchedState.error v catch');
        watchedState.form.valid = 'false';
        // const errorMessage = i18nextInstance.t(`errors.${watchedState.error}`);
        // console.log(errorMessage, 'errormesage');
        // console.log(watchedState.form.valid, 'validnost');
        // watchedState.form.errors = err.message;
        // console.log(watchedState.form.errors.key, 'errors');
        // const newError = handleError(e);
        // console.log(newError, 'newError');
      });
  });
};
