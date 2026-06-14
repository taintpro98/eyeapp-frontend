import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  Star,
  PieChart,
  Brain,
  BarChart2,
  CreditCard,
  Settings,
  ClipboardList,
  Target,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  TrendingUp,
  Zap,
  Star,
  PieChart,
  Brain,
  BarChart2,
  CreditCard,
  Settings,
  ClipboardList,
  Target,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? LayoutDashboard;
}
