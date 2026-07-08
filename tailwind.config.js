export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        peace: ['"Peace Sans"', 'sans-serif'],
        inter: ['"Inter"', 'sans-serif'],
      },
      keyframes: {
        blink: {
          '0%, 50%, 100%': { opacity: 1 },
          '25%, 75%': { opacity: 0 },
        },
        shine: {
          '0%': { transform: 'translateX(-150%)' },
          '100%': { transform: 'translateX(350%)' },
        },
      },
      animation: {
        blink: 'blink 1s infinite',
        shine: 'shine 2s linear infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = Object.entries(theme("textShadow") || {}).map(
        ([key, value]) => {
          return [`.text-shadow-${key}`, { textShadow: value }];
        }
      );
      addUtilities(Object.fromEntries(newUtilities));
    },
  ],
};
