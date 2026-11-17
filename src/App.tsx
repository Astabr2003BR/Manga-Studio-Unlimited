import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react';
import { createId, createProject, isMangaProject } from './model';
import type { MangaElement, MangaProject } from './model';
import { deleteProject, listProjects, saveProject } from './storage';

const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

export default function App() {
  const [projects, setProjects] = useState<MangaProject[]>([]);
  const [active, setActive] = useState<MangaProject | null>(null);
  const [status, setStatus] = useState('Carregando projetos locais…');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number; pointerId: number } | null>(null);

  useEffect(() => {
    let alive = true;
    listProjects()
      .then((items) => {
        if (!alive) return;
        setProjects(items);
        setStatus('Armazenamento local pronto');
      })
      .catch((reason: unknown) => {
        if (alive) {
          setStatus('Armazenamento indisponível');
          setError(reason instanceof Error ? reason.message : 'Erro ao abrir os projetos.');
        }
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      const updated = { ...active, updatedAt: new Date().toISOString() };
      saveProject(updated)
        .then(() => {
          setProjects((current) => [updated, ...current.filter((item) => item.id !== updated.id)]);
          setStatus('Salvo neste dispositivo');
        })
        .catch((reason: unknown) => {
          setStatus('Falha ao salvar');
          setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o projeto.');
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [active]);

  const page = active?.pages[0] ?? null;
  const elementCount = useMemo(() => page?.elements.length ?? 0, [page]);

  async function refreshProjects() {
    const items = await listProjects();
    setProjects(items);
  }

  async function createNewProject() {
    const title = window.prompt('Nome do projeto:', 'Meu primeiro mangá');
    if (title === null) return;
    const project = createProject(title);
    try {
      await saveProject(project);
      await refreshProjects();
      setActive(project);
      setError('');
      setStatus('Projeto criado neste dispositivo');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao criar projeto.');
    }
  }

  function updateElements(next: MangaElement[]) {
    setActive((current) => current ? {
      ...current,
      pages: current.pages.map((item, index) => index === 0 ? { ...item, elements: next } : item),
    } : current);
  }

  function addPanel() {
    if (!page) return;
    const offset = (page.elements.length % 5) * 24;
    updateElements([...page.elements, {
      id: createId(), kind: 'panel', x: 60 + offset, y: 60 + offset,
      width: 480, height: 260, fill: '#283d55',
    }]);
  }

  function addText() {
    if (!page) return;
    const text = window.prompt('Texto do balão ou da narração:', 'Digite seu texto');
    if (!text?.trim()) return;
    updateElements([...page.elements, {
      id: createId(), kind: 'text', x: 100, y: 100 + page.elements.length * 18,
      width: 500, height: 90, text: text.trim(), fill: '#ffffff',
    }]);
  }

  function beginDrag(event: ReactPointerEvent<SVGGElement>, element: MangaElement) {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    dragRef.current = { id: element.id, offsetX: point.x - element.x, offsetY: point.y - element.y, pointerId: event.pointerId };
    svg.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveDraggedElement(event: ReactPointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    const matrix = event.currentTarget.getScreenCTM();
    if (!drag || !matrix || drag.pointerId !== event.pointerId) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    updateElement(drag.id, { x: Math.round(point.x - drag.offsetX), y: Math.round(point.y - drag.offsetY) });
  }

  function endDrag(event: ReactPointerEvent<SVGSVGElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function updateElement(id: string, patch: Partial<MangaElement>) {
    if (!page) return;
    updateElements(page.elements.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function exportProject() {
    if (!active) return;
    const blob = new Blob([JSON.stringify(active, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${active.title.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'manga'}.msu.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importProject(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setError('Arquivo acima do limite de 20 MB para importação inicial.');
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isMangaProject(parsed)) throw new Error('Estrutura ou versão do projeto inválida.');
      const imported = { ...parsed, id: createId(), title: `${parsed.title} (importado)`, updatedAt: new Date().toISOString() };
      await saveProject(imported);
      await refreshProjects();
      setActive(imported);
      setError('');
      setStatus('Cópia importada com novo identificador; original preservado');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível importar este arquivo.');
    }
  }

  async function removeProject(project: MangaProject) {
    if (!window.confirm(`Excluir “${project.title}” deste dispositivo? Exporte um backup antes, se necessário.`)) return;
    try {
      await deleteProject(project.id);
      if (active?.id === project.id) setActive(null);
      await refreshProjects();
      setStatus('Projeto excluído deste dispositivo');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falha ao excluir projeto.');
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">MS<span>U</span></div>
        <div className="brand-copy">
          <strong>Manga Studio Unlimited</strong>
          <small>Estúdio de criação local · sem IA generativa</small>
        </div>
        <span className="offline-pill">LOCAL-FIRST</span>
      </header>

      {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError('')} aria-label="Fechar aviso">×</button></div>}

      {!active ? (
        <section className="library-view">
          <div className="hero">
            <p className="eyebrow">SEU ESTÚDIO CRIATIVO</p>
            <h1>Crie seu próximo<br /><em>universo em mangá.</em></h1>
            <p>Desenhe, componha páginas e organize personagens e cenários. Seus projetos ficam neste dispositivo.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={createNewProject}>＋ Novo projeto</button>
              <button className="secondary-button" onClick={() => fileInput.current?.click()}>Importar projeto</button>
              <input ref={fileInput} type="file" accept=".json,.msu.json,application/json" hidden onChange={importProject} />
            </div>
          </div>
          <div className="section-heading"><div><p className="eyebrow">BIBLIOTECA</p><h2>Seus projetos</h2></div><span>{projects.length} projeto(s)</span></div>
          {projects.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">▧</div><strong>Nenhum projeto por enquanto</strong><p>Crie um projeto para começar. Ele será salvo localmente.</p></div>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <button className="project-open" onClick={() => { setActive(project); setError(''); }}>
                    <div className="project-cover"><span>MSU</span><b>{project.title}</b><small>{project.pages.length} página(s)</small></div>
                    <strong>{project.title}</strong><small>Atualizado em {new Date(project.updatedAt).toLocaleDateString('pt-BR')}</small>
                  </button>
                  <button className="delete-button" onClick={() => removeProject(project)} aria-label={`Excluir ${project.title}`}>Excluir</button>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="editor-view">
          <div className="editor-heading">
            <button className="back-button" onClick={() => { setActive(null); setError(''); }}>← Biblioteca</button>
            <div><p className="eyebrow">EDITOR DE PÁGINA</p><h1>{active.title}</h1></div>
            <button className="secondary-button compact" onClick={exportProject}>Exportar backup</button>
          </div>
          <div className="editor-layout">
            <aside className="tool-panel">
              <p className="eyebrow">COMPOSIÇÃO</p>
              <button onClick={addPanel}>▱ Adicionar quadro</button>
              <button onClick={addText}>T Adicionar texto</button>
              <p className="eyebrow tool-label">PRÓXIMAS ETAPAS</p>
              <div className="coming-soon">Camadas e pincéis<br />Personagens e poses<br />Cenários e iluminação</div>
              <small>{elementCount} elemento(s)</small>
            </aside>
            <div className="canvas-stage">
              <div className="page-canvas">
                <svg ref={svgRef} viewBox="0 0 1080 1350" role="img" aria-label="Prévia editável da primeira página" onPointerMove={moveDraggedElement} onPointerUp={endDrag} onPointerCancel={endDrag}>
                  <rect width="1080" height="1350" fill="#090d15" />
                  {page?.elements.map((element) => element.kind === 'text' ? (
                    <g key={element.id} onPointerDown={(event) => beginDrag(event, element)} className="canvas-element">
                      <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="22" fill="#f7f5ef" />
                      <foreignObject x={element.x + 12} y={element.y + 10} width={element.width - 24} height={element.height - 20}>
                        <div className="svg-text">{element.text}</div>
                      </foreignObject>
                    </g>
                  ) : (
                    <g key={element.id} onPointerDown={(event) => beginDrag(event, element)} className="canvas-element">
                      <rect x={element.x} y={element.y} width={element.width} height={element.height} fill={element.fill ?? '#26394b'} stroke="#f5f2e9" strokeWidth="10" />
                      <text x={element.x + 22} y={element.y + 42} fill="#d9e8f7" fontSize="24">QUADRO</text>
                    </g>
                  ))}
                </svg>
              </div>
              <p className="canvas-note">Prévia inicial · página 4:5 · 1080 × 1350</p>
            </div>
            <aside className="properties-panel">
              <p className="eyebrow">ELEMENTOS</p>
              {!page?.elements.length && <small>Adicione um quadro ou texto.</small>}
              {page?.elements.map((element, index) => (
                <div className="property-item" key={element.id}>
                  <strong>{element.kind === 'panel' ? `Quadro ${index + 1}` : element.kind === 'text' ? 'Texto' : 'Forma'}</strong>
                  <label>Posição X<input type="number" value={element.x} onChange={(event) => updateElement(element.id, { x: Number(event.target.value) })} /></label>
                  <label>Posição Y<input type="number" value={element.y} onChange={(event) => updateElement(element.id, { y: Number(event.target.value) })} /></label>
                  <button className="remove-element" onClick={() => updateElements(page.elements.filter((item) => item.id !== element.id))}>Remover elemento</button>
                </div>
              ))}
            </aside>
          </div>
        </section>
      )}
      <footer className="statusbar"><span className="status-dot" />{status}<span className="status-spacer" />Seus arquivos permanecem no dispositivo</footer>
    </main>
  );
}
