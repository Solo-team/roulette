import { useEffect } from "react";
import { api } from "@/api/client";
import { useStore } from "@/store/index";
import type { UserProfile, NftItem } from "@roulette/shared";

const DEV_MOCK_PROFILE: UserProfile = {
  id: "123456789",
  firstName: "Алексей",
  username: "alexey_dev",
  photoUrl: null,
  coins: 24750,
  totalDonatedTon: 3.5,
  walletAddress: null,
  lastClaimAt: null,
  createdAt: new Date(Date.now() - 30 * 86400_000).toISOString(),
};

export function useProfile() {
  const { profile, profileError, nfts, setProfile, setProfileError, setNfts } = useStore();

  useEffect(() => {
    api
      .get<UserProfile>("/profile")
      .then(setProfile)
      .catch(() => {
        if (import.meta.env.DEV && !profile) {
          setProfile(DEV_MOCK_PROFILE);
        } else {
          setProfileError();
        }
      });
  }, []);

  useEffect(() => {
    if (!profile?.walletAddress) return;
    api.get<NftItem[]>(`/nft?address=${profile.walletAddress}`).then(setNfts).catch(console.error);
  }, [profile?.walletAddress]);

  return { profile, profileError, nfts };
}
