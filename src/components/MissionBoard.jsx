import { useState } from "react";
import MissionCard from "./MissionCard";
import { MISSION_STATUSES, MISSION_TYPES } from "../data/seed";
import { RANK_ORDER } from "../lib/ranks";

const emptyForm = {
  company: "",
  role: "",
  type: MISSION_TYPES[0],
  difficulty: "C",
  deadline: "",
  notes: "",
};

export default function MissionBoard({ missions, onAdd, onSetStatus, onRemove }) {
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    onAdd({ ...form, company: form.company.trim(), role: form.role.trim() });
    setForm(emptyForm);
    setShowForm(false);
  }

  return (
    <div className="system-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-system-blue/70 uppercase mb-1">Mission Board</p>
          <h3 className="font-display text-lg font-bold text-white">Placement Quests</h3>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-3 py-1.5 text-sm font-display font-semibold rounded border border-system-blue text-system-blue hover:bg-system-blue hover:text-system-void transition-colors"
        >
          {showForm ? "Cancel" : "+ New Quest"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5 p-3 border border-system-border rounded bg-system-void/40">
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Company"
            className="bg-system-void/60 border border-system-border rounded px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-system-blue"
          />
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="Role"
            className="bg-system-void/60 border border-system-border rounded px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-system-blue"
          />
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="bg-system-void/60 border border-system-border rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-system-blue"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-system-void/60 border border-system-border rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-system-blue"
          >
            {MISSION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="bg-system-void/60 border border-system-border rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-system-blue"
          >
            {RANK_ORDER.map((r) => (
              <option key={r} value={r}>
                Rank {r}
              </option>
            ))}
          </select>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes"
            className="bg-system-void/60 border border-system-border rounded px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-system-blue"
          />
          <button
            type="submit"
            className="col-span-2 sm:col-span-3 px-3 py-1.5 text-sm font-display font-semibold rounded border border-system-blue text-system-blue hover:bg-system-blue hover:text-system-void transition-colors"
          >
            Deploy Quest
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MISSION_STATUSES.map((status) => {
          const items = missions.filter((m) => m.status === status);
          return (
            <div key={status}>
              <p className="text-xs font-display uppercase tracking-widest text-slate-500 mb-2 flex items-center justify-between">
                {status}
                <span className="text-slate-600">{items.length}</span>
              </p>
              <div className="space-y-2.5 min-h-[60px]">
                {items.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onSetStatus={onSetStatus}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
