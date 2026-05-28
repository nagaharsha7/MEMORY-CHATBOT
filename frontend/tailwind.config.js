/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      colors: {
        // Harmonious dark theme color palette
        dark: {
          bg: "#0b0f19",       // deep dark blue-grey
          card: "#161b26",     // lighter container grey
          border: "#242c3d",   // subtle border grey
          sidebar: "#0d111d",  // sleek sidebar dark
          active: "#1f293d",   // highlighted session element
          primary: "#4f46e5",  // primary brand color (indigo-600)
          hover: "#4338ca",    // primary brand hover
          userBubble: "#1e293b", // slate-800 for user messages
          aiBubble: "#1e1b4b",   // deep indigo-950 for AI response bubbles
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
