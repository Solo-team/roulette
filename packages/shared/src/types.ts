// ─── User / Profile ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;            // TG user id (BigInt → string для JSON)
  username: string | null;
  firstName: string;
  photoUrl: string | null;
  coins: number;
  totalDonatedTon: number;
  walletAddress: string | null;
  lastClaimAt: string | null;  // ISO 8601
  createdAt: string;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string | null;
  firstName: string;
  photoUrl: string | null;
  coins: number;
}

// ─── NFT ─────────────────────────────────────────────────────────────────────

export interface NftAttribute {
  trait_type: string;
  value: string;
}

export interface NftItem {
  address: string;
  name: string;
  image: string;
  collection: string | null;
  attributes: NftAttribute[];
  externalUrl: string | null;
}

export interface NftClaimResult {
  coins: number;
  nextClaimAt: string;   // ISO 8601
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface StarsInvoiceResponse {
  invoiceUrl: string;
}

export interface TonDonateRequest {
  txHash: string;
  amount: string;        // в TON, строка чтобы не терять точность
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
}
