import { BorderBeam } from "./magicui/border-beam";
import { cn } from "~/lib/utils";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}

export function CtaButton({ href, children, variant = "primary", className }: Props) {
  const isExternal = /^https?:/.test(href);
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-6 py-3",
        "font-sans text-[0.92rem] tracking-tight transition-transform duration-300",
        "hover:-translate-y-0.5",
        variant === "primary" &&
          "bg-ink text-paper",
        variant === "ghost" &&
          "border border-rule bg-paper text-ink",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      <span aria-hidden="true" className="relative z-10 text-paper/70 transition-transform duration-300 group-hover:translate-x-1">→</span>
      <BorderBeam
        size={70}
        duration={6}
        colorFrom="#f26922"
        colorTo="#f26922"
        borderWidth={1.25}
      />
    </a>
  );
}
