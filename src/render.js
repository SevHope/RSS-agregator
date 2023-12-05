const renderErrors = (message, elements) => {
    elements.input.style.border = 'thick solid red';
    console.log(message, 'message');
    const errorDiv = document.querySelector('.text-danger');
    errorDiv.textContent = message;
};

const render = (state, elements, i18next, value) => {
  console.log(value, 'value в рендере');
  console.log(state, 'state v render');
  console.log(elements, 'elements');
  const message = i18next.t(`errors.${state.form.errors}`);
  console.log(message, 'message');
  if (value === 'false') {
    renderErrors(state.form.errors, elements);
  } else {
    elements.input.value = '';
    elements.input.focus();
    elements.input.style.border = 'none';
  }
};

export default render;
