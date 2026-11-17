# Quality Gates

## Antes de cada entrega
- TypeScript sem erros.
- Build de produção concluído.
- Testes automatizados passando.
- Testar projeto vazio, projeto com várias páginas e dados inválidos.
- Testar importação duplicada sem sobrescrever o original.
- Testar falha de IndexedDB, quota excedida e armazenamento bloqueado.
- Testar interrupção de rede após o shell ter sido carregado.
- Testar viewport Android estreito, teclado aberto e rotação.
- Revisar XSS, importação, manipulação de arquivos e perda de dados.

## Evidências
Nunca marcar uma etapa como validada sem execução real. Quando não houver ambiente de execução, registrar explicitamente: TESTE SIMULADO — NÃO EXECUTADO.
