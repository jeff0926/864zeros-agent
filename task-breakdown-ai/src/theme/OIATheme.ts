// OIA Design System v1.0 — Visual Language for 864zeros Products
// "Organize your brain, not your life"

export const OIAColors = {
  // Brand
  sage: '#8BA888',
  sageDark: '#7A9676',
  sageLight: '#96B893',
  coral: '#E8A598',
  coralDark: '#D99A8E',
  coralLight: '#F0B5A8',

  // Backgrounds - Light
  cream: '#F5F2ED',
  warmWhite: '#FDFCFA',

  // Backgrounds - Dark
  darkBg: '#1A1A1A',
  darkCard: '#242424',
  darkElevated: '#2E2E2E',

  // Supporting
  dustyBlue: '#7A8FA3',
  taupe: '#A69485',
  olive: '#6B6B5E',
  mustard: '#C9A86C',

  // Text - Light
  charcoal: '#2D2D2D',
  stone: '#5C5C5C',
  muted: '#8C8C8C',

  // Text - Dark
  offWhite: '#F0EDE8',
  warmGray: '#A8A8A8',
  mutedDark: '#6C6C6C',

  // Semantic
  success: '#8BA888',
  warning: '#C9A86C',
  error: '#D4847A',
  info: '#7A8FA3',

  // Status
  completed: '#8BA888',
  inProgress: '#C9A86C',
  pending: '#A69485',
};

export const OIATypography = {
  fontFamily: 'Nunito',
  sizes: {
    display: 32,
    h1: 24,
    h2: 20,
    body: 16,
    bodySmall: 14,
    caption: 12,
    button: 16,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.3,
    relaxed: 1.5,
  },
};

export const OIASpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const OIARadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const OIAShadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    button: {
      shadowColor: '#8BA888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    button: {
      shadowColor: '#8BA888',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
  },
};

export const OIAComponents = {
  button: { height: 56, minWidth: 120 },
  input: { height: 56 },
  touchTarget: { min: 48, recommended: 56 },
  bottomNav: { height: 64 },
  fab: { size: 56 },
  checkbox: { size: 24 },
  progressBar: { height: 8, radius: 4 },
  slider: { trackHeight: 4, thumbSize: 24 },
  toast: { height: 48 },
  spinner: { small: 24, default: 32, large: 48 },
};

export const OIAAnimation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

export type OIAThemeType = typeof lightTheme;

export const lightTheme = {
  mode: 'light' as const,
  colors: {
    // Semantic mappings for existing ThemeContext interface
    primary: OIAColors.sage,
    primaryDark: OIAColors.sageDark,
    secondary: OIAColors.dustyBlue,
    accent: OIAColors.coral,
    background: OIAColors.cream,
    surface: OIAColors.warmWhite,
    text: OIAColors.charcoal,
    textSecondary: OIAColors.stone,
    textMuted: OIAColors.muted,
    border: OIAColors.taupe,
    success: OIAColors.success,
    warning: OIAColors.warning,
    error: OIAColors.error,
    info: OIAColors.info,
    // Raw brand colors
    sage: OIAColors.sage,
    coral: OIAColors.coral,
    mustard: OIAColors.mustard,
    taupe: OIAColors.taupe,
    olive: OIAColors.olive,
  },
  typography: OIATypography,
  spacing: OIASpacing,
  radius: OIARadius,
  shadows: OIAShadows.light,
  animation: OIAAnimation,
  components: OIAComponents,
};

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    primary: OIAColors.sageLight,
    primaryDark: OIAColors.sage,
    secondary: OIAColors.dustyBlue,
    accent: OIAColors.coralDark,
    background: OIAColors.darkBg,
    surface: OIAColors.darkCard,
    text: OIAColors.offWhite,
    textSecondary: OIAColors.warmGray,
    textMuted: OIAColors.mutedDark,
    border: OIAColors.olive,
    success: OIAColors.success,
    warning: OIAColors.warning,
    error: OIAColors.error,
    info: OIAColors.info,
    sage: OIAColors.sageLight,
    coral: OIAColors.coralDark,
    mustard: OIAColors.mustard,
    taupe: OIAColors.taupe,
    olive: OIAColors.olive,
  },
  typography: OIATypography,
  spacing: OIASpacing,
  radius: OIARadius,
  shadows: OIAShadows.dark,
  animation: OIAAnimation,
  components: OIAComponents,
};
