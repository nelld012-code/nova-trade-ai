import { cn } from "@/lib/utils";

type LogoProps = {
  /** "light" for light backgrounds, "dark" for navy backgrounds */
  tone?: "light" | "dark";
  withWordmark?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const markSize = { sm: "size-7", md: "size-9", lg: "size-11" } as const;
const textSize = { sm: "text-sm", md: "text-base", lg: "text-lg" } as const;

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-gradient-brand shadow-[var(--shadow-glow)]",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-[62%]" fill="none">
        <path d="M6 7h20v4.4h-7.4V26h-5.2V11.4H6V7Z" fill="white" fillOpacity="0.95" />
        <path
          d="M23.4 13.2l1.5 3.6 3.6 1.5-3.6 1.5-1.5 3.6-1.5-3.6-3.6-1.5 3.6-1.5 1.5-3.6Z"
          fill="white"
        />
      </svg>
    </span>
  );
}

export function Logo({ tone = "light", withWordmark = true, className, size = "md" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markSize[size]} />
      {withWordmark ? (
        <span
          className={cn(
            "font-extrabold tracking-tight",
            textSize[size],
            tone === "dark" ? "text-navy-foreground" : "text-foreground",
          )}
        >
          TRADE<span className="text-primary">NOVA</span>{" "}
          <span className={tone === "dark" ? "text-cyan" : "text-cyan"}>AI</span>
        </span>
      ) : null}
    </span>
  );
}
