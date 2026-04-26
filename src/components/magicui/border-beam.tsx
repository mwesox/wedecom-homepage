import { motion, type MotionStyle, type Transition } from "motion/react";
import { cn } from "~/lib/utils";

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  initialOffset?: number;
  borderWidth?: number;
}

export function BorderBeam({
  className,
  size = 60,
  delay = 0,
  duration = 6,
  colorFrom = "#f26922",
  colorTo = "#f26922",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      style={{
        borderWidth: `${borderWidth}px`,
        borderColor: "transparent",
      }}
    >
      <motion.div
        className={cn(
          "absolute aspect-square",
          "bg-[radial-gradient(circle_closest-side,var(--color-from),transparent_85%)]",
          className,
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
}
