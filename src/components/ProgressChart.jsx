const START_DATE = new Date("2026-08-18T00:00:00Z");
const END_DATE = new Date("2026-11-30T00:00:00Z");
const TOTAL_DAYS = Math.round((END_DATE - START_DATE) / 86400000);

function dayIndex(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return Math.max(0, Math.min(TOTAL_DAYS, Math.round((d - START_DATE) / 86400000)));
}

function fmtShortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Hand-rolled inline SVG line chart — deliberately not a charting library
// dependency (pdf.js already added real weight; a 2-series line chart with
// a target-pace reference doesn't need one). One axis, two series
// distinguished by BOTH color and line style (solid vs dashed) so identity
// never rests on color alone, thin 2px lines, a small legend, and native
// <title> hover tooltips on data points.
export default function ProgressChart({ history, currentLevel, todayStr, title, subtitle }) {
  const W = 100;
  const H = 40;
  const padL = 4;
  const padR = 2;
  const padT = 3;
  const padB = 6;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const x = (dayIdx) => padL + (dayIdx / TOTAL_DAYS) * plotW;
  const y = (level) => padT + plotH - (Math.max(0, Math.min(100, level)) / 100) * plotH;

  const idealPoints = [
    { x: x(0), y: y(1) },
    { x: x(TOTAL_DAYS), y: y(100) },
  ];
  const idealPath = `M ${idealPoints[0].x} ${idealPoints[0].y} L ${idealPoints[1].x} ${idealPoints[1].y}`;

  const sortedHistory = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));
  const actualPoints = sortedHistory.map((h) => ({ ...h, px: x(dayIndex(h.date)), py: y(h.level) }));
  const actualPath = actualPoints.length > 0 ? "M " + actualPoints.map((p) => `${p.px} ${p.py}`).join(" L ") : "";

  const todayIdx = dayIndex(todayStr);
  const todayX = x(todayIdx);

  return (
    <div>
      {title && <p className="font-display text-sm font-bold text-white mb-0.5">{title}</p>}
      {subtitle && <p className="text-[11px] text-slate-500 mb-2">{subtitle}</p>}

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Progress from Level 1 to Level ${currentLevel}`}>
        {[0, 25, 50, 75, 100].map((g) => (
          <line key={g} x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} stroke="rgb(var(--sl-border-rgb) / 60%)" strokeWidth="0.15" />
        ))}

        <line x1={todayX} x2={todayX} y1={padT} y2={H - padB} stroke="rgb(var(--sl-emphasis-rgb) / 50%)" strokeWidth="0.2" strokeDasharray="0.6,0.6" />

        <path d={idealPath} fill="none" stroke="rgb(var(--sl-accent-2-rgb) / 70%)" strokeWidth="0.5" strokeDasharray="1.4,1" strokeLinecap="round" />

        {actualPath && <path d={actualPath} fill="none" stroke="var(--sl-accent)" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />}

        {actualPoints.map((p) => (
          <circle key={p.date} cx={p.px} cy={p.py} r="0.7" fill="var(--sl-accent)">
            <title>
              {fmtShortDate(p.date)}: Level {p.level}
            </title>
          </circle>
        ))}

        <circle cx={x(todayIdx)} cy={y(currentLevel)} r="1.1" fill="var(--sl-emphasis)" stroke="var(--sl-void)" strokeWidth="0.3">
          <title>Today ({fmtShortDate(todayStr)}): Level {currentLevel}</title>
        </circle>
      </svg>

      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
        <span>{fmtShortDate("2026-08-18")}</span>
        <span className="text-system-gold">Today: {fmtShortDate(todayStr)}</span>
        <span>{fmtShortDate("2026-11-30")}</span>
      </div>

      <div className="flex items-center gap-4 mt-2.5">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-4 h-0.5 bg-system-blue inline-block rounded-full" /> Actual
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-4 h-0.5 bg-system-violet inline-block rounded-full" style={{ opacity: 0.7 }} /> Even Pace to Level 100
        </span>
      </div>
    </div>
  );
}
