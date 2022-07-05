import {
	StyleSheet,
	Appearance,
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

function getNavigatorTheme(scheme?: string | null){
	const isDarkMode = scheme === 'dark';

	const refStyle = getStyles(scheme);

	const topBar = isDarkMode ? Colors.darkCyan : Colors.lightCyan;

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
		},
		sectionDescription: {
			marginTop: 8,
			fontSize: 18,
			fontWeight: '400',
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
		}
	});
}

const styles = getStyles(Appearance.getColorScheme());

export { styles, getStyles, Colors, getNavigatorTheme };