module.exports = {
  purge: {
    enabled: true,
    content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  },
  important: true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      darkBlack: "#1b1b1b",
      black: "#2c2c2c",
      lightBlack: "#525252",
      darkGrey: "#868686",
      grey: "#adadad",
      light: "#fbfbfb",
      lightGrey: "#f5f5f5",
      orange: "#ffd541",
      red: "#e81c4f",
      sectionsBlue: "#31a9db"
    },
    boxShadow: {
      DEFAULT: '4px 2px 10px rgba(0, 0, 0, 0.1)'
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}