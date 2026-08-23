import { useEffect, useState, useContext, createContext } from "react";
import * as SecureStore from "expo-secure-store";

  import { Platform } from "react-native";
import AppCalls from "../utils/network";
import { useRouter } from "expo-router";

const AuthContext = createContext();

export const storage = {
    setItem: async (key, value) => {
      if (Platform.OS === "web") {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.error("Local storage error:", e);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    },
    getItem: async (key) => {
      if (Platform.OS === "web") {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.error("Local storage error:", e);
          return null;
        }
      } else {
        return await SecureStore.getItemAsync(key);
      }
    },
    deleteItem: async (key) => {
      if (Platform.OS === "web") {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error("Local storage error:", e);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    },
  };

export function AuthProvider({ children }) {
  const navigation = useRouter();
  const [authing, setAuthing] = useState(true);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await AppCalls.get("/auth/check");
      console.log(res)
      const { user } = res;
      if (user) {
        console.log("user ****** ", user);
        setAuthState({ isAuthenticated: true, user });
      } else {
        setAuthState({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      console.log(error);
      setAuthState({ isAuthenticated: false, user: null });
    } finally {
      setAuthing(false);
    }
  };

  // Modified storeUser function
  const storeUser = async (token, data) => {
    console.log("froooooooom >>>>>>>>>>", data);

    // 1. Save credentials platform-agnostically
    await storage.setItem("userToken", token);
    const userString = JSON.stringify(data);
    await storage.setItem("userData", userString);

    // 2. Update React auth state
    setAuthState({ isAuthenticated: true, user: data });

    // 3. Re-verify auth state
    await checkAuth();

    // 4. Trigger web permission prompt immediately after explicit user login action
    if (Platform.OS === "web") {
      try {
        await requestWebNotificationPermission();
      } catch (err) {
        console.log("Web notification request failed/deferred:", err);
      }
    }
  };

  const logout = async () => {
    try {
      // 1. Notify backend to clear push token (Optional: catch silently if network fails)
      await AppCalls.post("/auth/logout").catch((err) =>
        console.warn("Backend logout cleanup warning:", err),
      );
    } finally {
      // 2. Clear tokens & user data from device storage
      await storage.deleteItem("userToken");
      await storage.deleteItem("userData");

      // 4. Redirect to login screen
      navigation.replace("/"); // Adjust to your unauthenticated route
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        checkAuth,
        setAuthState,
        authing,
        storeUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
