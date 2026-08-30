import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Global SEO Metadata */}
        <title>CAMSHOP BUSITEMA UNIVERSITY — Your Online Shopping and Delivery Partner</title>
        <meta
          name="description"
          content="Camshop is a modern Ugandan online shopping and delivery platform committed to making shopping more convenient, efficient, and accessible."
        />
        <meta
          name="keywords"
          content="Camshop, Busitema University, online shopping Uganda, student delivery app, local shopping app Uganda, e commerce Uganda, order food on campus, sell products online in Uganda"
        />

        {/* Open Graph for WhatsApp/Twitter previews */}
        <meta
          property="og:title"
          content="CAMSHOP — Your Online Shopping and Delivery Partner"
        />
        <meta
          property="og:description"
          content="We connect customers with a diverse range of products from multiple vendors and facilitate reliable delivery directly to their preferred locations."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Camshop" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
