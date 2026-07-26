export const founderTokens = {
  colors: {
    // Warm ivory backgrounds for calm executive space
    background: "#FDFBF7", 
    surface: "#FFFFFF",
    surfaceAlt: "#F4F1EA",

    // Charcoal for sharp, confident typography and navigation
    textPrimary: "#1E1E24",
    textSecondary: "#4A4A52",
    textMuted: "#8E8E98",
    
    // Restrained gold accent
    accent: "#E1C97D",
    accentHover: "#D1B96D",

    // Standardized status colors (as per UX Philosophy #11)
    status: {
      emerald: "#10B981", // Ready/Success
      amber: "#F59E0B",   // Warning/Attention
      red: "#EF4444"      // Critical/Blocked
    },

    border: "#EAE7E0"
  },
  typography: {
    fontFamily: {
      sans: "'Inter', sans-serif",
      serif: "'Playfair Display', serif", // For executive headers
      mono: "'JetBrains Mono', monospace"
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
    xxxl: "4rem"
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.03)",
    md: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03)"
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px"
  }
};
