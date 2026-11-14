import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { Plus, Download, ZoomIn, ZoomOut, Maximize2, Trash2, Pencil, GitBranchPlus, FileJson, FileImage, FileText, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageTitle } from "../page-title";
import { downloadBlob, downloadText } from "@/lib/download";

type MapNode = { id: string; label: string; parentId: string | null; x: number; y: number; branch: number };
const W = 1600, H = 1000, CX = 800, CY = 500;
const branchTokens = ["primary", "success", "reward", "rose"] as const;
const branchClass = ["mm-branch-primary", "mm-branch-success", "mm-branch-reward", "mm-branch-rose"];

const initial: MapNode[] = (() => {
  const tree: [string, string[]][] = [["Définition", ["Taux de variation", "Nombre dérivé f′(a)"]], ["Règles de calcul", ["(xⁿ)′ = n xⁿ⁻¹", "(u × v)′ = u′v + uv′"]], ["Interprétation", ["Pente de la tangente", "Vitesse instantanée"]], ["Applications", ["Sens de variation", "Extremums"]]];
  const nodes: MapNode[] = [{ id: "root", label: "Les dérivées", parentId: null, x: CX, y: CY, branch: 0 }];
  tree.forEach(([label, children], b) => {
    const angle = -Math.PI / 4 + (b * Math.PI) / 2 + (b >= 2 ? 0 : 0);
    const bx = CX + Math.cos(angle) * 290, by = CY + Math.sin(angle) * 210;
    const id = `b${b}`; nodes.push({ id, label, parentId: "root", x: bx, y: by, branch: b });
    children.forEach((c, i) => { const a = angle + (i - (children.length - 1) / 2) * 0.55; nodes.push({ id: `${id}-${i}`, label: c, parentId: id, x: bx + Math.cos(a) * 230, y: by + Math.sin(a) * 120, branch: b }); });
  });
  return nodes;
})();

export function MindMapPage() {
  const [nodes, setNodes] = useState<MapNode[]>(initial);
  const [selected, setSelected] = useState<string | null>("root");
  const [editing, setEditing] = useState<string | null>(null);
  const [scale, setScale] = useState(0.8);
  const scaleRef = useRef(0.8);
  const zoomRef = useRef<ReactZoomPanPinchRef>(null);
  const drag = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const byId = (id: string | null) => nodes.find(n => n.id === id);
  const current = byId(selected);

  function addChild(parentId = selected ?? "root") {
    const parent = byId(parentId) ?? nodes[0]!;
    const siblings = nodes.filter(n => n.parentId === parent.id);
    const grand = byId(parent.parentId);
    let angle: number, radius: number;
    if (!grand) { angle = siblings.length * 1.1 - Math.PI / 2; radius = 300; } else { angle = Math.atan2(parent.y - grand.y, parent.x - grand.x) + ((siblings.length % 2 ? 1 : -1) * Math.ceil(siblings.length / 2)) * 0.45; radius = 200; }
    const node: MapNode = { id: crypto.randomUUID(), label: "Nouvelle idée", parentId: parent.id, x: parent.x + Math.cos(angle) * radius, y: parent.y + Math.sin(angle) * radius * 0.7, branch: grand ? parent.branch : nodes.filter(n => n.parentId === "root").length % 4 };
    setNodes(n => [...n, node]); setSelected(node.id); setEditing(node.id);
  }
  function remove(id: string) {
    if (id === "root") return;
    const doomed = new Set([id]); let grew = true;
    while (grew) { grew = false; nodes.forEach(n => { if (n.parentId && doomed.has(n.parentId) && !doomed.has(n.id)) { doomed.add(n.id); grew = true; } }); }
    setNodes(n => n.filter(x => !doomed.has(x.id))); setSelected(byId(id)?.parentId ?? "root");
  }
  function recolor(id: string, branch: number) {
    const ids = new Set([id]); let grew = true;
    while (grew) { grew = false; nodes.forEach(n => { if (n.parentId && ids.has(n.parentId) && !ids.has(n.id)) { ids.add(n.id); grew = true; } }); }
    setNodes(n => n.map(x => ids.has(x.id) ? { ...x, branch } : x));
  }
  const rename = (id: string, label: string) => setNodes(n => n.map(x => x.id === id ? { ...x, label } : x));

  function onPointerDown(e: ReactPointerEvent, id: string) { if (editing === id) return; e.stopPropagation(); (e.target as Element).setPointerCapture(e.pointerId); drag.current = { id, x: e.clientX, y: e.clientY, moved: false }; setSelected(id); }
  function onPointerMove(e: ReactPointerEvent) {
    const d = drag.current; if (!d) return;
    const dx = (e.clientX - d.x) / scaleRef.current, dy = (e.clientY - d.y) / scaleRef.current;
    if (!d.moved && Math.hypot(dx, dy) < 3) return;
    d.moved = true; d.x = e.clientX; d.y = e.clientY;
    setNodes(n => n.map(x => x.id === d.id ? { ...x, x: Math.max(40, Math.min(W - 40, x.x + dx)), y: Math.max(30, Math.min(H - 30, x.y + dy)) } : x));
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing || !selected || (e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === "Tab") { e.preventDefault(); addChild(selected); }
      else if (e.key === "Enter") { e.preventDefault(); addChild(byId(selected)?.parentId ?? "root"); }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remove(selected); }
      else if (e.key === "F2") { e.preventDefault(); setEditing(selected); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  function buildSvg() {
    const css = getComputedStyle(document.documentElement);
    const color = (b: number) => css.getPropertyValue(`--${branchTokens[b]}`).trim();
    const soft = (b: number) => css.getPropertyValue(`--${branchTokens[b] === "primary" ? "primary-soft" : `${branchTokens[b]}-soft`}`).trim();
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const lines = nodes.filter(n => n.parentId).map(n => { const p = byId(n.parentId)!; const mx = (p.x + n.x) / 2; return `<path d="M${p.x},${p.y} C${mx},${p.y} ${mx},${n.y} ${n.x},${n.y}" fill="none" stroke="${color(n.branch)}" stroke-width="${p.parentId ? 2 : 3.5}" stroke-linecap="round"/>`; }).join("");
    const boxes = nodes.map(n => { const w = n.label.length * 8 + 36, h = n.parentId ? 40 : 60, root = !n.parentId; return `<rect x="${n.x - w / 2}" y="${n.y - h / 2}" width="${w}" height="${h}" rx="14" fill="${root ? color(0) : soft(n.branch)}" stroke="${color(n.branch)}" stroke-width="1.5"/><text x="${n.x}" y="${n.y + 5}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="700" font-size="${root ? 18 : 14}" fill="${root ? css.getPropertyValue("--primary-foreground").trim() : color(n.branch)}">${esc(n.label)}</text>`; }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="${css.getPropertyValue("--card").trim()}"/>${lines}${boxes}</svg>`;
  }
  function exportPng() {
    const img = new Image();
    const url = URL.createObjectURL(new Blob([buildSvg()], { type: "image/svg+xml" }));
    img.onload = () => { const c = document.createElement("canvas"); c.width = W * 2; c.height = H * 2; const ctx = c.getContext("2d")!; ctx.scale(2, 2); ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url); c.toBlob(b => b && downloadBlob("carte-mentale.png", b)); };
    img.src = url;
  }
  function outline(id = "root", depth = 0): string { const n = byId(id)!; return `${"  ".repeat(depth)}- ${n.label}\n${nodes.filter(c => c.parentId === id).map(c => outline(c.id, depth + 1)).join("")}`; }

  return <>
    <PageTitle title="Ta carte mentale" subtitle="Fais le lien entre tes idées. Glisse les bulles, double-clique pour renommer." action={<DropdownMenu><DropdownMenuTrigger asChild><Button><Download />Exporter</Button></DropdownMenuTrigger><DropdownMenuContent align="end">
      <DropdownMenuItem onClick={exportPng}><FileImage />Image PNG</DropdownMenuItem>
      <DropdownMenuItem onClick={() => downloadText("carte-mentale.svg", buildSvg(), "image/svg+xml")}><FileImage />Image vectorielle SVG</DropdownMenuItem>
      <DropdownMenuItem onClick={() => downloadText("carte-mentale.md", outline(), "text/markdown")}><FileText />Plan texte (Markdown)</DropdownMenuItem>
      <DropdownMenuItem onClick={() => downloadText("carte-mentale.json", JSON.stringify(nodes, null, 2), "application/json")}><FileJson />Données JSON</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu>} />
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-3 border-b">
        <Button size="sm" onClick={() => addChild()}><Plus />Ajouter une idée</Button>
        <Button size="sm" variant="outline" disabled={!current?.parentId} onClick={() => addChild(current?.parentId ?? "root")}><GitBranchPlus />Idée sœur</Button>
        <Button size="sm" variant="outline" disabled={!current} onClick={() => current && setEditing(current.id)}><Pencil />Renommer</Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" variant="outline" disabled={!current?.parentId}><Palette />Couleur</Button></DropdownMenuTrigger><DropdownMenuContent>{["Violet", "Vert", "Ambre", "Rose"].map((c, i) => <DropdownMenuItem key={c} onClick={() => current && recolor(current.id, i)}><span className={`w-3 h-3 rounded-full ${["bg-primary", "bg-success", "bg-reward", "bg-rose"][i]}`} />{c}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
        <Button size="sm" variant="ghost" className="text-destructive" disabled={!current?.parentId} onClick={() => current && remove(current.id)}><Trash2 />Supprimer</Button>
        <div className="ml-auto flex items-center gap-1"><Button variant="ghost" size="icon" aria-label="Zoom arrière" onClick={() => zoomRef.current?.zoomOut(0.3)}><ZoomOut /></Button><span className="text-[11px] tabular-nums w-10 text-center text-muted-foreground">{Math.round(scale * 100)}%</span><Button variant="ghost" size="icon" aria-label="Zoom avant" onClick={() => zoomRef.current?.zoomIn(0.3)}><ZoomIn /></Button><Button variant="ghost" size="icon" aria-label="Centrer la carte" onClick={() => zoomRef.current?.centerView(0.8)}><Maximize2 /></Button></div>
      </div>
      <div className="mind-canvas">
        <TransformWrapper ref={zoomRef} initialScale={0.8} minScale={0.3} maxScale={2.5} centerOnInit limitToBounds={false} doubleClick={{ disabled: true }} wheel={{ step: 0.08 }} panning={{ excluded: ["mm-node", "mm-input"] }} onTransform={(_, s) => { scaleRef.current = s.scale; setScale(s.scale); }}>
          <TransformComponent wrapperClass="!w-full !h-full" contentClass="mind-content">
            <div style={{ width: W, height: H }} className="relative" onPointerDown={() => { setSelected(null); setEditing(null); }}>
              <svg className="absolute inset-0 pointer-events-none" width={W} height={H}>{nodes.filter(n => n.parentId).map(n => { const p = byId(n.parentId); if (!p) return null; const mx = (p.x + n.x) / 2; return <path key={n.id} d={`M${p.x},${p.y} C${mx},${p.y} ${mx},${n.y} ${n.x},${n.y}`} className={`mm-link ${branchClass[n.branch]}`} strokeWidth={p.parentId ? 2 : 3.5} />; })}</svg>
              {nodes.map(n => <div key={n.id} role="button" tabIndex={0} aria-label={`Idée : ${n.label}`} aria-pressed={selected === n.id}
                className={`mm-node ${n.parentId ? branchClass[n.branch] : "mm-root"} ${n.parentId && !byId(n.parentId)?.parentId ? "mm-level-1" : ""} ${selected === n.id ? "selected" : ""}`}
                style={{ left: n.x, top: n.y }} onPointerDown={e => onPointerDown(e, n.id)} onPointerMove={onPointerMove} onPointerUp={() => { drag.current = null; }} onDoubleClick={e => { e.stopPropagation(); setEditing(n.id); }} onFocus={() => setSelected(n.id)}>
                {editing === n.id ? <input autoFocus aria-label="Nom de l’idée" className="mm-input" value={n.label} size={Math.max(6, n.label.length)} onPointerDown={e => e.stopPropagation()} onChange={e => rename(n.id, e.target.value)} onBlur={() => { if (!n.label.trim()) rename(n.id, "Idée"); setEditing(null); }} onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }} /> : n.label}
              </div>)}
            </div>
          </TransformComponent>
        </TransformWrapper>
        <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground bg-card/90 border rounded-lg px-3 py-2 hidden sm:block"><kbd>Tab</kbd> sous-idée · <kbd>Entrée</kbd> idée sœur · <kbd>F2</kbd> renommer · <kbd>Suppr</kbd> supprimer · molette pour zoomer</div>
      </div>
    </section>
  </>;
}
