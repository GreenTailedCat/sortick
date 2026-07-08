// Sortick production analytics bridge.
// Para ativar GA4, substitua o valor abaixo pelo Measurement ID real, por exemplo: G-XXXXXXXXXX.
const SORTICK_GA_MEASUREMENT_ID = "G-9D20N8TF1J";

window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }

(function initSortickAnalytics() {
  if (!SORTICK_GA_MEASUREMENT_ID) {
    window.sortickTrack = function sortickTrack() {};
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${SORTICK_GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", SORTICK_GA_MEASUREMENT_ID);

  window.sortickTrack = function sortickTrack(eventName, params = {}) {
    gtag("event", eventName, params);
  };
})();
