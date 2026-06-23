import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import SellerDashboardScreen from '../screens/Seller/SellerDashboardScreen';
import AddProductScreen from '../screens/Seller/AddProductScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatRoomScreen from '../screens/Chat/ChatRoomScreen';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SellerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
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

export function SellerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={route.name === 'Dashboard' ? 'grid-outline' : 'chatbubble-ellipses-outline'} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={SellerStack} />
      <Tab.Screen name="Messages" component={MessagesStack} />
    </Tab.Navigator>
  );
}

export function AdminNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.navy }}>
      <Tab.Screen
        name="Overview"
        component={AdminDashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="speedometer-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export function DeliveryNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.navy }}>
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="bicycle-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
