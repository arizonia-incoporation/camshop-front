// Camshop design tokens
// Brand: deep navy (trust/campus), teal (tech/fresh), lime (energy/CTA)
export const colors = {
  navy: "#1A1A1A",
  navyDeep: "#081B36",
  teal: "#45a4dc",
  tealLight: "#5FC4C6",
  limeLight: "#f9f5f2",
  lime: "#e1741f",
  limeDeep: "#A4CC1E",
  white: "#FFFFFF",
  bg: "#F4F8F8",
  card: "#FFFFFF",
  border: "#f0f0f0",
  textPrimary: "#1A1A1A",
  textSecondary: "#5C7080",
  textMuted: "#92A3AD",
  success: "#2BAE66",
  danger: "#E0473C",
  warning: "#F2A93B",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: '800', color: colors.navy, letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: '700', color: colors.navy },
  h2: { fontSize: 18, fontWeight: '700', color: colors.navy },
  body: { fontSize: 15, fontWeight: '400', color: colors.textPrimary },
  bodyMuted: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  button: { fontSize: 15, fontWeight: '700' },
};

export const shadow = {
  card: {
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
};
