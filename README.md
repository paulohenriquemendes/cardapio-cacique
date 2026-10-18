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

Projeto criado: `cardapio-cacique`, endereço `https://cardapio-cacique.pages.dev`. Esta demonstração usa upload direto dos arquivos de `out/` pelo painel da Cloudflare. O repositório guarda o código, mas os pushes não disparam publicação automaticamente nesta configuração.

Se criar outro projeto Pages com integração Git, escolha a branch `main`, comando de build `npm run build` e diretório de saída `out`, configurando as variáveis de `.env.example`. A integração Git publica cada push automaticamente. O projeto atual continua usando upload direto.

Também é possível publicar `out/` por `npx wrangler pages deploy out --project-name cardapio-cacique`. Projetos criados por upload direto precisam de CI próprio para automação, pois não podem ser convertidos para integração Git.

## Atualizações

Para fotografias, use `/admin/`: nenhuma alteração de código, commit ou deploy é necessária. Para dados e preços (em centavos), edite `database/catalog.json`, mantendo os IDs, menus e categorias corretos. Faça commit e push para salvar o código; depois execute `npm run build` e publique `out/` novamente no projeto Pages. Alterações no painel do sistema completo não sincronizam automaticamente com este catálogo independente.

As fotografias dependem da disponibilidade e dos limites do Supabase. Se o serviço estiver indisponível, a consulta continua com o catálogo e ilustrações locais. Projetos gratuitos podem ser pausados por inatividade; a reativação é feita pelo dashboard Supabase.

## Verificação

`npm run build` verifica TypeScript e a exportação estática. `node scripts/check-photos.mjs` verifica Auth, upload, leitura pública, RLS, MIME, proteção de preços e restrição de garçom. Esse teste exige credenciais em `.local/photo-admin.json`, as credenciais de teste da equipe do sistema completo e a associação temporária do café 903 feita pelo painel. Após testar, restaure a ilustração pelo próprio painel. `.local/` e `.env.local` são ignorados pelo Git.

## Rotas

`/`, `/cafe-da-manha/`, `/refeicoes/` e as rotas de mesa 01–20 (`/mesa/12/refeicoes/`, por exemplo) são geradas como HTML. Links desconhecidos retornam 404.
