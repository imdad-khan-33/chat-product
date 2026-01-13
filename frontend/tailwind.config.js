import plugin from "tailwindcss/plugin";
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    backgroundSize: {
      cover: "cover",
      contain: "contain",
      auto: "auto",
    },
    extend: {
      backgroundImage: {
        authBackground: "url('./assets/images/auth-left.png')",
      },
      colors: {
        "customBg": "#0B6A5A",
        "componentBg": "#058B74",
        "customText": "#1AC6A9",
        "chatBg": "#90D6CA"
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        botFont: ["Lexend", "sans-serif"]
      },
      boxShadow: {
        custom: "40px 40px 60px 0px #E4E6EABD",
      },
      fontWeight: {
        light: 200,
        lightpro: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      },
      keyframes: {
        spin988: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '20%, 25%': { transform: 'scale(1.3) rotate(90deg)' },
          '45%, 50%': { transform: 'scale(1) rotate(180deg)' },
          '70%, 75%': { transform: 'scale(1.3) rotate(270deg)' },
          '95%, 100%': { transform: 'scale(1) rotate(360deg)' },
        },
      },
      animation: {
        spin988: 'spin988 2s linear infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".auth-input": {
          padding: "0.5rem",
          borderColor: "#D0D5DD",
          backgroundColor: "#F9FAFB",
          borderWidth: "1px",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          color: "#344054",
          placeholderColor: "#98A2B3",
          outline: "none",
        },
        ".auth-input:focus": {
          outline: "none",
          boxShadow: "0 0 0 2px rgba(163, 210, 202, 1)",
          borderColor: "rgba(163, 210, 202, 1)",
        },
        ".hide-scrollbar": {
          /* For Chrome, Safari and Opera */
          "&::-webkit-scrollbar": {
            display: "none",
          },
          /* For IE, Edge and Firefox */
          "-ms-overflow-style": "none", /* IE and Edge */
          "scrollbar-width": "none", /* Firefox */
        },
      });
    }),
  ],
};
