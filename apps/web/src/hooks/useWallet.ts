import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useEffect } from "react";
import { api } from "@/api/client";
import { useStore } from "@/store/index";

export function useWallet() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { setWallet } = useStore();

  useEffect(() => {
    if (!wallet) return;
    const address = wallet.account.address;
    setWallet(address);
    api.patch("/profile/wallet", { walletAddress: address }).catch(console.error);
  }, [wallet?.account.address]);

  return { wallet, tonConnectUI };
}
