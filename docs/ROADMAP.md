# Roadmap

## Fase 0 — Fundação
- [x] Repositório independente e carta do produto.
- [x] Estrutura inicial React + TypeScript + Vite.
- [x] Modelo versionado e persistência IndexedDB inicial.
- [x] Biblioteca local, criação de projeto, prévia SVG e backup JSON.
- [ ] Testes automatizados de armazenamento e importação executados em CI.

## Fase 1 — Editor de página
- [x] Adição de quadros e textos.
- [x] Movimentação por mouse/toque.
- [ ] Seleção, redimensionamento e snap.
- [ ] Camadas, ordem Z, visibilidade e bloqueio.
- [ ] Undo/redo e ferramentas de desenho.
- [ ] Balões, narração e SFX.

## Fase 2 — Criadores visuais
- [ ] Fichas de personagens e biblioteca de poses/expressões.
- [ ] Composição de partes visuais reutilizáveis.
- [ ] Editor de cenários e objetos.
- [ ] Máscaras, gradientes, sombras e iluminação procedural.
- [ ] Importação de assets com validação e sanitização.

## Fase 3 — Roteiro e gerador de composição
- [ ] Roteiro estruturado em cenas e falas.
- [ ] Sugestão determinística de layouts e quadros.
- [ ] Mapeamento manual de personagens e cenários.
- [ ] Reposicionamento de balões e elementos.
- [x] Diretriz: sem geração de imagem por IA.

## Fase 4 — Exportação e plataformas
- [ ] PNG/JPEG em resolução configurável.
- [ ] PDF de capítulo.
- [x] Backup JSON e restauração validada.
- [x] PWA shell com cache versionado e navegação network-first.
- [x] Configuração inicial do Capacitor Android.
- [x] Workflow para gerar APK debug como artefato do GitHub Actions.
- [ ] Build Android executado e APK validado em aparelho real.

## Critério de conclusão
Cada fase exige testes reproduzíveis, revisão de regressão e confirmação explícita antes de publicação ou geração de APK de distribuição.
