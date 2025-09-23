import React from "react";
import { View, SectionList, RefreshControl, Text } from "react-native";
import { ItemCard } from "@/src/components/ItemCard";
import { fetchContactSections, ContactSection } from "@/src/api/mockApi";

export function SectionListDemo() {
  const [sections, setSections] = React.useState<ContactSection[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async () => {
    const secs = await fetchContactSections();
    setSections(secs);
  };
  React.useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ItemCard title={item.name} subtitle={item.phone} />
      )}
      renderSectionHeader={({ section }) => (
        <View
          style={{
            backgroundColor: "#f3f4f6",
            paddingVertical: 6,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ fontWeight: "700", color: "#111827" }}>
            {section.title}
          </Text>
        </View>
      )}
      stickySectionHeadersEnabled
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <View style={{ padding: 12 }}>
          <Text style={{ color: "#6b7280" }}>
            Demo: Section headers (A–Z) + Pull-to-Refresh
          </Text>
        </View>
      }
    />
  );
}
