// Sortick Analytics
// Para ativar o Google Analytics 4, troque o valor abaixo pelo ID de medição.
// Exemplo: const SORTICK_GA_ID = "G-XXXXXXXXXX";
const SORTICK_GA_ID = "G-9D20N8TF1J";

(function setupSortickAnalytics() {
  if (!SORTICK_GA_ID) {
    window.sortickTrack = function noopSortickTrack() {};
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${SORTICK_GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", SORTICK_GA_ID, { anonymize_ip: true });

  window.sortickTrack = function sortickTrack(eventName, params = {}) {
    try {
      gtag("event", eventName, params);
    } catch {
      // Mantém o Sortick funcionando mesmo se o Analytics falhar.
    }
  };
})();
