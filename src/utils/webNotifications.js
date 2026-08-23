import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// 1. Firebase Web Configuration
// Replace these with the keys from your Firebase Console (npm setup screen)
const firebaseConfig = {
  apiKey: "AIzaSyCj5cSjFaYoYdru72WxM3nIGZ7zoG4nKw4",
  authDomain: "camshop-23521.firebaseapp.com",
  projectId: "camshop-23521",
  storageBucket: "camshop-23521.firebasestorage.app",
  messagingSenderId: "1052566125571",
  appId: "1:1052566125571:web:d5d4143abae46bf2866236",
};

// 2. Initialize Firebase App (prevents duplicate app initialization error)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export initialized messaging instance if running in browser environment
export const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

/**
 * Requests browser permission and generates an FCM Web Token
 * @returns {Promise<string|null>} The FCM push token or null if denied/unsupported
 */
export async function requestWebNotificationPermission() {
  try {
    // Verify browser supports Web Push Notifications (Safari, Chrome, Firefox, Edge)
    const supported = await isSupported();
    if (!supported) {
      console.log("Web push notifications are not supported in this browser.");
      return null;
    }

    // Check existing browser permission
    if (Notification.permission === "denied") {
      console.log("Notification permission was previously denied by the user.");
      return null;
    }

    // Request notification permission from user
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission was not granted.");
      return null;
    }

    // Ensure the background service worker is registered
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    const messagingInstance = getMessaging(app);

    // Retrieve FCM Registration Token using your VAPID Key from Firebase Console
    const token = await getToken(messagingInstance, {
      vapidKey: "YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE",
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Web Push Token generated:", token);
      return token;
    } else {
      console.log(
        "No registration token available. Request permission to generate one.",
      );
      return null;
    }
  } catch (error) {
    console.error("An error occurred while retrieving web push token:", error);
    return null;
  }
}
