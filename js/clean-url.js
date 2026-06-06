// Sortick - URLs limpas
(function normalizeSortickUrl() {
  const path = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;

  const redirects = {
    "/index.html": "/",
    "/sobre.html": "/sobre/",
    "/termos.html": "/termos/",
    "/privacidade.html": "/privacidade/",
    "/offline.html": "/offline/",
    "/sorteio.html": "/sorteio/"
  };

  if (Object.prototype.hasOwnProperty.call(redirects, path)) {
    window.location.replace(`${redirects[path]}${search}${hash}`);
  }
})();
