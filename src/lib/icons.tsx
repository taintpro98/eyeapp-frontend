import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  Star,
  PieChart,
  Brain,
  CreditCard,
  Settings,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  TrendingUp,
  Zap,
  Star,
  PieChart,
  Brain,
  CreditCard,
  Settings,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? LayoutDashboard
}
