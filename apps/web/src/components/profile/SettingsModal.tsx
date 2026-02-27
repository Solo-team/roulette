import { createPortal } from "react-dom";
import { useSettings, type AppLang } from "@/hooks/useSettings";

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative shrink-0 transition-colors duration-200"
      style={{
        width: 51, height: 31,
        borderRadius: 999,
        background: on ? "#007AFF" : "rgba(255,255,255,0.15)",
      }}
    >
      <span
        className="absolute top-[2px] bg-white rounded-full transition-transform duration-200"
        style={{ left: 2, width: 27, height: 27, transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ── Radio ─────────────────────────────────────────────────────────────────────

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-colors"
      style={{ border: `2px solid ${checked ? "#007AFF" : "rgba(255,255,255,0.22)"}` }}
    >
      {checked && (
        <span className="w-3 h-3 rounded-full" style={{ background: "#007AFF" }} />
      )}
    </span>
  );
}

// ── SettingsModal ─────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

const LANGS: { value: AppLang; flag: string; label: string }[] = [
  { value: "ru", flag: "🇷🇺", label: "Русский" },
  { value: "en", flag: "🇬🇧", label: "English" },
];

export function SettingsModal({ onClose }: Props) {
  const { haptic, setHaptic, lang, setLang } = useSettings();

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        className="w-full px-0 pb-0 animate-slide-up"
        style={{
          background: "#1c1c22",
          borderRadius: "20px 20px 0 0",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-9 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <h2 className="text-[18px] font-bold text-white">Настройки</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:opacity-60"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Section: general ── */}
        <div className="mx-4 rounded-[16px] overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
          {/* Haptic */}
          <div className="flex items-center gap-3 px-4 py-[14px]">
            <span style={{ fontSize: 20 }}>👆</span>
            <span className="flex-1 text-[14px] font-semibold text-white">Тактильный отклик</span>
            <Toggle on={haptic} onChange={setHaptic} />
          </div>
        </div>

        {/* ── Section: language ── */}
        <div className="mx-4 mb-2">
          <p className="text-[11px] uppercase tracking-[0.12em] mb-2 px-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Язык
          </p>
          <div className="rounded-[16px] overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            {LANGS.map((l, i) => (
              <div key={l.value}>
                {i > 0 && <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.06)" }} />}
                <button
                  onClick={() => setLang(l.value)}
                  className="w-full flex items-center gap-3 px-4 py-[14px] transition-colors active:bg-white/[0.03]"
                >
                  <span style={{ fontSize: 20 }}>{l.flag}</span>
                  <span className="flex-1 text-[14px] font-semibold text-white text-left">{l.label}</span>
                  <Radio checked={lang === l.value} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>,
    document.body,
  );
}
