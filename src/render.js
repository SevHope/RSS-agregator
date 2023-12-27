const renderErrors = (message, elements) => {
  const { input, feedback } = elements;
  input.style.border = 'thick solid red';
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = message;
};

const renderFeeds = (message, state, elements) => {
  const { input, feedback, feeds } = elements;
  elements.feeds.innerHTML = '';
  input.value = '';
  input.focus();
  input.style.border = 'none';
  feedback.classList.remove('text-danger');
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
  state.form.feeds.forEach(({ title, description }) => {
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
  state.form.posts.forEach((post) => {
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

const renderDisplayedPost = (state, { modalHeader, modalBody, modalHref }, id) => {
  const posts = state.form.posts.filter((post) => post.id === id);
  console.log(posts, 'posts');
  const [{ description, link, title }] = posts;
  modalHeader.textContent = title;
  modalBody.textContent = description;
  modalHref.setAttribute('href', link);
};

const render = (state, elements, i18nextInstance, path) => {
  if (path === 'error') {
    const errorMessage = i18nextInstance.t(`errors.${state.error}`);
    renderErrors(errorMessage, elements);
  } if (path === 'form.feeds') {
    const successMessage = i18nextInstance.t('success');
    renderFeeds(successMessage, state, elements);
    renderPosts(state, elements);
  } if (path === 'form.posts' || path === 'uiState.viewedPostIds') {
    renderPosts(state, elements);
  } if (path === 'uiState.displayedPost') {
    renderDisplayedPost(state, elements, state.uiState.displayedPost);
  }
};

export default render;
