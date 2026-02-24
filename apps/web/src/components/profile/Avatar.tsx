import { useMemo } from "react";

interface AvatarProps {
  photoUrl: string | null;
  firstName: string;
  userId: string;
  size?: number;
}

function colorFromId(id: string): string {
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  const idx = Math.abs(parseInt(id.slice(-4), 10)) % colors.length;
  return colors[idx]!;
}

export function Avatar({ photoUrl, firstName, userId, size = 80 }: AvatarProps) {
  const initials = firstName.slice(0, 2).toUpperCase();
  const bg = useMemo(() => colorFromId(userId), [userId]);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={firstName}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold select-none"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}
