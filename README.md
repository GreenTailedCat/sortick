# Sortick — Produção v1.25

Pacote preparado para o repositório oficial e domínio `sortick.com.br`.

## Inclui

- Rotas de produção na raiz do domínio.
- Remoção de bloqueios de indexação.
- `robots.txt` liberado.
- `sitemap.xml`.
- `ads.txt` para `pub-2517804276533396`.
- Política de Privacidade atualizada para Analytics/AdSense.
- PWA reativado.
- Redirecionamento de `github.io` para `sortick.com.br`.
- Chave local de produção `sortick_draws_v1`, com tentativa de migração de chaves antigas.

## Antes de publicar

- Confira se `pub-2517804276533396` é o ID correto da sua conta.
- Se quiser manter Google Analytics, coloque o Measurement ID em `/js/analytics.js`.
- Faça commit único no repositório oficial.


## Analytics

GA4 Measurement ID configurado:

```text
G-9D20N8TF1J
```

## Noindex aplicado

- `/sorteio/`: `noindex, follow`
- `/offline/`: `noindex, nofollow`
