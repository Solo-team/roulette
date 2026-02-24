import { create } from "zustand";
import type { UserProfile, NftItem, LeaderboardEntry } from "@roulette/shared";

interface AppState {
  profile: UserProfile | null;
  profileError: boolean;
  nfts: NftItem[];
  leaderboard: LeaderboardEntry[];
  setProfile: (p: UserProfile) => void;
  setProfileError: () => void;
  setNfts: (n: NftItem[]) => void;
  setLeaderboard: (l: LeaderboardEntry[]) => void;
  updateCoins: (coins: number) => void;
  setWallet: (address: string) => void;
}

export const useStore = create<AppState>((set) => ({
  profile: null,
  profileError: false,
  nfts: [],
  leaderboard: [],
  setProfile: (profile) => set({ profile, profileError: false }),
  setProfileError: () => set({ profileError: true }),
  setNfts: (nfts) => set({ nfts }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  updateCoins: (coins) => set((s) => ({ profile: s.profile ? { ...s.profile, coins } : null })),
  setWallet: (address) => set((s) => ({ profile: s.profile ? { ...s.profile, walletAddress: address } : null })),
}));
