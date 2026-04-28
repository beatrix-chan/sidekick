const lightColors = {
	text: {
		primary: "#85817d",
		secondary: "#5b798a",
		tertiary: "#c4b7b6",
		placeholder: "#b5b0ab",
		inverse: "#ffffff",
		success: "#3d6635",
		danger: "#c45c5c",
	},
	surface: {
		app: "#f4ece4",
		card: "#ddd9d4",
		cardAlt: "#e2e3e3",
		input: "#f9f4ee",
		button: "#9a958f",
		avatarMuted: "#c5c1bb",
		success: "#c5d5c0",
	},
	border: {
		default: "#b9c8ca",
		muted: "#b5b0ab",
		danger: "#c45c5c",
	},
	icon: {
		primary: "#85817d",
		secondary: "#5b798a",
		muted: "#b5b0ab",
		inverse: "#ffffff",
	},
	action: {
		primary: "#9a958f",
		primaryText: "#ffffff",
		destructive: "#c45c5c",
	},
	status: {
		successBackground: "#c5d5c0",
		successText: "#3d6635",
		error: "#c45c5c",
	},
	raw: {
		white: "#ffffff",
		black: "#000000",
	},
} as const;

const darkColors = {
	text: {
		primary: "#d4cfc4",
		secondary: "#7fa8ba",
		tertiary: "#a49998",
		placeholder: "#8a8180",
		inverse: "#1a1a1a",
		success: "#8fc18a",
		danger: "#e08d8d",
	},
	surface: {
		app: "#1a1a1a",
		card: "#2a2a2a",
		cardAlt: "#333333",
		input: "#2f2f2f",
		button: "#b8ad99",
		avatarMuted: "#4a4542",
		success: "#2f4a2b",
	},
	border: {
		default: "#3f4a4b",
		muted: "#55504d",
		danger: "#a95d5d",
	},
	icon: {
		primary: "#d4cfc4",
		secondary: "#7fa8ba",
		muted: "#8a8180",
		inverse: "#1a1a1a",
	},
	action: {
		primary: "#b8ad99",
		primaryText: "#1a1a1a",
		destructive: "#e08d8d",
	},
	status: {
		successBackground: "#2f4a2b",
		successText: "#8fc18a",
		error: "#e08d8d",
	},
	raw: {
		white: "#ffffff",
		black: "#000000",
	},
} as const;

export const themes = {
	light: {
		colorScheme: "light",
		colors: lightColors,
	},
	dark: {
		colorScheme: "dark",
		colors: darkColors,
	},
} as const;

export type ColorScheme = keyof typeof themes;
export type Theme = (typeof themes)[ColorScheme];

// Light mode remains the current app default.
export const currentTheme = themes.light;

// Backward-compatible color aliases used by existing screens/components.
export const colors = {
	primary: currentTheme.colors.text.primary,
	secondary: currentTheme.colors.text.secondary,
	background: currentTheme.colors.surface.app,
	card: currentTheme.colors.surface.card,
	cardLight: currentTheme.colors.surface.cardAlt,
	inputBackground: currentTheme.colors.surface.input,
	button: currentTheme.colors.action.primary,
	placeholder: currentTheme.colors.text.placeholder,
	tertiary: currentTheme.colors.text.tertiary,
	divider: currentTheme.colors.border.default,
	avatarMuted: currentTheme.colors.surface.avatarMuted,
	successBackground: currentTheme.colors.status.successBackground,
	successText: currentTheme.colors.status.successText,
	danger: currentTheme.colors.status.error,
	white: currentTheme.colors.raw.white,
	black: currentTheme.colors.raw.black,
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
