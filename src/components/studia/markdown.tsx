import type { ReactNode } from "react";

function inline(text: string, key: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const k = `${key}-${i}`;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={k} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={k} className="rounded bg-primary-soft px-1.5 py-0.5 text-[0.92em] font-semibold text-primary">{part.slice(1, -1)}</code>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={k}>{part.slice(1, -1)}</em>;
    return <span key={k}>{part}</span>;
  });
}

/** Minimal, safe markdown: headings, bold, italic, inline code, bullet and numbered lists. */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((item, i) => <li key={i}>{inline(item, `li-${blocks.length}-${i}`)}</li>);
    blocks.push(list.ordered ? <ol key={blocks.length} className="list-decimal pl-5 space-y-1">{items}</ol> : <ul key={blocks.length} className="list-disc pl-5 space-y-1 marker:text-primary">{items}</ul>);
    list = null;
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const bullet = /^[-*] (.*)/.exec(line); const numbered = /^\d+\. (.*)/.exec(line);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]!);
      return;
    }
    flush();
    if (!line) return;
    if (line.startsWith("### ")) blocks.push(<h3 key={i} className="font-display font-bold text-[15px] text-foreground">{inline(line.slice(4), `h-${i}`)}</h3>);
    else blocks.push(<p key={i}>{inline(line, `p-${i}`)}</p>);
  });
  flush();
  return <div className="space-y-2.5">{blocks}</div>;
}
