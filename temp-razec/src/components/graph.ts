import { listarNotas } from '../services/notes';
import { listarProjetos } from '../services/projects';
import { COR_PROJETO_MAP } from '../types';
import { abrirNota } from './editor';

export function renderGraph(): void {
  const canvas = document.getElementById('graphCanvas') as HTMLCanvasElement | null;
  const container = document.getElementById('graphContainer');
  if (!canvas || !container) return;

  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const notas = listarNotas();
  const projetos = listarProjetos();
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const nodes = projetos.map((p, i) => {
    const angle = (i / projetos.length) * Math.PI * 2;
    const r = Math.min(W, H) * 0.3;
    return {
      id: p.id, label: p.icon + ' ' + p.nome.split('—')[0].trim(),
      x: W / 2 + Math.cos(angle) * r,
      y: H / 2 + Math.sin(angle) * r,
      size: 14 + notas.filter(n => n.projeto === p.id).length * 2,
      color: COR_PROJETO_MAP[p.cor] || '#58a6ff',
      isProject: true,
    };
  });

  const notaNodes = notas.slice(0, 20).map((n, i) => {
    const proj = nodes.find(nd => nd.id === n.projeto);
    const angle = (i / 20) * Math.PI * 2;
    const r = 60 + Math.random() * 80;
    const bx = proj ? proj.x : W / 2;
    const by = proj ? proj.y : H / 2;
    return {
      id: n.id, label: n.titulo.slice(0, 20),
      x: bx + Math.cos(angle) * r,
      y: by + Math.sin(angle) * r,
      size: 6, color: '#3fb950', parentId: n.projeto, isProject: false,
    };
  });

  ctx.strokeStyle = 'rgba(48,54,61,0.8)';
  ctx.lineWidth = 1;
  notaNodes.forEach(nd => {
    const parent = nodes.find(n => n.id === nd.parentId);
    if (parent) {
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      ctx.lineTo(nd.x, nd.y);
      ctx.stroke();
    }
  });

  const clickTargets: Array<{ id: string; x: number; y: number; size: number }> = [];

  nodes.forEach(nd => {
    ctx.fillStyle = nd.color;
    ctx.shadowColor = nd.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(nd.x, nd.y, nd.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e6edf3';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(nd.label, nd.x, nd.y + nd.size + 14);
    clickTargets.push(nd);
  });

  notaNodes.forEach(nd => {
    ctx.fillStyle = nd.color;
    ctx.beginPath();
    ctx.arc(nd.x, nd.y, nd.size, 0, Math.PI * 2);
    ctx.fill();
    clickTargets.push(nd);
  });

  canvas.onclick = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (const t of clickTargets) {
      const dx = mx - t.x;
      const dy = my - t.y;
      if (dx * dx + dy * dy <= (t.size + 4) * (t.size + 4)) {
        if (t.id.startsWith('n_')) abrirNota(t.id);
        break;
      }
    }
  };
}
