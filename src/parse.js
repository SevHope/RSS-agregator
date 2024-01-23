export default (rss) => {
  const parse = new DOMParser();
  const data = parse.parseFromString(rss, 'application/xml');
  const parseError = data.querySelector('parsererror');

  if (parseError) {
    const error = new Error(parseError.textContent);
    error.name = 'parseError';
    throw error;
  }

  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const posts = Array.from(
    data.querySelectorAll('item'),
    (item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }),
  );

  return { title, description, posts };
};
