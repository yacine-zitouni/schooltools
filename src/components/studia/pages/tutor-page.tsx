import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, BookOpenCheck, FileText, Paperclip, Plus, Square, Upload, X, Check, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fino } from "../fino";
import { Markdown } from "../markdown";
import { PageTitle } from "../page-title";
import { courseDocuments, tutorSuggestions, type CourseDocument } from "@/data/studia";
import { mockTutor, type TutorSource } from "@/services/mock";
import { toast } from "sonner";

type ChatMessage = { id: string; role: "user" | "assistant"; text: string; sources?: TutorSource[]; streaming?: boolean };
type Doc = CourseDocument & { status: "ready" | "analysing" };

const welcome: ChatMessage = { id: "welcome", role: "assistant", text: "Salut Yacine ! 👋 Je suis **Fino**, ton tuteur. Je m’appuie sur **tes documents de cours** pour t’expliquer les notions pas à pas.\n\nSur quoi travaillons-nous aujourd’hui ?" };

export function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "thinking" | "streaming">("idle");
  const [docs, setDocs] = useState<Doc[]>(courseDocuments.map(d => ({ ...d, status: "ready" })));
  const [preview, setPreview] = useState<TutorSource | null>(null);
  const [dragging, setDragging] = useState(false);
  const stopRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, status]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || status !== "idle") return;
    setInput(""); stopRef.current = false;
    setMessages(m => [...m, { id: crypto.randomUUID(), role: "user", text: question }]);
    setStatus("thinking");
    const reply = await mockTutor(question);
    const id = crypto.randomUUID();
    setMessages(m => [...m, { id, role: "assistant", text: "", streaming: true }]);
    setStatus("streaming");
    const tokens = reply.text.split(/(\s+)/);
    let shown = "";
    for (const token of tokens) {
      if (stopRef.current) break;
      shown += token;
      const current = shown;
      setMessages(m => m.map(msg => msg.id === id ? { ...msg, text: current } : msg));
      await new Promise(r => setTimeout(r, 18 + Math.random() * 30));
    }
    setMessages(m => m.map(msg => msg.id === id ? { ...msg, streaming: false, sources: reply.sources } : msg));
    setStatus("idle");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const added: Doc[] = Array.from(list).map(f => ({ id: crypto.randomUUID(), title: f.name, subject: "Mathématiques", pages: Math.max(1, Math.round(f.size / 40000)), excerpt: "Document importé pour la démonstration : son contenu sera utilisé pour répondre à tes questions.", status: "analysing" }));
    setDocs(d => [...d, ...added]);
    added.forEach(doc => setTimeout(() => { setDocs(d => d.map(x => x.id === doc.id ? { ...x, status: "ready" } : x)); toast.success(`« ${doc.title} » est prêt.`, { description: "Fino peut maintenant s’en servir." }); }, 1600));
  }
  function onDrop(e: DragEvent) { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }
  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); } }
  const busy = status !== "idle";

  return <>
    <PageTitle title="Ton tuteur IA" subtitle="Pas de question trop petite. On avance ensemble, à partir de tes cours." action={<Button variant="outline" className="bg-card text-xs" onClick={() => { setMessages([welcome]); setPreview(null); textareaRef.current?.focus(); }} disabled={busy}><Plus />Nouvelle conversation</Button>} />
    <div className="tutor-layout">
      <section className="panel flex flex-col min-h-[620px] overflow-hidden" onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        <header className="flex items-center gap-3 px-5 py-4 border-b">
          <span className="w-10 h-10 rounded-xl bg-primary-soft grid place-items-center overflow-hidden"><Fino className="w-12 h-12 mt-2" /></span>
          <div><h2 className="font-bold text-sm">Fino, ton tuteur</h2><span className="text-success text-[11px] flex items-center gap-1.5"><i className="w-1.5 h-1.5 rounded-full bg-success" />{status === "thinking" ? "Lit tes documents…" : status === "streaming" ? "Écrit…" : "Disponible pour toi"}</span></div>
          <span className="ml-auto subject-pill bg-primary-soft text-primary"><BookOpenCheck size={12} />{docs.filter(d => d.status === "ready").length} documents</span>
        </header>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 relative" aria-live="polite">
          {messages.map(m => m.role === "user"
            ? <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="chat-bubble-user">{m.text}</motion.div>
            : <motion.article key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 max-w-[92%]">
              <span className="w-8 h-8 shrink-0 rounded-full bg-primary-soft grid place-items-center overflow-hidden"><Fino className="w-10 h-10 mt-1.5" /></span>
              <div className="min-w-0 text-[13.5px] leading-relaxed text-foreground/90 pt-1">
                <Markdown text={m.text} />{m.streaming && <span className="stream-caret" aria-hidden="true" />}
                {m.sources && m.sources.length > 0 && <div className="flex flex-wrap gap-2 mt-3.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground self-center">Sources</span>
                  {m.sources.map((s, i) => <button key={i} type="button" onClick={() => setPreview(s)} className={`source-chip ${preview === s ? "active" : ""}`}><span className="source-index">{i + 1}</span>{s.title.replace(".pdf", "")} · p. {s.page}</button>)}
                </div>}
              </div>
            </motion.article>)}
          {status === "thinking" && <div className="flex gap-3 items-center"><span className="w-8 h-8 rounded-full bg-primary-soft grid place-items-center overflow-hidden"><Fino mood="focused" className="w-10 h-10 mt-1.5" /></span><div className="typing-dots" aria-label="Fino réfléchit"><span /><span /><span /></div></div>}
          <div ref={endRef} />
          <AnimatePresence>{dragging && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-3 rounded-2xl border-2 border-dashed border-primary bg-primary-soft/90 grid place-items-center text-primary font-semibold"><div className="text-center"><Upload className="mx-auto mb-2" />Dépose ton cours ici</div></motion.div>}</AnimatePresence>
        </div>
        {messages.length < 3 && <div className="px-4 sm:px-6 pb-3 flex flex-wrap gap-2">
          <span className="w-full text-[11px] text-muted-foreground flex items-center gap-1.5"><Lightbulb size={13} className="text-reward" />Quelques idées pour commencer</span>
          {tutorSuggestions.map(s => <Button key={s} variant="outline" size="sm" className="bg-card text-[11px] h-8 rounded-full" disabled={busy} onClick={() => void send(s)}>{s}</Button>)}
        </div>}
        <form className="chat-composer" onSubmit={e => { e.preventDefault(); void send(input); }}>
          <textarea ref={textareaRef} rows={2} aria-label="Ton message" placeholder="Pose ta question à Fino… (Maj + Entrée pour aller à la ligne)" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} className="w-full resize-none bg-transparent outline-none text-sm px-1 placeholder:text-muted-foreground" />
          <div className="flex items-center justify-between">
            <Button type="button" variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => fileRef.current?.click()}><Paperclip />Joindre un cours</Button>
            {status === "streaming"
              ? <Button type="button" size="icon" variant="outline" aria-label="Arrêter la réponse" onClick={() => { stopRef.current = true; }}><Square className="fill-current" /></Button>
              : <Button type="submit" size="icon" aria-label="Envoyer" disabled={busy || !input.trim()}>{status === "thinking" ? <Loader2 className="animate-spin" /> : <ArrowUp />}</Button>}
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        <AnimatePresence>{preview && <motion.section key="preview" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="panel p-5 border-primary/40">
          <div className="flex items-start gap-2 mb-3"><FileText size={17} className="text-primary mt-0.5" /><div className="flex-1 min-w-0"><h3 className="text-xs font-bold break-words">{preview.title}</h3><p className="text-[10px] text-muted-foreground">Page {preview.page}</p></div><Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Fermer l’extrait" onClick={() => setPreview(null)}><X /></Button></div>
          <blockquote className="text-xs leading-relaxed border-l-2 border-primary pl-3 bg-primary-soft/60 py-2 pr-2 rounded-r-md">« {preview.excerpt} »</blockquote>
        </motion.section>}</AnimatePresence>
        <section className="panel p-5">
          <h2 className="panel-title mb-1"><FileText size={17} className="text-primary" />Documents du cours</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Fino répond à partir de ces fichiers.</p>
          <ul className="space-y-1.5">{docs.map(d => <li key={d.id}><button type="button" onClick={() => d.status === "ready" && setPreview({ docId: d.id, title: d.title, page: 1, excerpt: d.excerpt })} className="doc-row">
            <span className="w-8 h-9 rounded-md bg-rose-soft text-rose grid place-items-center text-[8px] font-bold shrink-0">PDF</span>
            <span className="flex-1 min-w-0 text-left"><span className="block text-xs font-semibold truncate">{d.title}</span><span className="block text-[10px] text-muted-foreground">{d.subject} · {d.pages} pages</span></span>
            {d.status === "ready" ? <Check size={15} className="text-success" /> : <Loader2 size={15} className="animate-spin text-primary" />}
          </button></li>)}</ul>
          <label className={`dropzone mt-4 ${dragging ? "active" : ""}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
            <Upload size={20} className="text-primary" /><span className="font-semibold text-foreground text-xs">Glisse ton cours ici</span><span className="text-[10px]">ou clique pour parcourir · PDF, DOCX, images</span>
            <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,image/*" className="sr-only" onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />
          </label>
        </section>
      </aside>
    </div>
  </>;
}
