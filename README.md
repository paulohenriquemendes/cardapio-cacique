# Cardápio Cacique · consulta estática

Versão independente para apresentar os dois cardápios do Restaurante Cacique. Inclui fotos ilustrativas identificadas, categorias, busca, detalhes e seleção local de itens. O cliente chama o garçom presencialmente: nenhum pedido ou chamado é enviado.

Não contém login, rotas administrativas, API, banco de dados ou segredos. Os produtos vêm de `database/catalog.json`, preservando o conteúdo dos PDFs. As imagens estão em `public/images` e a identidade em `public/brand`. O sistema completo permanece no repositório `cacique-novos-cardapios`.

## Desenvolvimento

Node.js 22.12+ e npm. Execute `npm ci` e `npm run dev`; abra `http://localhost:3001`. Para gerar os arquivos estáticos, execute `npm run build`. A pasta `out/` é o site pronto para hospedagem.

## Cloudflare Pages gratuito

Projeto criado: `cardapio-cacique`, endereço `https://cardapio-cacique.pages.dev`. Esta demonstração usa upload direto dos arquivos de `out/` pelo painel da Cloudflare. O repositório guarda o código, mas os pushes não disparam publicação automaticamente nesta configuração.

Conecte este repositório ao Pages, escolha a branch `main`, comando de build `npm run build` e diretório de saída `out`. Nome sugerido: `cardapio-cacique`, conforme disponibilidade. Nenhuma variável de ambiente é necessária. A integração Git publica cada push automaticamente.

Também é possível publicar `out/` por `npx wrangler pages deploy out --project-name cardapio-cacique`. Projetos criados por upload direto precisam de CI próprio para automação, pois não podem ser convertidos para integração Git.

## Atualizações

Edite os produtos e preços (em centavos) em `database/catalog.json`, mantendo os IDs, menus e categorias corretos. Para substituir uma foto, coloque o arquivo em `public/images` e informe o caminho `/images/nome.webp` no campo `image` do produto. Faça commit e push para salvar o código; depois execute `npm run build` e publique `out/` novamente no projeto Pages. As alterações no painel do sistema completo não sincronizam automaticamente com este catálogo independente.

## Rotas

`/`, `/cafe-da-manha/`, `/refeicoes/` e as rotas de mesa 01–20 (`/mesa/12/refeicoes/`, por exemplo) são geradas como HTML. Links desconhecidos retornam 404.
