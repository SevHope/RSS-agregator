const render = (elements, state) => {
  console.log(state.form.errors.link, 'текст ошибки');
  if (state.form.errors.link) {
    elements.input.style.border = 'thick solid red';
  } else {
    elements.input.value = '';
    elements.input.focus();
    elements.input.style.border = 'none';
  }
};

export default render;
