import * as d3 from 'd3';
import type { Selection, ZoomBehavior } from 'd3';
import { listarNotas } from '../services/notes';
import { listarProjetos } from '../services/projects';
import { COR_PROJETO_MAP } from '../types';
import { abrirNota } from './editor';
import { showView } from './render';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  color: string;
  r: number;
  isProject: boolean;
  notaId?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

let _simulation: d3.Simulation<GraphNode, GraphLink> | null = null;

export function renderGraph(): void {
  const container = document.getElementById('graphContainer');
  if (!container) return;

  container.innerHTML = '';
  if (_simulation) { _simulation.stop(); _simulation = null; }

  const notas = listarNotas();
  const projetos = listarProjetos();
  if (!projetos.length && !notas.length) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:14px">Nenhum dado para exibir. Crie projetos e notas primeiro.</div>';
    return;
  }

  const W = container.offsetWidth || 800;
  const H = container.offsetHeight || 500;

  const svg: Selection<SVGSVGElement, unknown, null, undefined> = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .style('background', 'var(--bg)') as Selection<SVGSVGElement, unknown, null, undefined>;

  const defs = svg.append('defs');
  defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -5 10 10')
    .attr('refX', 20).attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 6).attr('markerHeight', 6)
    .append('path')
    .attr('d', 'M 0,-5 L 10,0 L 0,5')
    .attr('fill', 'rgba(88,166,255,0.4)');

  const zoom: ZoomBehavior<SVGSVGElement, unknown> = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.2, 4])
    .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      g.attr('transform', event.transform.toString());
    });

  svg.call(zoom);

  const g = svg.append('g');

  const tooltip = d3.select(container)
    .append('div')
    .style('position', 'absolute')
    .style('background', 'var(--card)')
    .style('border', '1px solid var(--border)')
    .style('border-radius', '8px')
    .style('padding', '8px 12px')
    .style('font-size', '12px')
    .style('color', 'var(--text)')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('transition', 'opacity .15s')
    .style('max-width', '200px')
    .style('z-index', '100');

  const projNodes: GraphNode[] = projetos.map(p => ({
    id: p.id,
    label: p.icon + ' ' + p.nome,
    color: COR_PROJETO_MAP[p.cor] || '#58a6ff',
    r: Math.min(40, 22 + notas.filter(n => n.projeto === p.id).length * 2),
    isProject: true,
    x: W / 2 + (Math.random() - 0.5) * 200,
    y: H / 2 + (Math.random() - 0.5) * 200,
  }));

  const notaNodes: GraphNode[] = notas.map(n => ({
    id: 'nota_' + n.id,
    label: n.titulo,
    color: n.tipo === 'script' ? '#ffa657' : n.tipo === 'conversa' ? '#bc8cff' : '#3fb950',
    r: n.tipo === 'script' ? 9 : n.tipo === 'conversa' ? 8 : 7,
    isProject: false,
    notaId: n.id,
    x: W / 2 + (Math.random() - 0.5) * 300,
    y: H / 2 + (Math.random() - 0.5) * 300,
  }));

  const nodes: GraphNode[] = [...projNodes, ...notaNodes];

  const links: GraphLink[] = notas
    .filter(n => projetos.find(p => p.id === n.projeto))
    .map(n => ({ source: 'nota_' + n.id, target: n.projeto }));

  notas.forEach(n => {
    const matches = n.conteudo.match(/\[\[(.+?)\]\]/g) || [];
    matches.forEach(m => {
      const nome = m.slice(2, -2);
      const alvo = notas.find(x => x.titulo.toLowerCase() === nome.toLowerCase());
      if (alvo && alvo.id !== n.id) {
        links.push({ source: 'nota_' + n.id, target: 'nota_' + alvo.id });
      }
    });
  });

  _simulation = d3.forceSimulation<GraphNode, GraphLink>(nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(links)
      .id((d: GraphNode) => d.id)
      .distance((d: d3.SimulationLinkDatum<GraphNode>) => {
        const s = d.source as GraphNode;
        return s.isProject ? 120 : 80;
      })
      .strength(0.5))
    .force('charge', d3.forceManyBody<GraphNode>().strength((d: GraphNode) => d.isProject ? -400 : -120))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('collision', d3.forceCollide<GraphNode>().radius((d: GraphNode) => d.r + 8));

  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', 'rgba(88,166,255,0.2)')
    .attr('stroke-width', 1)
    .attr('marker-end', 'url(#arrowhead)');

  const node = g.append('g')
    .selectAll<SVGGElement, GraphNode>('g')
    .data(nodes)
    .join('g')
    .style('cursor', 'pointer')
    .call(
      d3.drag<SVGGElement, GraphNode>()
        .on('start', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
          if (!event.active) _simulation?.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on('end', (event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) => {
          if (!event.active) _simulation?.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

  node.append('circle')
    .attr('r', (d: GraphNode) => d.r)
    .attr('fill', (d: GraphNode) => d.color)
    .attr('stroke', (d: GraphNode) => d.isProject ? 'rgba(255,255,255,0.2)' : 'none')
    .attr('stroke-width', (d: GraphNode) => d.isProject ? 2 : 0)
    .style('filter', (d: GraphNode) => d.isProject ? `drop-shadow(0 0 8px ${d.color}88)` : 'none');

  node.filter((d: GraphNode) => d.isProject)
    .append('text')
    .text((d: GraphNode) => d.label)
    .attr('text-anchor', 'middle')
    .attr('dy', (d: GraphNode) => d.r + 14)
    .attr('fill', '#c9d1d9')
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .style('pointer-events', 'none');

  node
    .on('mouseenter', (_event: MouseEvent, d: GraphNode) => {
      const notasCount = notas.filter(n => n.projeto === d.id).length;
      const content = d.isProject
        ? `<strong>${d.label}</strong><br>${notasCount} nota${notasCount !== 1 ? 's' : ''}`
        : `<strong>${d.label}</strong>`;
      tooltip.html(content).style('opacity', '1');
    })
    .on('mousemove', (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      tooltip
        .style('left', (event.clientX - rect.left + 12) + 'px')
        .style('top', (event.clientY - rect.top - 10) + 'px');
    })
    .on('mouseleave', () => tooltip.style('opacity', '0'))
    .on('click', (event: MouseEvent, d: GraphNode) => {
      event.stopPropagation();
      if (!d.isProject && d.notaId) {
        abrirNota(d.notaId);
        showView('editor');
      }
    });

  _simulation.on('tick', () => {
    link
      .attr('x1', (d: GraphLink) => (d.source as GraphNode).x ?? 0)
      .attr('y1', (d: GraphLink) => (d.source as GraphNode).y ?? 0)
      .attr('x2', (d: GraphLink) => (d.target as GraphNode).x ?? 0)
      .attr('y2', (d: GraphLink) => (d.target as GraphNode).y ?? 0);

    node.attr('transform', (d: GraphNode) => `translate(${d.x ?? 0},${d.y ?? 0})`);
  });

  _simulation.on('end', () => fitGraph(svg, g, W, H, zoom));
  setTimeout(() => fitGraph(svg, g, W, H, zoom), 2500);

  const legenda = svg.append('g').attr('transform', 'translate(12,12)');
  const items = [
    { color: '#58a6ff', label: 'Projeto' },
    { color: '#3fb950', label: 'Nota' },
    { color: '#ffa657', label: 'Script' },
    { color: '#bc8cff', label: 'Conversa' },
  ];
  items.forEach((item, i) => {
    const row = legenda.append('g').attr('transform', `translate(0,${i * 20})`);
    row.append('circle').attr('r', 5).attr('cx', 5).attr('cy', 0).attr('fill', item.color);
    row.append('text').text(item.label).attr('x', 14).attr('dy', '0.35em').attr('fill', '#8b949e').attr('font-size', '11px');
  });

  svg.append('text')
    .text('Scroll para zoom · Arrastar para mover · Clique na nota para abrir')
    .attr('x', W / 2).attr('y', H - 10)
    .attr('text-anchor', 'middle')
    .attr('fill', '#484f58')
    .attr('font-size', '11px');
}

function fitGraph(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  g: Selection<SVGGElement, unknown, null, undefined>,
  W: number,
  H: number,
  zoom: ZoomBehavior<SVGSVGElement, unknown>
): void {
  const gNode = g.node() as SVGGElement | null;
  if (!gNode) return;
  const bounds = gNode.getBBox();
  if (!bounds.width || !bounds.height) return;
  const pad = 60;
  const scale = Math.min(0.9, (W - pad * 2) / bounds.width, (H - pad * 2) / bounds.height);
  const tx = W / 2 - scale * (bounds.x + bounds.width / 2);
  const ty = H / 2 - scale * (bounds.y + bounds.height / 2);
  svg.transition().duration(600)
    .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}
