# Sortick v1.4.2

Sortick é uma ferramenta web para criar sorteios simples, visuais e transparentes.

## Recursos atuais

- Sorteio por nomes
- Roleta circular
- Cartela de números
- Status Confirmado/Pendente
- Sortear apenas confirmados
- Remover vencedor após sortear
- Adicionar vários nomes
- Embaralhar lista
- Compartilhar resultado
- Baixar imagem do resultado
- PWA inicial
- Páginas Sobre, Privacidade e Termos
- Reportar erro por e-mail

## Deploy

Veja:

```text
DEPLOY.md
```

## Checklist de teste

Veja:

```text
CHECKLIST.md
```

## Observação

Esta versão está preparada para deploy não divulgado.

Ela contém:

```text
robots.txt
<meta name="robots" content="noindex, nofollow" />
```

Antes de lançar oficialmente, remova essas restrições para permitir indexação.


## Correção da v1.4.2

Esta versão volta para a base estável v1.3 e aplica apenas uma correção mínima:

- durante o sorteio, bloqueia somente:
  - Sortear apenas confirmados;
  - Remover vencedor após sortear.
- os outros controles não ficam bloqueados antes do sorteio.
- as duas opções bloqueadas exibem cursor de ação não permitida durante a contagem/giro.
