(() => {
  const officialHost = "sortick.com.br";
  if (location.hostname.endsWith("github.io")) {
    const target = `https://${officialHost}${location.pathname}${location.search}${location.hash}`;
    location.replace(target);
  }
})();
