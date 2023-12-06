const renderErrors = (message, elements) => {
  const { input } = elements;
  input.style.border = 'thick solid red';
  console.log(message, 'message v renderErrors');
  const errorDiv = document.querySelector('.feedback');
  errorDiv.classList.remove('text-success');
  errorDiv.classList.add('text-danger');
  errorDiv.textContent = message;
};

const renderFeeds = (message, elements) => {
  const { input } = elements;
  input.value = '';
  input.focus();
  input.style.border = 'none';
  const errorDiv = document.querySelector('.feedback');
  errorDiv.classList.remove('text-danger');
  errorDiv.classList.add('text-success');
  errorDiv.textContent = message;
};

const render = (state, elements, i18nextInstance, value) => {
  console.log(value, 'value в рендере');
  console.log(state, 'state v render');
  console.log(elements, 'elements');
  // console.log(i18next.t(state.error), 'i18next v rendere');
  console.log(state.error, 'state.error v render');
  if (state.form.valid === 'false') {
    const errorMessage = i18nextInstance.t(`errors.${state.error}`);
    console.log(errorMessage, 'errormesage v rendere');
    renderErrors(errorMessage, elements);
  } else {
    const successMessage = i18nextInstance.t('success');
    renderFeeds(successMessage, elements);
  }
};

export default render;
