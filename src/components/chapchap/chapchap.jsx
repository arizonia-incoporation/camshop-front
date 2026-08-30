// app/(profile)/shared/chapchap.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useLocalSearchParams, Stack } from "expo-router";
import ChapChapDetailsModal from "./ChapChapDetailsModal";
import ChapChapCard from "./ChapChapCard";
import EmptyState from "../cards/emptyCard";
import AppCalls from "../../utils/network";

const ChapChapScreen = ({type}) => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [pagination, setPagination] = useState({
    page: 1,
    hasNextPage: false,
    total: 0,
  });

  const title = type === "chapchap" ? "Chap Chap Orders" : "Chap Chap Deliveries";

  useEffect(() => {
    loadOrders();
  }, [type]);

  const loadOrders = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      let response;
      if (type === "chapchap") {
        response = await AppCalls.get("/order/chap?page=" + page);
        console.log(response)
      } else {
        response = await getChapChapDeliveries({ page, limit: 10 });
      }

      const data = response.data;
      console.log(data)

      if (page === 1) {
        setOrders(data.items || []);
      } else {
        setOrders((prev) => [...prev, ...(data.items || [])]);
      }

      setPagination({
        page: data.page || page,
        hasNextPage: data.hasNextPage || false,
        total: data.total || 0,
      });

      // Set user role from response
      if (data.user?.role) {
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error("Error loading chap chap orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadOrders(1, true);
  };

  const loadMore = () => {
    if (!loading && pagination.hasNextPage) {
      loadOrders(pagination.page + 1);
    }
  };

  const handleOrderPress = (order) => {
    setSelectedOrder(order);
    navigation.push("/profile/cha-chap?id="+item.id)
      console.log(
        "*************************>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
        order,
      );

    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdate = () => {
    loadOrders(1, true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <ChapChapCard order={item} onPress={() => handleOrderPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          pagination.hasNextPage && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#f59e0b" />
            </View>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="flash-outline"
              title={`No ${title.toLowerCase()} yet`}
              subtitle={
                type === "chapchap"
                  ? "You haven't created any Chap Chap orders. Start shopping quickly!"
                  : "You haven't been assigned any Chap Chap deliveries yet."
              }
              buttonText={
                type === "chapchap" ? "Create Chap Chap Order" : undefined
              }
              onButtonPress={() => navigation.push("/(home)/buy-chap-chap")}
            />
          </View>
        }
      />

      {/* Details Modal */}
      <ChapChapDetailsModal
        visible={modalVisible}
        order={selectedOrder}
        onClose={handleModalClose}
        userRole={userRole}
        onUpdate={handleOrderUpdate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#334155",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#334155",
  },
  headerRight: {
    width: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default ChapChapScreen;
