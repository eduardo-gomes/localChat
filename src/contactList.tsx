import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useContext } from 'react';
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
import AppContext from './context';

import { Contact, ContactInfo } from './lib';
import { Colors, getStyles, styles } from './styles';


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
		<View style={styles.emptyListPrompt}>
			<Text style={styles.emptyListPromptText}>Parece que você não possui nenhum contato.
				{"\n"}
				Você pode adicionar um pressionando o botão abaixo</Text>
			<Button onPress={() => { navigation.navigate("AddContact") }} title="Adicionar contatos" />
		</View>
	)
};

function ContactListMap({ list }: { list: ContactInfo[] }) {
	return (
		<>
			{list.map((contact) => {
				const info = contact;
				return (<Section contact={info} key={info.uid} />); //TODO: use uid
			})}
		</>);
}

function ContactList({ navigation, route }: Props) {
	const isDarkMode = useColorScheme() === 'dark';
	const styles = getStyles(useColorScheme());

	const context = useContext(AppContext);

	const contactList = context?.contactInfo ?? [];

	const backgroundStyle = styles.background;

	const hasContacts = contactList.length <= 0;

	return (
		<SafeAreaView style={backgroundStyle}>
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
					<ContactListMap list={contactList} />
				</View>
			</ScrollView>
			{hasContacts ? <EmptyListPrompt navigation={navigation} route={route} /> : null}
		</SafeAreaView >
	);
};

export default ContactList;