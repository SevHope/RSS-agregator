const render = (elements, state, value) => {
  console.log(value, 'value');
  if (value === 'false') {
    elements.input.style.border = 'thick solid red';
  } else {
    elements.input.value = '';
    elements.input.focus();
    elements.input.style.border = 'none';
  }
};

export default render;
