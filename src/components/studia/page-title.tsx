import type { ReactNode } from "react";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-extrabold">{title}</h1><p className="text-muted-foreground mt-2 text-sm">{subtitle}</p></div>{action}</div>;
}

export const toneClasses = {
  primary: { soft: "bg-primary-soft text-primary", solid: "bg-primary text-primary-foreground", border: "border-primary", text: "text-primary", fill: "bg-primary" },
  success: { soft: "bg-success-soft text-success", solid: "bg-success text-primary-foreground", border: "border-success", text: "text-success", fill: "bg-success" },
  reward: { soft: "bg-reward-soft text-reward", solid: "bg-reward text-primary-foreground", border: "border-reward", text: "text-reward", fill: "bg-reward" },
  rose: { soft: "bg-rose-soft text-rose", solid: "bg-rose text-primary-foreground", border: "border-rose", text: "text-rose", fill: "bg-rose" },
} as const;
export type Tone = keyof typeof toneClasses;
