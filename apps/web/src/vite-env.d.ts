/// <reference types="vite/client" />

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  initData: string;
  openInvoice(url: string, callback: (status: string) => void): void;
  openTelegramLink(url: string): void;
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
    selectionChanged(): void;
  };
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}
