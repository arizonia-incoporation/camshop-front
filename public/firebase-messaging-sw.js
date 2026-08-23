// public/firebase-messaging-sw.js

// 1. Import Firebase compat libraries directly from Google's CDN
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

// 2. Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyCj5cSjFaYoYdru72WxM3nIGZ7zoG4nKw4",
  authDomain: "camshop-23521.firebaseapp.com",
  projectId: "camshop-23521",
  storageBucket: "camshop-23521.firebasestorage.app",
  messagingSenderId: "1052566125571",
  appId: "1:1052566125571:web:d5d4143abae46bf2866236"
});

// 3. Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// 4. Handle incoming messages while the web app is in the background or closed
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message: ",
    payload,
  );

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body,
    // Replace with the name of your actual icon file inside the public folder
    icon: "/favicon.ico",
    data: payload.data, // This carries your deep-linking payload (e.g., { url: "/orders/123" })
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 5. Handle clicks on the web notification to route the user
self.addEventListener("notificationclick", (event) => {
  console.log(
    "[firebase-messaging-sw.js] Notification clicked: ",
    event.notification,
  );

  // Close the notification pop-up
  event.notification.close();

  // Extract the deep link URL from the Express backend payload, fallback to root '/'
  const urlToOpen = event.notification.data?.url || "/";

  // Logic to open the app or focus the tab if it's already open
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the app
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If the tab is already open, focus it and navigate to the route
          if (
            client.url.includes(self.registration.scope) &&
            "focus" in client
          ) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If the app is completely closed, open a new window to the specific route
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
