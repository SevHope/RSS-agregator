import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';
import i18next from 'i18next';
import resources from './locales/ru.js';

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
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })

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

  const watchedState = onChange(state, (path, value) => {
    console.log(state, 'state v onChange');
    console.log(path, 'path');
    console.log(value, 'value в onchange');
    if (path === 'form.valid') {
      console.log('вызываем рендер');
      render(state, elements, i18next);
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
    //console.log(formData, 'formdata');
    const url = formData.get('url');
    const dynamicSchema = validateSchema(watchedState.form.feeds);
    dynamicSchema.validate(url)
    .then(() => {
      //console.log('нет ошибки');
      watchedState.form.valid = 'true';
      //console.log(watchedState.form.valid, 'validnost');
      watchedState.form.feeds.push(url);
      //console.log(watchedState.form.feeds, 'feeds');
      return {};
    })
    .catch((err) => {
        //console.log('есть ошибка');
        console.log(err, 'err v catch');
        watchedState.form.errors = err.message.key;
        console.log(watchedState.form.errors, 'state.form.errors v catch');
        const errorMessage = i18next.t(`errors.${watchedState.form.errors}`);
        console.log(errorMessage, 'errormesage');
        watchedState.form.valid = 'false';
        //console.log(watchedState.form.valid, 'validnost');
        //watchedState.form.errors = err.message;
        //console.log(watchedState.form.errors.key, 'errors');
       // const newError = handleError(e);
       // console.log(newError, 'newError');
    })
  });
};
