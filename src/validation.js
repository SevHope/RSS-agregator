import onChange from 'on-change';
import * as yup from 'yup';
import axios from 'axios';

const input = document.getElementById('url-input');
const submit = document.querySelector("button[type = 'submit']");
const form = document.querySelector('.rss-form');

const schema = (link) => yup.string().required().url().notOneOf(link);

const validate = (fields) => {
    try {
      schema.validateSync(fields, { abortEarly: false });
      return {};
    } catch (e) {
      return keyBy(e.inner, 'path');
    }
  };

  const state = {
    state: 'valid',
    link: input.value,
    errors: [],
  };

form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.link = input.value;
    const error = validate(state.link);
    console.log(input.value);
    console.log(state.link);
    console.log(error);
});

