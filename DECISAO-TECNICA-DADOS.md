# Decisão técnica — modo Dados

A versão atual não copia código do Google e não depende de APIs externas.

Uma biblioteca open source como Dice Box é possível, mas a versão Babylon requer npm, build e assets copiados para o projeto; a versão ThreeJS/Cannon também requer instalação, assets e uma camada de build. Para um site estático simples no GitHub Pages, isso aumenta o risco de integração e de manutenção.

Por isso, a versão v1.15 implementa uma mesa de dados local, com SVG/CSS/JavaScript próprios:

- D4, D6, D8, D10, D12 e D20;
- até 10 dados na mesa;
- resultados por dado e total;
- rolar e limpar;
- zero dependência de rede após o site carregar.

Se no futuro o Sortick passar a usar npm/Vite, a migração para uma biblioteca 3D pode ser reavaliada, com arquivos e licença incluídos no próprio repositório.
