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
	Appearance,
	View,
} from 'react-native';

import { Contact, ContactInfo } from './lib';

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

const sampleContacts: Array<Contact> = [
	new Contact("Contato 1"),
	new Contact("Contato 2"),
	new Contact("Contato 3"),
	new Contact("Contato 4")
];

const Section: React.FC<{
	// children: React.ReactNode;
	contact: ContactInfo;
}> = ({ /*children,*/ contact }) => {
	const isDarkMode = useColorScheme() === 'dark';
	return (
		<View style={styles.contactInfoList}>
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
	const styles = getStyles(useColorScheme());

	const backgroundStyle = styles.background;

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
					{sampleContacts.map((contact) => {
						const info = contact.getInfo();
						return (<Section contact={info} key={info.uid} />); //TODO: use uid
					})}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
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

export default App;
