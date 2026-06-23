# Camshop — Frontend (React Native / Expo)

Front end for the Camshop campus marketplace app (Busitema University). Built with the latest stable Expo SDK (52) and React Navigation. This is UI + navigation only — wired to mock data so you can demo every flow. Hook it up to your backend by replacing the data in `src/data/mockData.js` and the `fetch`/API calls you add inside each screen.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (or press `a` / `i` for an emulator).

## What's included

**Auth**
- Welcome / Signup (role picker: Buyer, Seller, Delivery) / Login / Terms & Conditions
- Signup requires agreeing to terms before account creation, per your spec

**Buyer**
- Home: search, category filter, product grid
- Product detail, with seller contact + "message seller" entry point
- Cart (shared `CartContext`, quantity controls, UGX 2,000 service fee shown separately)
- Checkout: MTN / Airtel Mobile Money selection, order summary, order confirmation

**Seller**
- Dashboard: earnings after fees, listed products, "added to cart" notification feed
- Add product: image upload, category, price, **contact number field** (used for cart notifications, per your spec)

**Admin**
- Overview dashboard: transactions, fees collected, active sellers/buyers, live activity/flagged-order feed

**Messaging**
- Shared chat list + chat room used by buyer↔seller and buyer↔delivery conversations

## Structure

```
App.js
src/
  theme/theme.js       — design tokens (colors, type, spacing)
  components/           — Button, InputField, ProductCard, Logo
  context/CartContext.js
  data/mockData.js      — swap this for real API calls
  navigation/           — RootNavigator, BuyerNavigator, RoleNavigators
  screens/
    Auth/  Buyer/  Seller/  Admin/  Chat/
```

## Design

Navy (`#0B2545`) + teal (`#1F8A8C`) + lime (`#C6F135`) — matching the Glory Technologies brand palette, with a hub-and-spoke circuit motif in the logo. Pill-shaped CTAs in lime read as "tap me" against the navy/teal supporting palette.

## Next steps for a complete app

1. **Backend**: connect signup/login to real auth (e.g. Firebase Auth or your own Node/Express API), replace `RoleRouter` with real role-based routing using a stored user role.
2. **Real-time chat & notifications**: swap mock messages for a service like Firebase Firestore + Cloud Messaging, or Socket.IO if self-hosting.
3. **Payments**: integrate MTN MoMo and Airtel Money APIs server-side; the Checkout screen already collects the right inputs (method, phone) to pass to your payment endpoint.
4. **Image upload**: wire `expo-image-picker`'s local URI in `AddProductScreen` to your storage (Firebase Storage, Cloudinary, or S3).
5. **Admin auth**: gate `AdminApp` behind a verified admin role server-side, not just client navigation.

Happy to build out any one of these backend pieces next, or turn specific screens (e.g. seller order management, delivery tracking) into a deeper flow.
