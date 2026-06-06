// Redireciona a URL técnica do GitHub Pages para o domínio oficial.
(function redirectToOfficialDomain() {
  const officialHost = "sortick.com.br";
  const githubHost = "greentailedcat.github.io";
  const projectPath = "/sortick";

  if (window.location.hostname !== githubHost) return;

  let newPath = window.location.pathname;

  if (newPath === projectPath || newPath === `${projectPath}/`) {
    newPath = "/";
  } else if (newPath.startsWith(`${projectPath}/`)) {
    newPath = newPath.slice(projectPath.length);
  }

  window.location.replace(`https://${officialHost}${newPath}${window.location.search}${window.location.hash}`);
})();
