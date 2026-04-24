export const colors = {
	primary: "#85817d",
	secondary: "#5b798a",
	background: "#f4ece4",
	card: "#ddd9d4",
	cardLight: "#e2e3e3",
	inputBackground: "#f9f4ee",
	button: "#9a958f",
	placeholder: "#b5b0ab",
	tertiary: "#c4b7b6",
	divider: "#b9c8ca",
	avatarMuted: "#c5c1bb",
	successBackground: "#c5d5c0",
	successText: "#3d6635",
	danger: "#c45c5c",
	white: "#ffffff",
	black: "#000000",
} as const;

export const fonts = {
	regular: "Georgia",
	italic: "Georgia-Italic",
	bold: "Georgia-Bold",
	boldItalic: "Georgia-BoldItalic",
} as const;

export const fontSizes = {
	xs: 10,
	sm: 12,
	md: 14,
	base: 16,
	lg: 18,
	xl: 20,
	xxl: 24,
	display: 36,
	hero: 44,
} as const;

export const spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
	xxxl: 32,
} as const;

export const radii = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 22,
	full: 999,
} as const;

export const shadows = {
	card: {
		shadowColor: colors.black,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
} as const;
