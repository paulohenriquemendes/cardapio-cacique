# Imagens temporárias

`carne-de-sol.webp`: gerada com a ferramenta de imagens integrada, otimizada para WebP; não é fotografia real do Restaurante Cacique. O cadastro `products.image`, quando preenchido com a fotografia real, tem prioridade.

Prompt utilizado: fotografia culinária ilustrativa de carne de sol na manteiga da terra, pedaços dourados de carne em prato de cerâmica creme, sem acompanhamentos, mesa de madeira rústica, luz natural quente, composição central vista a 45 graus, sem texto, marca ou pessoas.

As novas ilustrações são geradas com a ferramenta integrada de imagens. O inventário de preparações está em `database/image-plan.json`, o registro dos nomes, descrições e prompts está em `manifest.json`, e `lib/illustrations.json` relaciona os IDs dos produtos aos arquivos WebP. Imagens são compartilhadas apenas entre produtos da mesma preparação e descrição; diferenças de tamanho e preço continuam no catálogo.

O escopo são os pratos, entradas, porções, adicionais, sanduíches, tapiocas, sobremesas e bolos. Bebidas e cafés possuem um inventário separado em `database/beverage-image-plan.json`, com ilustrações representativas por tipo. Não reproduzem marcas, embalagens ou todos os sabores selecionáveis. Não são fotografias reais do restaurante e não comprovam a apresentação, proporção ou montagem final de uma porção. A interface identifica as imagens como “Ilustração por IA”.

Para substituir por uma fotografia real, envie o arquivo ao Supabase Storage e preencha `products.image` com a URL. Esse campo tem prioridade sobre as ilustrações, sem mudar IDs, opções ou preços.

`node scripts/check-food-images.mjs` verifica a cobertura do inventário, a existência de todos os arquivos, formato e dimensões. `scripts/save-food-image.mjs` otimiza uma imagem já gerada e atualiza os índices; não chama uma API e não precisa de chave de geração.
