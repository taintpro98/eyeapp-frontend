import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-brand-primary" />
      ) : (
        <Moon className="h-5 w-5 text-text-secondary" />
      )}
    </Button>
  );
}
