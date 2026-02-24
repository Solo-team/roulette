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
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        animationDelay: `${0.35 + index * 0.04}s`,
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "scale(1.04)" : undefined,
        boxShadow: hovered ? "0 8px 24px rgba(124,58,237,0.25)" : undefined,
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

        {/* Атрибуты — оверлей при наведении */}
        {hovered && nft.attributes.length > 0 && (
          <div
            className="absolute inset-0 flex flex-col justify-end p-1.5 gap-0.5"
            style={{ background: "linear-gradient(to top, rgba(10,5,20,0.92) 60%, transparent)" }}
          >
            {nft.attributes.slice(0, 4).map((a) => (
              <div key={a.trait_type} className="flex items-center gap-1 leading-none">
                <span className="text-white/40 text-[8px] truncate shrink-0" style={{ maxWidth: "42%" }}>
                  {a.trait_type}
                </span>
                <span
                  className="text-[8px] font-semibold truncate"
                  style={{ color: "#c4b5fd" }}
                >
                  {a.value}
                </span>
              </div>
            ))}
            {nft.attributes.length > 4 && (
              <span className="text-white/25 text-[8px]">+{nft.attributes.length - 4} ещё</span>
            )}
          </div>
        )}

        {/* Shimmer при отсутствии hover */}
        {!hovered && (
          <div
            className="absolute inset-0 opacity-0 transition-opacity"
            style={{ background: "linear-gradient(135deg,rgba(245,200,66,0.1),transparent)" }}
          />
        )}
      </div>

      <div className="p-1.5">
        <p className="text-white text-xs font-semibold truncate leading-tight">{nft.name}</p>
        {nft.collection && (
          <p className="text-[10px] truncate mt-0.5" style={{ color: "#a78bfa" }}>
            {nft.collection}
          </p>
        )}
        {nft.externalUrl && (
          <a
            href={nft.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] mt-0.5 block truncate"
            style={{ color: "rgba(255,255,255,0.2)" }}
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
          background: "rgba(255,255,255,0.025)",
          border: "1px dashed rgba(255,255,255,0.1)",
          animationDelay: "0.35s",
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          💎
        </div>
        <div className="text-center">
          <p className="text-white/50 text-sm font-medium">NFT не найдены</p>
          <p className="text-white/25 text-xs mt-0.5">Подключи TON-кошелёк для отображения</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ animationDelay: "0.35s" }}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
          style={{ background: "linear-gradient(135deg,#7C3AED,#4C1D95)" }}
        >
          💎
        </div>
        <h3 className="font-bold text-sm text-white">NFT коллекция</h3>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
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
