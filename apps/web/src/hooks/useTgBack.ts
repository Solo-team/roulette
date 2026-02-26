import { useEffect, useRef } from "react";

/**
 * Показывает нативную кнопку «Назад» Telegram и вызывает onBack при нажатии.
 * При размонтировании — скрывает кнопку автоматически.
 */
export function useTgBack(onBack: () => void) {
  const ref = useRef(onBack);
  ref.current = onBack;

  useEffect(() => {
    const btn = window.Telegram?.WebApp?.BackButton;
    if (!btn) return;

    const handler = () => ref.current();
    btn.show();
    btn.onClick(handler);

    return () => {
      btn.offClick(handler);
      btn.hide();
    };
  }, []);
}
