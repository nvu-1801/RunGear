import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
} from "react-native";
import { FlatListDemo } from "@/src/screens/FlatListDemo";
import { SectionListDemo } from "@/src/screens/SectionListDemo";
import { InfiniteListDemo } from "@/src/screens/InfiniteListDemo";

export default function App() {
  const [tab, setTab] = useState<"flat" | "section" | "infinite">("flat");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>List Demos</Text>
        <Text style={styles.subtitle}>
          FlatList • SectionList • Pull-to-Refresh • Infinite Scroll
        </Text>
        <View style={styles.tabs}>
          <TabButton
            label="FlatList"
            active={tab === "flat"}
            onPress={() => setTab("flat")}
          />
          <TabButton
            label="SectionList"
            active={tab === "section"}
            onPress={() => setTab("section")}
          />
          <TabButton
            label="Infinite"
            active={tab === "infinite"}
            onPress={() => setTab("infinite")}
          />
        </View>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        {tab === "flat" && <FlatListDemo />}
        {tab === "section" && <SectionListDemo />}
        {tab === "infinite" && <InfiniteListDemo />}
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingTop: 24 },
  title: { color: "white", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#cbd5e1", marginTop: 4 },
  tabs: { flexDirection: "row", gap: 8, marginTop: 12 },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#334155",
  },
  tabActive: { backgroundColor: "#f59e0b" },
  tabText: { color: "#cbd5e1", fontWeight: "600" },
  tabTextActive: { color: "#111827" },
});
