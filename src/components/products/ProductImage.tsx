import { Image } from "expo-image";
import { useState } from "react";
import { Text, View } from "react-native";

type Props = {
  imageUrl?: string | null;
  emoji?: string | null;
  size?: number;
  emojiSize?: number;
  backgroundColor?: string;
  borderRadius?: number;
};

export default function ProductImage({
  imageUrl,
  emoji,
  size = 44,
  emojiSize,
  backgroundColor = "transparent",
  borderRadius,
}: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = !!imageUrl && !failed;
  const fallbackEmoji = emoji || "🛒";
  const radius = borderRadius ?? Math.round(size / 8);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl! }}
          style={{ width: size, height: size }}
          contentFit="contain"
          transition={150}
          cachePolicy="disk"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{ fontSize: emojiSize ?? Math.round(size * 0.6) }}>
          {fallbackEmoji}
        </Text>
      )}
    </View>
  );
}
