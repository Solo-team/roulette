import { useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { api } from "@/api/client";
import type { StarsInvoiceResponse } from "@roulette/shared";

interface DonateModalProps {
  onClose: () => void;
}

const STARS_PRESETS = [50, 100, 250, 500];
const TON_PRESETS = [0.5, 1, 5, 10];

export function DonateModal({ onClose }: DonateModalProps) {
  const [tab, setTab] = useState<"stars" | "ton">("stars");
  const [amount, setAmount] = useState("50");
  const [loading, setLoading] = useState(false);
  const [tonConnectUI] = useTonConnectUI();

  const presets = tab === "stars" ? STARS_PRESETS : TON_PRESETS;

  async function donateTon() {
    setLoading(true);
    try {
      const tx = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: "UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFd", // замени на свой адрес
            amount: String(Math.round(parseFloat(amount) * 1e9)),
          },
        ],
      });
      await api.post("/donate/ton", { txHash: tx.boc, amount });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function donateStars() {
    setLoading(true);
    try {
      const { invoiceUrl } = await api.post<StarsInvoiceResponse>("/donate/stars", {
        stars: parseInt(amount),
      });
      window.Telegram?.WebApp?.openInvoice(invoiceUrl, (status) => {
        if (status === "paid") onClose();
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 flex flex-col gap-5 animate-slide-up"
        style={{
          background: "linear-gradient(180deg, #12121f 0%, #0a0a14 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* handle */}
        <div className="w-10 h-1 rounded-full mx-auto" style={{ background: "rgba(255,255,255,0.15)" }} />

        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white leading-none">Поддержать</h2>
            <p className="text-white/30 text-xs mt-0.5">Помоги развитию проекта</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}
          >
            ✕
          </button>
        </div>

        {/* tabs */}
        <div
          className="flex p-1 rounded-2xl gap-1"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {(["stars", "ton"] as const).map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setAmount(t === "stars" ? "50" : "1");
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={
                  isActive
                    ? t === "stars"
                      ? { background: "linear-gradient(135deg,#F5C842,#C8960C)", color: "#1a0e00", boxShadow: "0 4px 12px rgba(245,200,66,0.3)" }
                      : { background: "linear-gradient(135deg,#0088CC,#005FA3)", color: "#fff", boxShadow: "0 4px 12px rgba(0,136,204,0.3)" }
                    : { color: "rgba(255,255,255,0.35)" }
                }
              >
                {t === "stars" ? "⭐" : "💎"} {t === "stars" ? "Stars" : "TON"}
              </button>
            );
          })}
        </div>

        {/* preset amounts */}
        <div className="grid grid-cols-4 gap-2">
          {presets.map((p) => {
            const isSelected = String(p) === amount;
            return (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="py-2 rounded-xl text-sm font-bold transition-all"
                style={
                  isSelected
                    ? tab === "stars"
                      ? { background: "rgba(245,200,66,0.2)", color: "var(--gold-light)", border: "1px solid rgba(245,200,66,0.4)" }
                      : { background: "rgba(0,136,204,0.2)", color: "#60b4e0", border: "1px solid rgba(0,136,204,0.4)" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
                }
              >
                {tab === "stars" ? `${p} ⭐` : `${p} 💎`}
              </button>
            );
          })}
        </div>

        {/* custom input */}
        <div className="relative">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-center text-2xl font-bold outline-none rounded-2xl py-3 transition-all"
            placeholder={tab === "stars" ? "Кол-во Stars" : "Сумма TON"}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
            }}
          />
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {tab === "stars" ? "⭐" : "TON"}
          </span>
        </div>

        {/* action button */}
        <button
          onClick={tab === "stars" ? donateStars : donateTon}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-40"
          style={
            tab === "stars"
              ? { background: "linear-gradient(135deg,#F5C842,#C8960C)", color: "#1a0e00", boxShadow: "0 6px 20px rgba(245,200,66,0.35)" }
              : { background: "linear-gradient(135deg,#0088CC,#005FA3)", color: "#fff", boxShadow: "0 6px 20px rgba(0,136,204,0.35)" }
          }
        >
          {loading
            ? "Отправка..."
            : tab === "stars"
            ? `Задонатить ${amount} ⭐`
            : `Отправить ${amount} 💎 TON`}
        </button>
      </div>
    </div>
  );
}
