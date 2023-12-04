import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';
import i18next from 'i18next';

export default async () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submit: document.querySelector("button[type = 'submit']"),
  };

  const state = {
    form: {
      valid: null,
      errors: {},
      feeds: [],
    },
  };

  const watchedState = onChange(state, (path, value, previousValue) => {
    console.log(path, 'path');
    console.log(value, 'value');
    if (path === 'form.valid') {
      console.log('вызываем рендер');
      render(elements, state, value);
    }
  });

    const schema = yup
    .string()
    .required()
    .url()

    const validateSchema = (feeds) => {
      return schema.concat(yup.string().notOneOf(feeds));
    };

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(formData, 'formdata');
    const value = formData.get('url');
    console.log(value, 'value');
    const dynamicSchema = validateSchema(watchedState.form.feeds);
    dynamicSchema.validate(value)
    .then(() => {
      console.log('нет ошибки');
      watchedState.form.valid = 'true';
      console.log(watchedState.form.valid, 'validnost');
      watchedState.form.feeds.push(value);
      console.log(watchedState.form.feeds, 'feeds');
      return {};
    })
    .catch((e) => {
        console.log('есть ошибка');
        watchedState.form.valid = 'false';
        console.log(watchedState.form.valid, 'validnost');
        return { value: e.message };
    })
  });
};
