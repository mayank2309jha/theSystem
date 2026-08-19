import { RANK_STYLES } from "../lib/ranks";

export default function RankPill({ rank, label }) {
  const style = RANK_STYLES[rank];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-display font-semibold ${style.border} ${style.text}`}
    >
      {label ? `${label} ` : ""}
      {rank}-Rank
    </span>
  );
}
