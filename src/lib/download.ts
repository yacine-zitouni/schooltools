import { toast } from "sonner";

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast.success("Export prêt.", { description: name });
}

export function downloadText(name: string, content: string, type = "text/plain") {
  downloadBlob(name, new Blob([content], { type: `${type};charset=utf-8` }));
}
