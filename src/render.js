const renderErrors = (message, elements) => {
  const { input, feedback } = elements;
  input.style.border = 'thick solid red';
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = message;
};

const renderFeeds = (message, state, elements) => {
  const {
    input, feedback, feeds, submit,
  } = elements;
  elements.feeds.innerHTML = '';
  submit.classList.remove('disabled');
  input.value = '';
  input.focus();
  input.style.border = 'none';
  feedback.classList.remove('text-danger', 'text-warning');
  feedback.classList.add('text-success');
  feedback.textContent = message;
  const feedsCard = document.createElement('div');
  feeds.append(feedsCard);
  feedsCard.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = 'Фиды';
  cardBody.append(cardTitle);
  feedsCard.prepend(cardBody);
  const ulForFeeds = document.createElement('ul');
  ulForFeeds.classList.add('list-group', 'border-0', 'rounded-0');
  feedsCard.append(ulForFeeds);
  state.data.feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const liTitle = document.createElement('h3');
    liTitle.classList.add('h6', 'm-0');
    li.append(liTitle);
    liTitle.textContent = title;
    const cardText = document.createElement('p');
    cardText.classList.add('m-0', 'small', 'text-black-50');
    cardText.textContent = description;
    li.append(cardText);
    ulForFeeds.prepend(li);
  });
};

const renderPosts = (state, elements) => {
  const { posts } = elements;
  elements.posts.innerHTML = '';
  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');
  posts.append(postsCard);
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const postsTitle = document.createElement('h2');
  postsTitle.classList.add('card-title', 'h4');
  postsTitle.textContent = 'Посты';
  cardBody.prepend(postsTitle);
  postsCard.append(cardBody);
  const ulForPosts = document.createElement('ul');
  ulForPosts.classList.add('list-group', 'border-0', 'rounded-0');
  posts.append(ulForPosts);
  state.data.posts.forEach((post) => {
    const li = document.createElement('li');
    ulForPosts.append(li);
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const postTitle = document.createElement('a');
    postTitle.setAttribute('data-id', post.id);
    postTitle.setAttribute('href', `${post.link}`);
    if (state.uiState.viewedPostIds.has(post.id)) {
      postTitle.classList.add('fw-normal');
    } else {
      postTitle.classList.add('fw-bold');
    }
    postTitle.textContent = post.title;
    li.prepend(postTitle);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.innerHTML = 'Просмотр';
    li.append(button);
  });
};

const renderDisplayedPost = (state, { modalHeader, modalBody, modalHref }) => {
  const id = state.uiState.displayedPost;
  const posts = state.data.posts.filter((post) => post.id === id);
  const [{ description, link, title }] = posts;
  const element = document.querySelector(`a[data-id="${id}"]`);
  element.classList.remove('fw-bold');
  element.classList.add('fw-normal');
  modalHeader.textContent = title;
  modalBody.textContent = description;
  modalHref.setAttribute('href', link);
};

const renderAdding = ({ input, submit, feedback }) => {
  input.setAttribute('readonly', true);
  submit.classList.add('disabled');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-warning');
  feedback.textContent = 'Обработка запроса';
};

const renderState = (state, elements, i18nextInstance) => {
  switch (state.formState.status) {
    case 'adding':
      renderAdding(elements);
      break;

    case 'failed':
    {
      const errorMessage = i18nextInstance.t(`errors.${state.formState.error}`);
      renderErrors(errorMessage, elements);
      break;
    }

    case 'added':
    {
      const successMessage = i18nextInstance.t('success');
      renderFeeds(successMessage, state, elements);
      renderPosts(state, elements);
      break;
    }

    case 'updating':
      renderPosts(state, elements);
      break;

    default:
      break;
  }
};

const render = (state, elements, i18nextinstance, path) => {
  const { submit, input } = elements;
  submit.classList.remove('disabled');
  input.removeAttribute('readonly');
  switch (path) {
    case 'formState.status':
      renderState(state, elements, i18nextinstance);
      break;
    case 'uiState.displayedPost':
      renderDisplayedPost(state, elements);
      break;
    case 'posts':
      renderPosts(state, elements);
      break;
    case 'feeds':
      renderFeeds(state, elements, i18nextinstance);
      break;
    default:
      break;
  }
};

export default render;
