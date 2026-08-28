export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff", 100: "#d9ebff", 300: "#7cb8ff",
          500: "#1668e3", 600: "#0f56c2", 700: "#0d459b", 900: "#0a2d63",
        },
        ink: "#0d1526",
      },
      boxShadow: { card: "0 1px 2px rgba(13,21,38,.06), 0 8px 24px -12px rgba(13,21,38,.18)" },
    },
  },
  plugins: [],
};
