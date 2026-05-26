import {
  Briefcase,
  CircleHelp,
  Code2,
  Coffee,
  FolderOpen,
  Gamepad2,
  Heart,
  MessagesSquare,
  Network,
  PanelsTopLeft,
  Search,
  Sparkles
} from "lucide-react";

const iconMap = {
  Network,
  Sparkles,
  MessagesSquare,
  Gamepad2,
  Heart,
  Briefcase,
  FolderOpen,
  Code2,
  PanelsTopLeft,
  CircleHelp,
  Search,
  Coffee
};

export function BoardIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name as keyof typeof iconMap] ?? PanelsTopLeft;
  return <Icon className={className} />;
}
