# Arquitetura

## Princípio local-first
O núcleo de edição e geração por composição não depende de rede. IndexedDB armazena projetos e metadados; arquivos exportados ficam sob controle do usuário. O shell PWA pode ser armazenado em cache, mas isso não substitui backup dos projetos.

## Camadas
- UI: React, responsiva e mobile-first.
- Domínio: tipos e operações puras sobre projetos, páginas e elementos.
- Persistência: IndexedDB com schema versionado e transações.
- Renderização: SVG para elementos vetoriais e Canvas 2D para ferramentas raster futuras.
- Plataforma: navegador/PWA primeiro; Capacitor Android depois.

## Segurança e integridade
- Importação JSON limitada por tamanho e validação estrutural.
- Importação sempre cria novo ID; nunca substitui automaticamente projeto existente.
- Não inserir HTML importado diretamente no DOM.
- SVG de terceiros deverá ser sanitizado ou rasterizado antes de renderização.
- Sem tokens, credenciais, analytics ou chamadas remotas obrigatórias.
- Exclusão de projeto exige confirmação; backup é responsabilidade do usuário.

## Persistência
Cada escrita deve ser serializada por projeto para evitar que salvamentos antigos sobrescrevam alterações novas. Migrações futuras precisam ser explícitas, testadas e reversíveis sempre que possível.
