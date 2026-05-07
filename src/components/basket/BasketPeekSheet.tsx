import { useBasketStore } from "@/src/features/basket/store";
import { pickProductName } from "@/src/features/products/displayName";
import { Colors, useTheme } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  /**
   * Caller-controlled empty-state copy. The scan flow says "start scanning";
   * the search flow says "use search above" — both surface this sheet.
   */
  emptyText?: string;
};

export default function BasketPeekSheet({ visible, onClose, emptyText }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const items = useBasketStore((s) => s.items);
  const increaseQuantity = useBasketStore((s) => s.increaseQuantity);
  const decreaseQuantity = useBasketStore((s) => s.decreaseQuantity);
  const clearBasket = useBasketStore((s) => s.clearBasket);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        onPress={onClose}
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
                  {emptyText ?? t("home.emptyBasket")}
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
                        {pickProductName(it.name, it.nameEn, i18n.language)}
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
  );
}

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
