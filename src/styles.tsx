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
};

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
			backgroundColor: '#088',
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

export { styles, getStyles, Colors };