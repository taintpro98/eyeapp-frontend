import { cn } from "@/lib/utils";

type LumiProps = {
  /** thinking: mở mắt, đang suy nghĩ — happy: nhắm mắt cười, thân thiện */
  mood?: "thinking" | "happy";
  className?: string;
  alt?: string;
};

/** Linh vật Lumi — chú cú mèo của ALumiEye */
export function Lumi({ mood = "thinking", className, alt }: LumiProps) {
  return (
    <img
      src={mood === "happy" ? "/brand/lumi-happy.png" : "/brand/lumi-thinking.png"}
      alt={alt ?? (mood === "happy" ? "Lumi nhắm mắt cười" : "Lumi mở mắt suy nghĩ")}
      aria-hidden={!alt}
      draggable={false}
      className={cn("select-none object-contain", className)}
    />
  );
}
