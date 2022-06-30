/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {
	Button,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	useColorScheme,
	View,
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

const SuggestAddContact = (
	<View>
		<Text>Você não possui nenhum contato.</Text>
		{/* <Button></Button>r */}
	</View>
);

interface Contact{
	name: string
};

const Section: React.FC<{
	// children: React.ReactNode;
	contact: Contact;
}> = ({ /*children,*/ contact }) => {
	const isDarkMode = useColorScheme() === 'dark';
	return (
		<View style={styles.sectionContainer}>
			<Text
				style={[
					styles.sectionTitle,
					{
						color: isDarkMode ? Colors.white : Colors.black,
					},
				]}>
				{contact.name}
			</Text>
			<Text
				style={[
					styles.sectionDescription,
					{
						color: isDarkMode ? Colors.light : Colors.dark,
					},
				]}>
				{/* {children} */}
			</Text>
		</View>
	);
};

const App = () => {
	const isDarkMode = useColorScheme() === 'dark';

	const backgroundStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
	};

	const Título = (
		<View style={styles.title}>
			<Text style={styles.titleText}>Conversas</Text>
		</View>
	);

	return (
		<SafeAreaView style={backgroundStyle}>
			{Título}
			{SuggestAddContact}
			<StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={backgroundStyle}>
				<View
					style={{
						backgroundColor: isDarkMode ? Colors.black : Colors.white,
					}}>
					<Section contact={{name: "Step One"}}/>             
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	sectionContainer: {
		marginTop: 32,
		paddingHorizontal: 24,
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
	},
	titleText: {
		fontSize: 36,
		fontWeight: '700',
	},
});

export default App;
