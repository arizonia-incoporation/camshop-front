import { Slot } from "expo-router";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import Toast from 'react-native-toast-message'
import { toastConfig } from "../utils/toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotificationProvider } from "../context/NotificationContext";
import { AdvertProvider } from "../context/AdvertContext";
import { GlobalAdModal } from "../components/modals/adsModal";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <AdvertProvider>
            <SafeAreaProvider>
              <GestureHandlerRootView>
                <Slot />
              </GestureHandlerRootView>
            </SafeAreaProvider>
            <Toast config={toastConfig} />
            <GlobalAdModal />
          </AdvertProvider>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
} 