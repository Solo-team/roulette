/// <reference types="vite/client" />

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  initData: string;
  openInvoice(url: string, callback: (status: string) => void): void;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}
