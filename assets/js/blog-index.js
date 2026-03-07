(function () {
  function createButton(post, baseUrl) {
    const link = document.createElement('a');
    link.className = 'blog-nav-button';
    link.href = baseUrl.replace(/\/$/, '') + post.url;
    link.textContent = post.title;
    link.setAttribute('aria-label', post.title + ' を開く');

    const meta = document.createElement('span');
    meta.className = 'blog-nav-meta';
    meta.textContent = post.dateLabel;

    const wrapper = document.createElement('div');
    wrapper.className = 'blog-nav-item';
    wrapper.appendChild(link);
    wrapper.appendChild(meta);
    return wrapper;
  }

  async function init() {
    const script = document.getElementById('blog-index-script');
    const container = document.getElementById('blog-buttons');
    const empty = document.getElementById('blog-empty');

    if (!script || !container || !empty) {
      return;
    }

    const indexUrl = script.dataset.indexUrl;
    const baseUrl = script.dataset.baseUrl || '/';

    try {
      const response = await fetch(indexUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to load index: ' + response.status);
      }

      const posts = await response.json();
      if (!Array.isArray(posts) || posts.length === 0) {
        empty.hidden = false;
        return;
      }

      posts.forEach(function (post) {
        container.appendChild(createButton(post, baseUrl));
      });
    } catch (error) {
      console.error(error);
      empty.textContent = '記事一覧の読み込みに失敗しました。生成スクリプトを実行してください。';
      empty.hidden = false;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
