import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import BuyerHomeScreen from '../screens/Buyer/BuyerHomeScreen';
import ProductDetailScreen from '../screens/Buyer/ProductDetailScreen';
import CartScreen from '../screens/Buyer/CartScreen';
import CheckoutScreen from '../screens/Buyer/CheckoutScreen';
import OrderConfirmedScreen from '../screens/Buyer/OrderConfirmedScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatRoomScreen from '../screens/Chat/ChatRoomScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BuyerHome" component={BuyerHomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}

const ICONS = { Shop: 'storefront', Cart: 'cart', Messages: 'chatbubble-ellipses', Profile: 'person' };

export default function BuyerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => <Ionicons name={`${ICONS[route.name]}-outline`} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Shop" component={HomeStack} />
      <Tab.Screen name="Messages" component={MessagesStack} />
    </Tab.Navigator>
  );
}
