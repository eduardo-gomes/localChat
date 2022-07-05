import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { RootStackParamList } from './App';

import { Contact, ContactInfo } from './lib';
import { Colors, getStyles, styles } from './styles';

const SuggestAddContact = (
	<View>
		<Text>Você não possui nenhum contato.</Text>
		{/* <Button></Button>r */}
	</View>
);

const sampleContacts: Array<Contact> = [
	// new Contact("Contato 1"),
	// new Contact("Contato 2"),
	// new Contact("Contato 3"),
	// new Contact("Contato 4")
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

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

function EmptyListPrompt({ navigation, route }: Props) {
	return (
		<View>
			<Text>Parece que você não possui nenhum contato. Você pode adicionar um pressionando o botão abaixo</Text>
			<Button onPress={() => { navigation.navigate("AddContact") }} title="press me" />
		</View>
	)
};

function ContactListMap({ list }: { list: Contact[] }) {
	return (
		<>
			{list.map((contact) => {
				const info = contact.getInfo();
				return (<Section contact={info} key={info.uid} />); //TODO: use uid
			})}
		</>);
}

function ContactList({ navigation, route }: Props) {
	const isDarkMode = useColorScheme() === 'dark';
	const styles = getStyles(useColorScheme());

	const backgroundStyle = styles.background;

	const hasContacts = false;

	return (
		<SafeAreaView style={backgroundStyle}>
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
					<ContactListMap list={sampleContacts} />
				</View>
			</ScrollView>
			<EmptyListPrompt navigation={navigation} route={route} />
		</SafeAreaView >
	);
};

export default ContactList;