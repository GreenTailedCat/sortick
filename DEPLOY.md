# Deploy não divulgado no GitHub Pages

Este guia é para testar o Sortick online sem lançar oficialmente.

## 1. Criar repositório

Crie um repositório no GitHub chamado:

```text
sortick
```

Não coloque senhas, chaves ou dados privados.

## 2. Enviar os arquivos

Os arquivos devem ficar na raiz do repositório:

```text
index.html
sorteio.html
sobre.html
privacidade.html
termos.html
offline.html
manifest.webmanifest
sw.js
robots.txt
assets/
icons/
css/
js/
CHECKLIST.md
DEPLOY.md
README.md
```

Não envie assim:

```text
sortick-v1-3/index.html
```

O `index.html` precisa ficar direto na raiz.

## 3. Ativar GitHub Pages

No repositório:

```text
Settings
Pages
Source: Deploy from a branch
Branch: main
Folder: /root
Save
```

O link ficará parecido com:

```text
https://seuusuario.github.io/sortick/
```

## 4. Não divulgar ainda

Esta versão tem:

```text
robots.txt
noindex
```

Isso pede para buscadores não indexarem o site. Não é segurança real; quem tiver o link ainda consegue acessar.

## 5. Quando for lançar oficialmente

Antes do lançamento público:

- remover `noindex` dos arquivos HTML;
- alterar `robots.txt` para permitir indexação;
- revisar Privacidade e Termos;
- conferir e-mail de contato;
- testar tudo de novo;
- só então apontar domínio próprio.
