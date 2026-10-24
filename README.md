# Cardápio Cacique · consulta estática

Versão independente para apresentar os dois cardápios do Restaurante Cacique. Inclui fotos ilustrativas identificadas, categorias, busca, detalhes e seleção local de itens. O cliente chama o garçom presencialmente: nenhum pedido ou chamado é enviado.

O site é exportado como HTML/CSS/JavaScript estático e continua na Cloudflare Pages. O acesso `/admin/` usa Supabase Auth para gerenciar fotografias no Supabase Storage. Não há servidor Next.js, criação de pedidos nem segredos no site. O catálogo vem de `database/catalog.json`, preservando o conteúdo dos PDFs; as fotografias enviadas no painel substituem as ilustrações sem republicar o site. O sistema completo permanece no repositório `cacique-novos-cardapios`.

## Administração de fotografias

Acesse `https://cardapio-cacique.pages.dev/admin/` com a credencial fornecida separadamente. Escolha Café da manhã ou Refeições, busque por nome/código, filtre a categoria e clique em **Enviar foto** ou **Trocar foto**. Selecione JPG, PNG ou WebP de até 20 MB, confira a prévia e clique em **Salvar fotografia**. O navegador reduz a dimensão máxima para 1600 px e converte para JPEG antes de enviar (limite de 5 MB no armazenamento).

O cliente carrega as fotos ao abrir o cardápio, ao voltar à janela e a cada 60 segundos enquanto a página estiver visível. Para conferir imediatamente uma troca, atualize o cardápio. **Voltar à imagem ilustrativa** desfaz a associação; o arquivo anterior permanece guardado. Arquivos antigos não são apagados automaticamente, permitindo recuperação e evitando remoção acidental. No futuro pode-se limpar arquivos sem associação para economizar armazenamento.

Os usuários com `app_metadata.role = photo_editor` só gerenciam fotografias, sem alterar produtos, preços ou pedidos. As regras RLS protegem `product_photos`; o bucket `menu-photos` permite leitura pública e inserção autenticada para editores. Objetos existentes não podem ser sobrescritos por esse acesso. Cada troca cria uma URL nova, evitando cache de imagens antigas. O papel `admin` existente também pode gerenciar as fotos.

## Desenvolvimento

Node.js 22.12+ e npm. Execute `npm ci`, copie `.env.example` para `.env.local`, configure as três variáveis públicas e execute `npm run dev`; abra `http://localhost:3001`. Para gerar os arquivos estáticos, execute `npm run build`. A pasta `out/` é o site pronto para hospedagem. Nunca configure uma chave `service_role` ou `sb_secret_` nas variáveis públicas.

A migração em `supabase/migrations/20261018122642_photo_management.sql` cria a tabela, bucket e permissões sobre o banco do Cacique já existente, com os produtos e IDs cadastrados. Para outro projeto, importe antes o catálogo do sistema completo e depois execute esta migração no SQL Editor ou pelo fluxo de migrations do Supabase. Crie o usuário administrativo pelo dashboard/API de administração e atribua `app_metadata.role = photo_editor` por uma ferramenta de servidor. `NEXT_PUBLIC_PHOTO_ADMIN_EMAIL` define o e-mail associado ao apelido `admin`; a senha não fica no código.

## Cloudflare Pages gratuito

Projeto criado: `cardapio-cacique`, endereço `https://cardapio-cacique.pages.dev`. O workflow `.github/workflows/deploy.yml` publica pelo GitHub Actions a cada push na branch `main`, mantendo o projeto Pages existente. Também pode ser executado manualmente na aba **Actions → Publicar cardápio na Cloudflare → Run workflow**.

O fluxo instala as dependências pelo lockfile, compila com Node.js 24, verifica TypeScript, identifica o commit em `/deployment.json`, publica `out/` com Wrangler e verifica o commit e as rotas principais em produção. Se a compilação falhar, a publicação não é executada e a versão anterior continua online. Confira o resultado e os logs na aba **Actions** do repositório.

Variáveis do repositório (**Settings → Secrets and variables → Actions → Variables**): `CLOUDFLARE_ACCOUNT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave pública/publishable) e `NEXT_PUBLIC_PHOTO_ADMIN_EMAIL`. A credencial de publicação deve estar apenas no secret `CLOUDFLARE_API_TOKEN`, com permissão **Account → Cloudflare Pages → Edit** para a conta do Cacique. Nunca coloque esse token no código, em uma variável `NEXT_PUBLIC_` ou na pasta `public/`.

Também é possível publicar `out/` por `npx wrangler pages deploy out --project-name cardapio-cacique`. Projetos criados por upload direto precisam de CI próprio para automação, pois não podem ser convertidos para integração Git.

## GitHub Pages gratuito

Segunda hospedagem: `https://paulohenriquemendes.github.io/cardapio-cacique/`. O mesmo repositório público alimenta as duas hospedagens. O workflow `.github/workflows/github-pages.yml` gera uma exportação própria com `NEXT_PUBLIC_BASE_PATH=/cardapio-cacique` e publica a cada push na `main`. Em **Settings → Pages**, a origem deve ser **GitHub Actions**. Também é possível executar o workflow manualmente pela aba Actions.

As imagens locais, o manifesto e a navegação usam o prefixo do GitHub Pages; o build da Cloudflare continua sem prefixo. Não publique o mesmo `out/` nos dois destinos. Para testar o build secundário localmente, defina `NEXT_PUBLIC_BASE_PATH=/cardapio-cacique` antes de `npm run build`; remova a variável para gerar o build da Cloudflare. Os jobs usam as mesmas variáveis públicas do Supabase. A publicação no GitHub Pages usa o token temporário do próprio GitHub Actions, sem uma nova chave persistente.

Fotos enviadas pelo administrador ficam no Supabase e aparecem nos dois sites. As hospedagens não substituem um backup das fotos e não há troca automática entre os endereços em caso de indisponibilidade. Para manter um único QR Code ao trocar de provedor, conecte futuramente um domínio próprio.

## Atualizações

Para fotografias, use `/admin/` na Cloudflare ou `/cardapio-cacique/admin/` no GitHub Pages: nenhuma alteração de código, commit ou deploy é necessária. Para dados e preços (em centavos), edite `database/catalog.json`, mantendo os IDs, menus e categorias corretos. Faça commit e push na `main`; o GitHub Actions compila e publica a atualização automaticamente nos dois destinos, em workflows independentes. Alterações no painel do sistema completo não sincronizam automaticamente com este catálogo independente.

As fotografias dependem da disponibilidade e dos limites do Supabase. Se o serviço estiver indisponível, a consulta continua com o catálogo e ilustrações locais. Projetos gratuitos podem ser pausados por inatividade; a reativação é feita pelo dashboard Supabase.

## Verificação

`npm run build` verifica TypeScript e a exportação estática. `node scripts/check-photos.mjs` verifica Auth, upload, leitura pública, RLS, MIME, proteção de preços e restrição de garçom. Esse teste exige credenciais em `.local/photo-admin.json`, as credenciais de teste da equipe do sistema completo e a associação temporária do café 903 feita pelo painel. Após testar, restaure a ilustração pelo próprio painel. `.local/` e `.env.local` são ignorados pelo Git.

## Rotas

`/`, `/cafe-da-manha/`, `/refeicoes/` e as rotas de mesa 01–20 (`/mesa/12/refeicoes/`, por exemplo) são geradas como HTML. Links desconhecidos retornam 404.
