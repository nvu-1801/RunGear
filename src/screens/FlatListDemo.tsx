import React, { useCallback, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
} from "react-native";
import { ItemCard } from "@/src/components/ItemCard";
import { fetchProductsPage, refreshProducts, Product } from "@/src/api/mockApi";

export function FlatListDemo() {
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (p: number) => {
      if (loadingMore || refreshing) return;
      setLoadingMore(true);
      const { items: next, hasMore } = await fetchProductsPage(p, PAGE_SIZE);
      setItems((prev) => (p === 1 ? next : [...prev, ...next]));
      setHasMore(hasMore);
      setPage(p);
      setLoadingMore(false);
    },
    [loadingMore, refreshing]
  );

  React.useEffect(() => {
    loadPage(1);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const fresh = await refreshProducts();
    setItems(fresh);
    setHasMore(true);
    setPage(1);
    setRefreshing(false);
  }, []);

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      renderItem={({ item }) => (
        <ItemCard
          title={item.title}
          subtitle={`₫${item.price.toLocaleString("vi-VN")}`}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReachedThreshold={0.3}
      onEndReached={() => {
        if (hasMore && !loadingMore) loadPage(page + 1);
      }}
      ListHeaderComponent={
        <View style={{ padding: 12 }}>
          <Text style={{ color: "#6b7280" }}>
            Demo: Pull-to-Refresh + Load-more
          </Text>
        </View>
      }
      ListFooterComponent={
        <View style={{ padding: 16, alignItems: "center" }}>
          {loadingMore ? (
            <ActivityIndicator />
          ) : !hasMore ? (
            <Text style={{ color: "#6b7280" }}>• No more items •</Text>
          ) : null}
        </View>
      }
      getItemLayout={(_, index) => ({ length: 60, offset: 60 * index, index })}
      initialNumToRender={12}
      windowSize={10}
      removeClippedSubviews
    />
  );
}
