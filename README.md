# Sortick v1.9-seo-modos

Versão preparada para abertura pública do domínio `sortick.com.br`.

## Mudanças

- Removido `noindex` das páginas HTML
- `robots.txt` agora permite indexação
- Adicionado `sitemap.xml`
- Adicionadas tags `canonical` apontando para `https://sortick.com.br`
- Adicionado redirecionamento da URL técnica do GitHub Pages para o domínio oficial
- Adicionada estrutura de Analytics em `js/analytics.js`
- Eventos básicos preparados:
  - criar sorteio
  - iniciar sorteio
  - copiar resultado
  - compartilhar resultado
  - baixar imagem

## Analytics

O Google Analytics está ativo com o ID:

```text
G-9D20N8TF1J
```

Eventos básicos preparados:

- criar sorteio
- iniciar sorteio
- copiar resultado
- compartilhar resultado
- baixar imagem

## Importante

Antes de AdSense, revise as páginas:

- Sobre
- Privacidade
- Termos

E confirme que o domínio está com HTTPS funcionando.


## v1.8.1-analytics

- Google Analytics ativado com o ID `G-9D20N8TF1J`.
- Política de Privacidade atualizada com menção ao uso do Google Analytics.


## v1.8.2-termos

- Ajustado o texto da seção “Mudanças futuras” nos Termos.
- Removida listagem específica de recursos futuros.
- Texto ficou mais geral, indicando que o Sortick pode mudar e que os termos podem ser atualizados.


## v1.8.3-termos-curto

- Texto da seção “Mudanças futuras” dos Termos reduzido para uma frase simples.


## v1.8.4-adsense

- Snippet do Google AdSense adicionado ao `<head>` das páginas públicas.
- Política de Privacidade atualizada com menção ao Google AdSense e anúncios.


## v1.8.5-urls-limpas

- Páginas públicas reorganizadas para URLs sem `.html`.
- Links internos atualizados para `/`, `/sobre/`, `/termos/`, `/privacidade/`, `/sorteio/`.
- Sitemap e canonical atualizados para URLs limpas.
- Redirects simples adicionados para links antigos `.html`.


## v1.8.6-corrigir-caminhos

- Corrigidos caminhos de CSS, JavaScript, ícones e manifest em páginas com URLs limpas.
- Páginas em `/sobre/`, `/termos/`, `/privacidade/`, `/sorteio/` e `/offline/` agora carregam assets pela raiz.


## v1.8.7-urls-limpas-final

- Adicionado script global para normalizar URLs antigas `.html`.
- Corrigidos links de cabeçalho e âncoras para `/`, `/#modos` e `/#criar`.
- Service worker ajustado para não prender páginas HTML antigas em cache.
- Redirects `.html` reforçados para URLs limpas.


## v1.8.8-corrigir-logo

- Corrigidos caminhos relativos de imagens/logo em páginas com URLs limpas.
- Logo dentro da página de sorteio agora carrega assets pela raiz do domínio.


## v1.9-seo-modos
- Adicionadas páginas fixas por modo para SEO:
  - `/sorteio-por-nomes/`
  - `/roleta/`
  - `/cartela-de-rifa/`
  - `/bingo/`
  - `/grupos/`
- Sitemap atualizado.
- Cada página recebeu title, meta description e canonical.
- Botões das páginas abrem a criação com o tipo de sorteio selecionado.
