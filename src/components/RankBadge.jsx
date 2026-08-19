import { RANK_STYLES } from "../lib/ranks";

export default function RankBadge({ rank, size = "md" }) {
  const style = RANK_STYLES[rank];
  const sizeClasses =
    size === "lg"
      ? "w-16 h-16 text-3xl"
      : size === "sm"
        ? "w-6 h-6 text-xs"
        : "w-10 h-10 text-lg";

  return (
    <div
      className={`font-display font-black flex items-center justify-center rounded-full border-2 ${style.border} ${style.text} ${style.glow} bg-system-void/60 ${sizeClasses}`}
    >
      {rank}
    </div>
  );
}
