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
    title: title.trim().slice(0, 100) || 'Meu mangá',
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeColor(value: unknown): boolean {
  return value === undefined
    || (typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value));
}

export function isMangaProject(value: unknown): value is MangaProject {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== 1
    || typeof value.id !== 'string' || value.id.length > 100
    || typeof value.title !== 'string' || value.title.length > 100
    || typeof value.createdAt !== 'string' || typeof value.updatedAt !== 'string'
    || !Array.isArray(value.pages) || value.pages.length < 1 || value.pages.length > 200) return false;

  return value.pages.every((page) => {
    if (!isRecord(page)) return false;
    if (typeof page.id !== 'string' || !Number.isFinite(page.width) || !Number.isFinite(page.height)
      || (page.width as number) < 1 || (page.width as number) > 10000
      || (page.height as number) < 1 || (page.height as number) > 10000
      || !Array.isArray(page.elements) || page.elements.length > 500) return false;

    return page.elements.every((element) => {
      if (!isRecord(element)) return false;
      const validGeometry = [element.x, element.y, element.width, element.height]
        .every((number) => typeof number === 'number' && Number.isFinite(number) && Math.abs(number) <= 10000);
      const validKind = ['panel', 'text', 'shape'].includes(String(element.kind));
      const validText = element.text === undefined
        || (typeof element.text === 'string' && element.text.length <= 5000);
      return typeof element.id === 'string' && element.id.length <= 100
        && validGeometry && validKind && validText && isSafeColor(element.fill);
    });
  });
}
