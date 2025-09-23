import React from "react";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import { ItemCard } from "@/src/components/ItemCard";
import { fetchProductsPage, Product } from "@/src/api/mockApi";

export function InfiniteListDemo() {
  const PAGE_SIZE = 25;

  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);

  // Giữ page bằng ref để tránh gọi trùng 1 trang
  const pageRef = React.useRef(1);

  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const currentPage = pageRef.current; // chốt trang sẽ fetch
    const { items: next, hasMore: more } = await fetchProductsPage(
      currentPage,
      PAGE_SIZE
    );

    // Dedupe theo id để chắc chắn không trùng
    setItems((prev) => {
      const map = new Map(prev.map((i) => [i.id, i]));
      next.forEach((i) => map.set(i.id, i));
      return Array.from(map.values());
    });

    setHasMore(more);
    pageRef.current = currentPage + 1; // tăng trang ngay lập tức
    setLoading(false);
  }, [loading, hasMore]);

  React.useEffect(() => {
    loadMore(); // tải trang đầu
  }, [loadMore]);

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => String(it.id)} // đảm bảo là string
      renderItem={({ item }) => (
        <ItemCard
          title={item.title}
          subtitle={`₫${item.price.toLocaleString("vi-VN")}`}
        />
      )}
      onEndReachedThreshold={0.4}
      onEndReached={loadMore}
      ListHeaderComponent={
        <View style={{ padding: 12 }}>
          <Text style={{ color: "#6b7280" }}>
            Demo: Infinite scrolling (auto-load when reaching bottom)
          </Text>
        </View>
      }
      ListFooterComponent={
        <View style={{ padding: 16, alignItems: "center" }}>
          {loading ? (
            <ActivityIndicator />
          ) : !hasMore ? (
            <Text style={{ color: "#6b7280" }}>• You reached the end •</Text>
          ) : null}
        </View>
      }
      initialNumToRender={12}
      windowSize={10}
      removeClippedSubviews
    />
  );
}
