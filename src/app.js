import onChange from 'on-change';
import * as yup from 'yup';
import render from './render.js';
import i18next from 'i18next';

export default async () => {

  await i18next.init({
    lng: 'ru', // Текущий язык
    debug: true,
    resources: {
      ru: { // Тексты конкретного языка
        translation: { // Так называемый namespace по умолчанию
          key: 'Привет мир!',
        },
      },
    },
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    submit: document.querySelector("button[type = 'submit']"),
  };

  const initialState = {
    form: {
      valid: true,
      errors: [],
      feeds: [],
      link: '',
    },
  };

  const schema = yup
    .string()
    .required()
    .url()
    .notOneOf(initialState.form.feeds)

  const validateLink = (link, state) => schema.validate(link)
    .then(() => {
      state.form.feeds.push(link);
      console.log('нет ошибки');
      return {};
    })
    .catch((e) => {
      console.log('есть ошибка');
      return { link: e.message };
    });

  //const state = onChange(initialState, () => );

  const state = onChange(initialState, (path, value, previousValue) => render(elements, state));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { value } = elements.input;
    const errors = await validateLink(value, state);
    state.form.errors = errors;
  });
};
