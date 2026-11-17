import { describe, expect, it } from 'vitest';
import { createProject, isMangaProject } from './model';

describe('modelo de projeto', () => {
  it('cria um projeto com página 4:5 de 1080 × 1350', () => {
    const project = createProject('Teste');
    expect(project.title).toBe('Teste');
    expect(project.schemaVersion).toBe(1);
    expect(project.pages).toHaveLength(1);
    expect(project.pages[0]).toMatchObject({ width: 1080, height: 1350 });
    expect(isMangaProject(project)).toBe(true);
  });

  it('usa título padrão quando o nome está vazio', () => {
    expect(createProject('   ').title).toBe('Meu mangá');
  });

  it('rejeita versão desconhecida, dimensões inválidas e cores não permitidas', () => {
    const project = createProject('Teste');
    expect(isMangaProject({ ...project, schemaVersion: 99 })).toBe(false);
    const invalidWidth = {
      ...project,
      pages: [{ ...project.pages[0], elements: [{ ...project.pages[0].elements[0], width: 'grande' }] }],
    };
    expect(isMangaProject(invalidWidth)).toBe(false);
    const invalidColor = {
      ...project,
      pages: [{ ...project.pages[0], elements: [{ ...project.pages[0].elements[0], fill: 'url(https://example.invalid)' }] }],
    };
    expect(isMangaProject(invalidColor)).toBe(false);
  });

  it('rejeita coleções acima dos limites de segurança', () => {
    const project = createProject('Teste');
    expect(isMangaProject({ ...project, pages: Array(201).fill(project.pages[0]) })).toBe(false);
    expect(isMangaProject({
      ...project,
      pages: [{ ...project.pages[0], elements: Array(501).fill(project.pages[0].elements[0]) }],
    })).toBe(false);
  });

  it('rejeita valores que não são objetos de projeto', () => {
    expect(isMangaProject(null)).toBe(false);
    expect(isMangaProject('projeto')).toBe(false);
  });
});
