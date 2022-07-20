import {
	StyleSheet,
	useColorScheme,
} from 'react-native';


const Colors = {
	primary: '#1292B4',
	white: '#FFF',
	lighter: '#F3F3F3',
	light: '#DAE1E7',
	dark: '#444',
	darker: '#222',
	black: '#000',
	darkCyan: '#088',
	darkerCyan: '#066',
	lightCyan: '#0EE'
};

function getNavigatorTheme(scheme?: string | null) {
	const isDarkMode = scheme === 'dark';

	const refStyle = getStyles(scheme);

	const topBar = refStyle.mainColor.color;

	return {
		dark: isDarkMode,
		colors: {
			background: refStyle.background.backgroundColor,
			primary: topBar,
			text: isDarkMode ? Colors.lighter : Colors.darker,
			card: topBar,
			border: Colors.darkerCyan,
			notification: isDarkMode ? Colors.darker : Colors.lighter,
		}
	}
}

type NavigatorTheme = ReturnType<typeof getNavigatorTheme>;

function getStyles(scheme?: string | null) {
	const isDarkMode = scheme === 'dark';
	return StyleSheet.create({
		contactInfoList: {
			marginTop: 5,
			paddingHorizontal: 24,
			borderStyle: "solid",
			borderColor: "gray",
			borderBottomWidth: 1
		},
		sectionTitle: {
			fontSize: 24,
			fontWeight: '600',
			color: isDarkMode ? Colors.white : Colors.black,
		},
		sectionDescription: {
			marginTop: 8,
			fontSize: 18,
			fontWeight: '400',
			color: isDarkMode ? Colors.light : Colors.dark,
		},
		highlight: {
			fontWeight: '700',
		},
		title: {
			backgroundColor: Colors.darkCyan,
			padding: 10,
		},
		titleText: {
			fontSize: 36,
			fontWeight: '700',
		},
		background: {
			backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
		},
		emptyListPrompt: {
			height: '100%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		},
		emptyListPromptText: {
			fontSize: 18,
			textAlign: 'center'
		},
		labelForm: {
			paddingLeft: 10,
			fontSize: 20
		},
		textFormInput: {
			backgroundColor: isDarkMode ? Colors.dark : Colors.light,
			// margin: 5,
			paddingLeft: 15,
			paddingRight: 15,
			borderRadius: 30,
		},
		mainColor: {
			color: isDarkMode ? Colors.darkCyan : Colors.lightCyan,
		},
		secondaryColor: {
			color: isDarkMode ? Colors.lighter : Colors.darker,
		},
		messageBubble: {
			backgroundColor: isDarkMode ? Colors.darkCyan : Colors.lightCyan,
			borderRadius: 10,
			padding: 5,//half border radius
			marginTop: 10
		},
		messageText: {
			margin: 3,
			marginBottom: 10
		},
		messageStatus: {
			fontSize: 10,
			fontStyle: "italic",
			textAlign: "right",
			padding: 5,//half bubble border radius
			paddingTop: 0,
		},
	});
}

export { getStyles, Colors, getNavigatorTheme, useColorScheme };
export type { NavigatorTheme };