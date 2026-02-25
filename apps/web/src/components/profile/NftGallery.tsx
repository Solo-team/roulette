import { useState } from "react";
import type { NftItem } from "@roulette/shared";

interface NftGalleryProps {
  nfts: NftItem[];
}

function NftCard({ nft, index }: { nft: NftItem; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden animate-fade-up cursor-pointer"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animationDelay: `${0.35 + index * 0.04}s`,
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "scale(1.04)" : undefined,
        boxShadow: hovered ? "0 8px 24px rgba(0,136,204,0.15)" : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {hovered && nft.attributes.length > 0 && (
          <div
            className="absolute inset-0 flex flex-col justify-end p-1.5 gap-0.5"
            style={{ background: "linear-gradient(to top, rgba(9,9,15,0.92) 60%, transparent)" }}
          >
            {nft.attributes.slice(0, 4).map((a) => (
              <div key={a.trait_type} className="flex items-center gap-1 leading-none">
                <span className="text-[8px] truncate shrink-0" style={{ color: "var(--text-muted)", maxWidth: "42%" }}>
                  {a.trait_type}
                </span>
                <span
                  className="text-[8px] font-semibold truncate"
                  style={{ color: "var(--accent)" }}
                >
                  {a.value}
                </span>
              </div>
            ))}
            {nft.attributes.length > 4 && (
              <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>+{nft.attributes.length - 4} ещё</span>
            )}
          </div>
        )}
      </div>

      <div className="p-1.5">
        <p className="text-white text-xs font-semibold truncate leading-tight">{nft.name}</p>
        {nft.collection && (
          <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text-dim)" }}>
            {nft.collection}
          </p>
        )}
        {nft.externalUrl && (
          <a
            href={nft.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] mt-0.5 block truncate"
            style={{ color: "var(--text-muted)" }}
            onClick={(e) => e.stopPropagation()}
          >
            getgems.io ↗
          </a>
        )}
      </div>
    </div>
  );
}

export function NftGallery({ nfts }: NftGalleryProps) {
  if (nfts.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-8 rounded-2xl animate-fade-up"
        style={{
          background: "var(--bg-card)",
          border: "1px dashed var(--border)",
          animationDelay: "0.35s",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "var(--bg-card-2)" }}
        >
          🖼
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--text-dim)" }}>NFT не найдены</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Подключи TON-кошелёк для отображения</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
          style={{ background: "var(--bg-card-2)" }}
        >
          🖼
        </div>
        <h3 className="font-bold text-sm text-white">NFT коллекция</h3>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
        >
          {nfts.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {nfts.map((nft, i) => (
          <NftCard key={nft.address} nft={nft} index={i} />
        ))}
      </div>
    </div>
  );
}
