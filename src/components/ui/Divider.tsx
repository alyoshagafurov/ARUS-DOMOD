import {
  OrnamentBand,
  type OrnamentMotif,
} from "@/components/ornament/Ornament";
import { cn } from "@/lib/cn";

interface DividerProps {
  /** hairline — обычный разделитель; ornament — тканая кайма «ҳошия» */
  variant?: "hairline" | "ornament";
  motif?: OrnamentMotif;
  className?: string;
}

export function Divider({
  variant = "hairline",
  motif = "mavj",
  className,
}: DividerProps) {
  if (variant === "ornament") {
    return <OrnamentBand motif={motif} height={10} className={className} />;
  }

  return (
    <hr className={cn("w-full border-0 border-t border-hairline", className)} />
  );
}
