const parsePost = (post) => {
  const link = post.querySelector('link').textContent;
  const title = post.querySelector('title').textContent;
  const description = post.querySelector('description').textContent;
  return {
    link,
    title,
    description,
  };
};

const parse = (rss, url) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(rss, 'text/xml');
  const parseError = data.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }

  const feedTitle = data.querySelector('title').textContent;
  const feedDescription = data.querySelector('description').textContent;
  const feed = {
    title: feedTitle,
    description: feedDescription,
    link: url,
  };

  const posts = Array.from(data.querySelectorAll('item')).map((item) => parsePost(item));
  return { feed, posts };
};

export default parse;
