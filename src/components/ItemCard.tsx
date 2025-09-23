import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function ItemCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={s.card}>
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111827" },
  subtitle: { marginTop: 4, color: "#6b7280" },
});
