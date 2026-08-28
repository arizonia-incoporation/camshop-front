import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AppCalls from "../utils/network";

const AdvertContext = createContext(null);

const DEFAULT_ADS_STATE = {
  BANNER: [],
  MODAL: [],
  IN_FEED: [],
};

export const AdvertProvider = ({ children }) => {
  const [ads, setAds] = useState(DEFAULT_ADS_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeModalAd, setActiveModalAd] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Fetch all ads safely
  const fetchAdverts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AppCalls.get("/adverts/serve");

      // Verify payload structure before extracting data
      if (res?.success) {
        const payload = res.data;

        const updatedAds = {
          BANNER: Array.isArray(payload.BANNER) ? payload.BANNER : [],
          MODAL: Array.isArray(payload.MODAL) ? payload.MODAL : [],
          IN_FEED: Array.isArray(payload.IN_FEED) ? payload.IN_FEED : [],
        };

        setAds(updatedAds);

        // Auto-trigger top priority modal ad only if array exists and has items
        if (updatedAds.MODAL.length > 0) {
          setActiveModalAd(updatedAds.MODAL[0]);
          setModalVisible(true);
        }
      } else {
        // Fallback gracefully if success flag is false
        setAds(DEFAULT_ADS_STATE);
      }
    } catch (err) {
      // Log error internally without throwing to the UI tree
      console.warn(
        "[AdvertContext] Failed to load adverts gracefully:",
        err?.message || err,
      );
      setError(err?.message || "Failed to fetch ads");

      // Reset state to empty fallbacks so components render gracefully without data
      setAds(DEFAULT_ADS_STATE);
      setModalVisible(false);
      setActiveModalAd(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdverts();
  }, [fetchAdverts]);

  // 2. Track ad clicks safely (fails silently)
  const trackAdClick = async (advertId) => {
    if (!advertId) return;
    try {
      await AppCalls.post(`/adverts/${advertId}/click`);
    } catch (err) {
      // Non-blocking catch: user action (like URL opening) proceeds unaffected
      console.warn(
        `[AdvertContext] Failed to record click for ad ${advertId}:`,
        err?.message || err,
      );
    }
  };

  // 3. Close modal helper
  const closeModal = () => {
    setModalVisible(false);
    setActiveModalAd(null);
  };

  return (
    <AdvertContext.Provider
      value={{
        banners: ads.BANNER,
        inFeedAds: ads.IN_FEED,
        modalAds: ads.MODAL,
        activeModalAd,
        modalVisible,
        closeModal,
        fetchAdverts,
        trackAdClick,
        loading,
        error,
      }}
    >
      {children}
    </AdvertContext.Provider>
  );
};

export const useAdverts = () => {
  const context = useContext(AdvertContext);
  if (!context) {
    throw new Error("useAdverts must be used within an AdvertProvider");
  }
  return context;
};
