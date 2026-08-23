// app/(profile)/components/ChapChapCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ChapChapCard = ({ order, onPress }) => {
  const [timeAgo, setTimeAgo] = useState('');

  console.log(order);

  useEffect(() => {
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const updateTimeAgo = () => {
    const now = new Date();
    const orderDate = new Date(order.createdAt);
    const diffInSeconds = Math.floor((now - orderDate) / 1000);

    if (diffInSeconds < 60) {
      setTimeAgo('Just now');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      setTimeAgo(`${minutes}m ago`);
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      setTimeAgo(`${hours}h ago`);
    } else if (diffInSeconds < 172800) {
      setTimeAgo('Yesterday');
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      setTimeAgo(`${days}d ago`);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
      assigned: { label: 'Assigned', color: '#0ea5e9', icon: 'bicycle-outline' },
      in_progress: { label: 'In Progress', color: '#8b5cf6', icon: 'cart-outline' },
      delivered: { label: 'Delivered', color: '#22c55e', icon: 'checkmark-circle-outline' },
      cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={styles.idContainer}>
            <Ionicons name="flash-outline" size={16} color="#f59e0b" />
            <Text style={styles.orderId}>CHAP-{order.id.slice(0, 6)}</Text>
          </View>
          <Text style={styles.itemCount}>{order?.items?.length} items</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666666" />
          <Text style={styles.location} numberOfLines={1}>
            {order.location}
          </Text>
        </View>
        <Text style={styles.total}>
          UGX {order.pricing?.total?.toLocaleString() || order?.items?.reduce((sum, item) => sum + (item.actualPrice || 0) * item.quantity, 0).toLocaleString()}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  itemCount: {
    fontSize: 12,
    color: '#666666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  body: {
    gap: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#999999',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  total: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f59e0b',
    marginTop: 2,
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  viewDetails: {
    fontSize: 13,
    color: '#0ea5e9',
    fontWeight: '500',
  },
});

export default ChapChapCard;