import React from 'react';
import {
	Button,
	SafeAreaView,
	ScrollView,
	StatusBar,
	Text,
	useColorScheme,
	View,
} from 'react-native';

import { Contact, ContactInfo } from './lib';
import { Colors, getStyles, styles } from './styles';

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
		<View style={styles.contactInfoList} >
			<Text
				style={
					[
						styles.sectionTitle,
						{
							color: isDarkMode ? Colors.white : Colors.black,
						},
					]
				}>
				{contact.name}
			</Text>
			<Text
				style={
					[
						styles.sectionDescription,
						{
							color: isDarkMode ? Colors.light : Colors.dark,
						},
					]} >
				{/* {children} */}
			</Text>
		</View>
	);
};

const ContactList = () => {
	const isDarkMode = useColorScheme() === 'dark';
	const styles = getStyles(useColorScheme());

	const backgroundStyle = styles.background;

	const Título = (
		<View style={styles.title} >
			<Text style={styles.titleText}> Conversas </Text>
		</View>
	);

	const hasContacts = false;

	return (
		<SafeAreaView style={backgroundStyle}>
			{Título}
			{hasContacts ? SuggestAddContact : null}
			<StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={backgroundStyle} >
				<View
					style={
						{
							backgroundColor: isDarkMode ? Colors.black : Colors.white,
						}
					}>
					{
						sampleContacts.map((contact) => {
							const info = contact.getInfo();
							return (<Section contact={info} key={info.uid} />); //TODO: use uid
						})}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default ContactList;