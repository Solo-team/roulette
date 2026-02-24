import { TonConnectButton } from "@tonconnect/ui-react";
import { useWallet } from "@/hooks/useWallet";

export function WalletButton() {
  const { wallet } = useWallet();

  return (
    <div className="flex flex-col items-center gap-2">
      <TonConnectButton />
      {wallet && (
        <span
          className="text-xs px-3 py-1 rounded-full font-mono"
          style={{
            background: "rgba(0,136,204,0.12)",
            border: "1px solid rgba(0,136,204,0.25)",
            color: "#60b4e0",
          }}
        >
          {wallet.account.address.slice(0, 6)}…{wallet.account.address.slice(-4)}
        </span>
      )}
    </div>
  );
}
