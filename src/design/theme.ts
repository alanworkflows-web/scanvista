import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { motion } from './motion';

// This structure allows us to potentially toggle themes (light/dark)
// by mapping these functional tokens to different raw values based on a theme state.

export const brandPresets = {
  classic: { id: "classic", label: "Classic", bg: "bg-white", text: "text-gray-900", accent: "bg-emerald-600" },
  luxury: { id: "luxury", label: "Luxury", bg: "bg-zinc-900", text: "text-zinc-50", accent: "bg-amber-500" },
  ocean: { id: "ocean", label: "Ocean", bg: "bg-slate-50", text: "text-slate-900", accent: "bg-blue-600" },
  warm: { id: "warm", label: "Warm", bg: "bg-stone-50", text: "text-stone-900", accent: "bg-orange-600" },
};

export const theme = {
  colors: {
    // Backgrounds
    bg: {
      primary: colors.white,
      secondary: colors.gray[50],
      tertiary: colors.gray[100],
      inverse: colors.navy[900],
      brand: colors.emerald[50],
    },
    // Text
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[600],
      tertiary: colors.gray[400],
      inverse: colors.white,
      brand: colors.emerald[700],
      accent: colors.gold[600],
    },
    // Borders
    border: {
      light: colors.gray[100],
      default: colors.gray[200],
      heavy: colors.gray[300],
      focus: colors.emerald[500],
    },
    // Actions
    action: {
      primary: colors.emerald[600],
      primaryHover: colors.emerald[700],
      secondary: colors.white,
      secondaryHover: colors.gray[50],
      danger: colors.black, // Placeholder for danger (red if needed, otherwise black)
      dangerHover: colors.gray[900],
    }
  },
  typography,
  spacing,
  radius,
  shadows,
  motion
};

// Ready for future dark mode implementation without modifying component logic
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    bg: {
      primary: colors.gray[900],
      secondary: colors.gray[800],
      tertiary: colors.gray[700],
      inverse: colors.white,
      brand: colors.emerald[900],
    },
    text: {
      primary: colors.gray[50],
      secondary: colors.gray[300],
      tertiary: colors.gray[500],
      inverse: colors.gray[900],
      brand: colors.emerald[400],
      accent: colors.gold[400],
    },
    border: {
      light: colors.gray[800],
      default: colors.gray[700],
      heavy: colors.gray[600],
      focus: colors.emerald[500],
    }
  }
};
