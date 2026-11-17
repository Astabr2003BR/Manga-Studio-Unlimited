export type ElementKind = 'panel' | 'text' | 'shape';

export interface MangaElement {
  id: string;
  kind: ElementKind;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fill?: string;
}

export interface MangaPage {
  id: string;
  width: number;
  height: number;
  elements: MangaElement[];
}

export interface MangaProject {
  id: string;
  schemaVersion: 1;
  title: string;
  createdAt: string;
  updatedAt: string;
  pages: MangaPage[];
}

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createProject(title: string): MangaProject {
  const now = new Date().toISOString();
  return {
    id: createId(),
    schemaVersion: 1,
    title: title.trim() || 'Meu mangá',
    createdAt: now,
    updatedAt: now,
    pages: [{
      id: createId(),
      width: 1080,
      height: 1350,
      elements: [
        { id: createId(), kind: 'panel', x: 24, y: 24, width: 1032, height: 420, fill: '#202b3b' },
        { id: createId(), kind: 'panel', x: 24, y: 468, width: 1032, height: 390, fill: '#26394b' },
        { id: createId(), kind: 'panel', x: 24, y: 882, width: 1032, height: 444, fill: '#172333' },
      ],
    }],
  };
}

export function isMangaProject(value: unknown): value is MangaProject {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<MangaProject>;
  return project.schemaVersion === 1
    && typeof project.id === 'string'
    && typeof project.title === 'string'
    && Array.isArray(project.pages)
    && project.pages.every((page) =>
      !!page
      && typeof page.id === 'string'
      && Number.isFinite(page.width)
      && Number.isFinite(page.height)
      && Array.isArray(page.elements)
      && page.elements.every((element) =>
        !!element
        && typeof element.id === 'string'
        && ['panel', 'text', 'shape'].includes(String(element.kind))
        && [element.x, element.y, element.width, element.height].every(Number.isFinite),
      ),
    );
}
