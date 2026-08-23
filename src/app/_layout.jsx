import { Slot } from "expo-router";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import Toast from 'react-native-toast-message'
import { toastConfig } from "../utils/toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationProvider } from "../context/NotificationContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView>
              <Slot />
            </GestureHandlerRootView>
          </SafeAreaProvider>
          <Toast config={toastConfig} />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
} 