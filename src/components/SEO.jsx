import React from "react";
import Head from "expo-router/head";

export default function SEO({
  title = "CAMSHOP — Your Online Shopping and Delivery Partner",
  description = "Camshop is a modern Ugandan online shopping and delivery platform committed to making shopping more convenient, efficient, and accessible.",
  keywords = "Camshop, Busitema University, online shopping Uganda, student delivery app, local shopping app Uganda, e commerce Uganda",
  noindex = false, // Default to false so public pages get indexed normally
}) {
  return (
    <Head>
      <title>{title}</title>

      {noindex ? (
        /* Tells Google to ignore this page entirely */
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        /* Only inject SEO metadata on public pages */
        <>
          <meta name="description" content={description} />
          <meta name="keywords" content={keywords} />
          <meta property="og:description" content={description} />
        </>
      )}

      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Camshop" />
    </Head>
  );
}
