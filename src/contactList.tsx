import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
	Button,
	Pressable,
	SafeAreaView,
	ScrollView,
	StatusBar,
	Text,
	useColorScheme,
	View,
} from 'react-native';
import { RootStackParamList } from './App';
import PlusButton from './botãoRedondo';

import { ContactInfo } from './lib';
import ContactManager from './lib/contactManager';
import { InfoButton } from './lib/infoScreen';
import { getStyles } from './styles';


function ContactEntry({ contact, navigation }: { contact: ContactInfo } & Navigation) {
	const styles = getStyles(useColorScheme());
	function long() {
		navigation.navigate("EditContact", contact);
	}
	function short() {
		navigation.navigate("ChatScreen", contact);
	}
	return (
		<Pressable style={styles.contactInfoList}
			onLongPress={long} onPress={short}
		>
			<Text style={styles.sectionTitle}>{contact.name}</Text>
			<Text style={styles.sectionDescription}>ID: {contact.uid}</Text>
		</Pressable>
	);
};

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
type Navigation = { navigation: NativeStackNavigationProp<RootStackParamList, "Home"> };

function EmptyListPrompt({ navigation }: Navigation) {
	const styles = getStyles(useColorScheme());
	return (
		<View style={styles.emptyListPrompt}>
			<Text style={styles.emptyListPromptText}>Parece que você não possui nenhum contato.
				{"\n"}
				Você pode adicionar um pressionando o botão abaixo</Text>
			<Button onPress={() => { navigation.navigate("Zeroconf") }} title="Adicionar contatos" />
		</View>
	)
};

function ContactList({ navigation, route }: Props) {
	const isDarkMode = useColorScheme() === 'dark';
	const styles = getStyles(useColorScheme());

	const contactList = ContactManager.contactHook();

	const backgroundStyle = styles.background;

	const hasContacts = contactList.length <= 0;

	React.useLayoutEffect(() => { if (__DEV__) navigation.setOptions({ headerRight: () => InfoButton(navigation) }); }, [navigation]);

	return (<>
		<SafeAreaView style={backgroundStyle}>
			<StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={backgroundStyle} >
				<View style={styles.background}>
					{contactList.map((contact) => <ContactEntry key={contact.uid} contact={contact} navigation={navigation} />)}
				</View>
			</ScrollView>
			{hasContacts ? <EmptyListPrompt navigation={navigation} /> : null}
		</SafeAreaView >
		{!hasContacts ? <View style={{
			position: 'absolute',
			bottom: 10,
			right: 10
		}}>
			<PlusButton size={50} background={styles.mainColor.color} color={styles.secondaryColor.color} onPress={() => { navigation.navigate("Zeroconf"); }} />
		</View> : null}
	</>
	);
};

export default ContactList;