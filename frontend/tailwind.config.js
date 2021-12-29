module.exports = {
  purge: [
    "./pages/**/*.tsx",
    "./components/**/*.tsx",
    "./layouts/**/*.tsx",
    "./context/**/*.tsx",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
		extend: {
			textColor: ['disabled'],
			pointerEvents: ['disabled'],
			backgroundColor: ['disabled'],
			borderRadius: ['first', 'last'],
			borderColor: ['first', 'last', 'disabled'],
		}
	},
  plugins: [],
};