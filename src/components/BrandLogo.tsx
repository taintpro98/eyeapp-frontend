import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
};

/** Logo ALumiEye (Tím Mận trên nền Warm Cream) — giữ nền kem để hiển thị tốt cả light/dark */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      src="/brand/logo-mark.png"
      alt="ALumiEye"
      className={cn(
        "shrink-0 rounded-full bg-brand-cream object-cover ring-1 ring-brand-primary/15",
        className,
      )}
    />
  );
}
