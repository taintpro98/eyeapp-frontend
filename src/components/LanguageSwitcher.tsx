import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  variant?: "icon" | "inline";
};

export function LanguageSwitcher({
  className,
  variant = "icon",
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const setLang = (lng: string) => {
    void i18n.changeLanguage(lng);
  };

  const current = i18n.resolvedLanguage?.startsWith("vi") ? "vi" : "en";

  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Button
          type="button"
          size="sm"
          variant={current === "en" ? "default" : "outline"}
          onClick={() => setLang("en")}
        >
          {t("language.en")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={current === "vi" ? "default" : "outline"}
          onClick={() => setLang("vi")}
        >
          {t("language.vi")}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label={t("language.label")}
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang("en")}>
          {t("language.en")}
          {current === "en" ? " ✓" : ""}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("vi")}>
          {t("language.vi")}
          {current === "vi" ? " ✓" : ""}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
