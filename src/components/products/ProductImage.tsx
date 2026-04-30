import { Image } from "expo-image";
import { useState } from "react";
import { Text, View } from "react-native";

import { getInitialTileColor } from "@/src/features/stores/chainColors";
import { trustedEmoji } from "./emojiWhitelist";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

type Props = {
  imageUrl?: string | null;
  emoji?: string | null;
  name?: string;
  brand?: string;
  size?: number;
  emojiSize?: number;
  backgroundColor?: string;
  borderRadius?: number;
};

function resolveImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Backend now returns relative proxy paths (e.g. /v1/products/X/image);
  // older payloads (and persisted basket items) may still hold absolute
  // OFF CDN URLs. Pass absolute URLs through unchanged.
  if (raw.startsWith("/")) return `${API_BASE_URL}${raw}`;
  return raw;
}

function pickInitial(brand?: string, name?: string): string {
  const source = (brand ?? name ?? "").trim();
  if (!source) return "?";
  for (const ch of source) {
    if (/[\p{L}\p{N}]/u.test(ch)) return ch;
  }
  return source[0];
}

export default function ProductImage({
  imageUrl,
  emoji,
  name,
  brand,
  size = 44,
  emojiSize,
  backgroundColor = "transparent",
  borderRadius,
}: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveImageUrl(imageUrl);
  const showImage = !!resolved && !failed;
  const radius = borderRadius ?? Math.round(size / 8);
  const safeEmoji = trustedEmoji(emoji);
  const showInitial = !showImage && !safeEmoji;
  const initial = showInitial ? pickInitial(brand, name) : "";
  const tileColor = showInitial
    ? getInitialTileColor(brand ?? name ?? null)
    : backgroundColor;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: tileColor,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: resolved! }}
          style={{ width: size, height: size }}
          contentFit="contain"
          transition={150}
          cachePolicy="disk"
          onError={() => setFailed(true)}
        />
      ) : safeEmoji ? (
        <Text style={{ fontSize: emojiSize ?? Math.round(size * 0.6) }}>
          {safeEmoji}
        </Text>
      ) : (
        <Text
          style={{
            fontSize: Math.round(size * 0.5),
            color: "#fff",
            fontWeight: "700",
          }}
        >
          {initial}
        </Text>
      )}
    </View>
  );
}
