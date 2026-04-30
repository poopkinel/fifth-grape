import { fetchRemoteProductSearch } from "@/src/data/remote/marketApi";
import { useBasketStore } from "@/src/features/basket/store";
import { Colors, useTheme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dynamic-require expo-camera so this module loads even on dev clients
// built before the package was added. When the native module is absent
// we render DevTypedBarcodeFallback below — type a barcode by hand to
// exercise the rest of the scan flow. Becomes inert once a dev client
// with expo-camera baked in is installed.
type CameraViewProps = {
  style?: StyleProp<ViewStyle>;
  facing?: "back" | "front";
  barcodeScannerSettings?: { barcodeTypes?: string[] };
  onBarcodeScanned?: (event: { data: string }) => void;
};
type CamPerms = { granted: boolean; canAskAgain: boolean };
type UseCamPerms = () => readonly [
  CamPerms | null,
  () => Promise<CamPerms | null>,
];
let CameraView: React.ComponentType<CameraViewProps> | null = null;
let useCameraPermissions: UseCamPerms | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("expo-camera");
  CameraView = mod.CameraView;
  useCameraPermissions = mod.useCameraPermissions;
} catch {
  // native module missing — fallback path renders below
}

const SCAN_DEBOUNCE_MS = 1500;
const RECENT_SCANS_MAX = 5;
const SAME_BARCODE_LOCKOUT_MS = 5000;

type RecentScan = {
  barcode: string;
  productId?: string;
  name: string;
  notFound?: boolean;
};

export default function ScanScreen() {
  if (!CameraView || !useCameraPermissions) {
    return <DevTypedBarcodeFallback />;
  }
  return <CameraScanScreen />;
}

function CameraScanScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  // Non-null asserted: the parent ScanScreen guards against the missing-
  // module case before rendering this component.
  const [permission, requestPermission] = useCameraPermissions!();
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [showBasket, setShowBasket] = useState(false);
  const lastScanAt = useRef<number>(0);
  const lastBarcode = useRef<string | null>(null);

  const items = useBasketStore((s) => s.items);
  const addItem = useBasketStore((s) => s.addItem);
  const increaseQuantity = useBasketStore((s) => s.increaseQuantity);
  const decreaseQuantity = useBasketStore((s) => s.decreaseQuantity);
  const clearBasket = useBasketStore((s) => s.clearBasket);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const itemsByProductId = useMemo(
    () => new Map(items.map((i) => [i.productId, i])),
    [items],
  );

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      const now = Date.now();
      if (now - lastScanAt.current < SCAN_DEBOUNCE_MS) return;
      if (
        data === lastBarcode.current &&
        now - lastScanAt.current < SAME_BARCODE_LOCKOUT_MS
      )
        return;
      lastScanAt.current = now;
      lastBarcode.current = data;

      let product;
      try {
        const results = await fetchRemoteProductSearch(data, 1);
        product = results[0];
      } catch {
        // network error → behave like not-found; user can retry by re-scanning
      }

      if (!product) {
        setRecentScans((prev) =>
          [
            { barcode: data, name: t("scan.notFound"), notFound: true },
            ...prev.filter((s) => s.barcode !== data),
          ].slice(0, RECENT_SCANS_MAX),
        );
        return;
      }

      addItem({
        productId: product.productId,
        name: product.name,
        brand: product.brand,
        unit: product.unit,
        barcode: product.barcode,
        emoji: product.emoji,
        imageUrl: product.imageUrl,
      });
      setRecentScans((prev) => {
        const filtered = prev.filter((s) => s.productId !== product.productId);
        return [
          {
            barcode: data,
            productId: product.productId,
            name: product.name,
          },
          ...filtered,
        ].slice(0, RECENT_SCANS_MAX);
      });
    },
    [addItem, t],
  );

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: theme.textPrimary,
              textAlign: "auto",
            }}
          >
            {t("scan.permissionTitle")}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              textAlign: "auto",
              lineHeight: 22,
            }}
          >
            {t("scan.permissionBody")}
          </Text>
          <View style={{ gap: 8, marginTop: 16 }}>
            <TouchableOpacity
              onPress={
                permission.canAskAgain
                  ? () => requestPermission()
                  : () => Linking.openSettings()
              }
              style={{
                backgroundColor: theme.accent,
                padding: 14,
                borderRadius: 14,
              }}
            >
              <Text
                style={{ color: "white", textAlign: "center", fontWeight: "700" }}
              >
                {permission.canAskAgain
                  ? t("scan.permissionGrant")
                  : t("scan.permissionOpenSettings")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 14 }}
            >
              <Text
                style={{
                  color: theme.textSecondary,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {t("scan.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const CamView = CameraView!;
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CamView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <SafeAreaView
        edges={["top"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        pointerEvents="box-none"
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 12,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={pillStyle}>
            <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
              {t("scan.done")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowBasket(true)}
            style={[pillStyle, { flexDirection: "row", gap: 6 }]}
          >
            <Ionicons name="cart-outline" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
              {totalCount}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "70%",
            aspectRatio: 1.6,
            borderColor: "rgba(255,255,255,0.85)",
            borderWidth: 2,
            borderRadius: 12,
          }}
        />
        <Text
          style={{
            marginTop: 16,
            color: "white",
            fontSize: 14,
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          {t("scan.hint")}
        </Text>
      </View>

      <SafeAreaView
        edges={["bottom"]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        pointerEvents="box-none"
      >
        {recentScans.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingVertical: 12,
              gap: 8,
            }}
          >
            {recentScans.map((scan) => {
              const item = scan.productId
                ? itemsByProductId.get(scan.productId)
                : undefined;
              const qty = item?.quantity ?? 0;
              const isMissing = scan.notFound || !item;
              return (
                <View
                  key={`${scan.barcode}-${scan.productId ?? "na"}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isMissing
                      ? "rgba(239, 68, 68, 0.92)"
                      : "rgba(16, 185, 129, 0.92)",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "600",
                      maxWidth: 200,
                    }}
                    numberOfLines={1}
                  >
                    {scan.name}
                    {!isMissing && qty > 1 ? ` × ${qty}` : ""}
                  </Text>
                  {!isMissing && item ? (
                    <TouchableOpacity
                      onPress={() => decreaseQuantity(item.id)}
                      hitSlop={8}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: "rgba(255,255,255,0.25)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>

      <Modal
        visible={showBasket}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBasket(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setShowBasket(false)}
        >
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "70%",
            }}
          >
            <SafeAreaView edges={["bottom"]}>
              <View
                style={{
                  padding: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: theme.textPrimary,
                    textAlign: "auto",
                  }}
                >
                  {t("list.yourList")}
                </Text>
                {items.length > 0 ? (
                  <TouchableOpacity
                    onPress={clearBasket}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: theme.statBg,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: 13,
                        fontWeight: "700",
                      }}
                    >
                      {t("list.clearAll")}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <ScrollView
                contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 8 }}
              >
                {items.length === 0 ? (
                  <Text
                    style={{
                      color: theme.textSecondary,
                      textAlign: "center",
                      padding: 24,
                    }}
                  >
                    {t("scan.basketEmpty")}
                  </Text>
                ) : (
                  items.map((it) => (
                    <View
                      key={it.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: theme.card,
                        borderWidth: 1,
                        borderColor: theme.cardBorder,
                        gap: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: theme.textPrimary,
                            fontWeight: "600",
                            textAlign: "auto",
                          }}
                          numberOfLines={1}
                        >
                          {it.name}
                        </Text>
                        {it.brand ? (
                          <Text
                            style={{
                              color: theme.textMuted,
                              fontSize: 12,
                              textAlign: "auto",
                            }}
                            numberOfLines={1}
                          >
                            {it.brand}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => decreaseQuantity(it.id)}
                          hitSlop={8}
                          style={qtyBtnStyle(theme)}
                        >
                          <Ionicons
                            name="remove"
                            size={18}
                            color={theme.textPrimary}
                          />
                        </TouchableOpacity>
                        <Text
                          style={{
                            minWidth: 18,
                            textAlign: "center",
                            fontWeight: "700",
                            color: theme.textPrimary,
                          }}
                        >
                          {it.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => increaseQuantity(it.id)}
                          hitSlop={8}
                          style={qtyBtnStyle(theme)}
                        >
                          <Ionicons
                            name="add"
                            size={18}
                            color={theme.textPrimary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DevTypedBarcodeFallback() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const items = useBasketStore((s) => s.items);
  const addItem = useBasketStore((s) => s.addItem);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ kind: "ok" | "err"; line: string }[]>([]);
  const submitting = useRef(false);

  const submit = async () => {
    const data = input.trim();
    if (!data || submitting.current) return;
    submitting.current = true;
    try {
      const results = await fetchRemoteProductSearch(data, 1);
      const product = results[0];
      if (!product) {
        setLog((l) =>
          [{ kind: "err" as const, line: `${data} — ${t("scan.notFound")}` }, ...l].slice(0, 12),
        );
      } else {
        addItem({
          productId: product.productId,
          name: product.name,
          brand: product.brand,
          unit: product.unit,
          barcode: product.barcode,
          emoji: product.emoji,
          imageUrl: product.imageUrl,
        });
        setLog((l) =>
          [{ kind: "ok" as const, line: product.name }, ...l].slice(0, 12),
        );
      }
    } catch {
      setLog((l) =>
        [{ kind: "err" as const, line: `${data} — error` }, ...l].slice(0, 12),
      );
    } finally {
      submitting.current = false;
      setInput("");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={{ color: theme.accent, fontWeight: "700", fontSize: 16 }}>
              {t("scan.done")}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="cart-outline" size={18} color={theme.textPrimary} />
            <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
              {totalCount}
            </Text>
          </View>
        </View>

        <View
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: theme.warningBg,
            borderWidth: 1,
            borderColor: theme.warningBorder,
          }}
        >
          <Text
            style={{
              color: theme.warningTextDark,
              fontSize: 13,
              textAlign: "auto",
              lineHeight: 18,
            }}
          >
            {t("scan.devFallbackBanner")}
          </Text>
        </View>

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t("scan.devFallbackPlaceholder")}
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numeric"
          onSubmitEditing={submit}
          returnKeyType="done"
          style={{
            backgroundColor: theme.inputBg,
            color: theme.textPrimary,
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            textAlign: "auto",
            fontFamily: "monospace",
          }}
        />
        <TouchableOpacity
          onPress={submit}
          style={{
            backgroundColor: theme.accent,
            padding: 14,
            borderRadius: 12,
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "700", textAlign: "center" }}
          >
            {t("scan.devFallbackSubmit")}
          </Text>
        </TouchableOpacity>

        <ScrollView style={{ flex: 1, marginTop: 8 }}>
          {log.map((entry, i) => (
            <View
              key={i}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  entry.kind === "ok" ? theme.accentLight : theme.warningBg,
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  color:
                    entry.kind === "ok"
                      ? theme.accentTextDark
                      : theme.warningTextDark,
                  textAlign: "auto",
                  fontSize: 13,
                }}
                numberOfLines={2}
              >
                {entry.kind === "ok" ? "✓ " : "✗ "}
                {entry.line}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const pillStyle: StyleProp<ViewStyle> = {
  backgroundColor: "rgba(0,0,0,0.6)",
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 999,
  alignItems: "center",
};

function qtyBtnStyle(theme: Colors): ViewStyle {
  return {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.statBg,
    alignItems: "center",
    justifyContent: "center",
  };
}
