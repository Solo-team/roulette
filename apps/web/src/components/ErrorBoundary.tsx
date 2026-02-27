import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(err: Error): void {
    console.error("[ErrorBoundary]", err);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center"
          style={{ background: "var(--bg)", color: "var(--text)" }}
        >
          <span style={{ fontSize: 48 }}>⚠️</span>
          <p className="text-lg font-bold text-white">Что-то пошло не так</p>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Перезагрузите страницу
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-3 rounded-2xl font-bold text-sm text-white btn-primary"
          >
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
