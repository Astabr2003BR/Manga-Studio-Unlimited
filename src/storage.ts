import type { MangaProject } from './model';

const DB_NAME = 'manga-studio-unlimited';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) {
      reject(new Error('Este navegador não oferece IndexedDB.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Não foi possível abrir o banco local.'));
    request.onblocked = () => reject(new Error('O banco local está bloqueado por outra aba.'));
  });
}

export async function listProjects(): Promise<MangaProject[]> {
  await writeQueue;
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve((request.result as MangaProject[]).sort(
        (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      ));
      request.onerror = () => reject(request.error ?? new Error('Falha ao listar projetos.'));
    });
  } finally {
    db.close();
  }
}

async function persistProject(project: MangaProject): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(project);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao salvar projeto.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Salvamento cancelado.'));
    });
  } finally {
    db.close();
  }
}

export function saveProject(project: MangaProject): Promise<void> {
  return enqueueWrite(() => persistProject(project));
}

export function deleteProject(id: string): Promise<void> {
  return enqueueWrite(async () => {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao excluir projeto.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Exclusão cancelada.'));
      });
    } finally {
      db.close();
    }
  });
}
