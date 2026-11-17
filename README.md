# Manga Studio Unlimited

Estudio de criação de mangás para Web e Android, com prioridade mobile-first e funcionamento local.

## Princípios do projeto

- Sem IA generativa, modelos generativos ou APIs de IA.
- Sem créditos, mensalidades ou serviços pagos obrigatórios.
- Não depende de backend para criar, editar ou salvar projetos localmente.
- Projetos editáveis, com exportação e backup controlados pelo usuário.
- Web/PWA como primeira plataforma; Android via Capacitor em etapa própria.
- Não modificar nem compartilhar código com `Astabr2003BR/manga-studio-offline`.

## Motores do produto

### 1. Gerador por composição gráfica

Gera composições a partir de elementos visuais existentes ou criados pelo usuário: personagens, poses, expressões, roupas, cenários, objetos, iluminação, efeitos, quadros e lettering. Não sintetiza ilustrações inéditas a partir de texto.

### 2. Editor manual

Editor não destrutivo com páginas, quadros, elementos, camadas, desenho, pintura, transformação, texto, balões, undo/redo e zoom. A implementação será incremental e cada ferramenta terá testes próprios.

### 3. Criadores visuais

- Personagens: fichas, partes visuais combináveis, poses, expressões, roupas e acessórios.
- Cenários: ambientes, objetos, perspectiva, clima, luzes e efeitos.
- Biblioteca local: assets importados pelo usuário e elementos vetoriais próprios do aplicativo.

### 4. Roteiro e storyboard

Transforma roteiro estruturado em cenas, quadros e layouts editáveis. A automação organiza conteúdo; não inventa arte por IA.

## Arquitetura inicial

- React + TypeScript + Vite.
- IndexedDB para dados locais, com versionamento de schema.
- PWA para instalação e shell offline.
- Capacitor para empacotamento Android posteriormente.
- Exportação/importação de projetos com validação de formato e versão.
- Sem analytics, telemetria ou chamadas remotas obrigatórias.

## Limites explícitos

- Composição procedural não equivale a geração de arte por IA.
- Qualidade visual depende dos assets, desenhos e elementos disponíveis.
- Modelos locais de terceiros não fazem parte do escopo aprovado.
- Nenhum APK será compilado nem publicação/deploy será realizada sem autorização específica.

## Desenvolvimento

Consulte `docs/ROADMAP.md`, `docs/ARCHITECTURE.md` e `docs/QUALITY-GATES.md`.

## Licença

A definir antes de distribuir o produto. Não assumir licença de terceiros para assets ou fontes.
