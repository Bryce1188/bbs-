import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  displayName: string;
  avatar?: string | null;
  className?: string;
  fallbackClassName?: string;
};

function getAvatarSrc(avatar?: string | null) {
  const value = (avatar ?? "").trim();
  return value.length ? value : "/avatars/placeholder-user.svg";
}

export function UserAvatar({ displayName, avatar, className, fallbackClassName }: UserAvatarProps) {
  const initial = displayName.trim().slice(0, 1) || "U";

  return (
    <Avatar className={className}>
      <AvatarImage src={getAvatarSrc(avatar)} alt={`${displayName} 的头像`} />
      <AvatarFallback className={cn(fallbackClassName)}>{initial}</AvatarFallback>
    </Avatar>
  );
}
