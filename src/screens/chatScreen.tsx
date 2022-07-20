import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { ScrollView, Text, TextInput, TextStyle, useColorScheme, View, ViewStyle } from "react-native";
import { getStyles } from "../styles";

import BotãoRedondo from "../botãoRedondo";
import ContactManager, { Message } from "../lib/contactManager";

type Props = NativeStackScreenProps<RootStackParamList, "EditContact">;

function InputBox({ onPress }: { onPress: (msg: string) => void }) {
	const styles = getStyles(useColorScheme());
	const [message, setMessage] = React.useState("");
	function callback() { onPress(message); }

	return (
		<View style={{ margin: 5, flexDirection: "row" }}>
			<TextInput style={{ ...styles.textFormInput, flexGrow: 1 }} value={message} onChangeText={setMessage} placeholder="Mensagem" />
			<BotãoRedondo size={50} background={styles.mainColor.color} color={styles.secondaryColor.color} character="⭆" onPress={callback} />
		</View>);
}

function MessageView({ msg }: { msg: Message }) {
	const styles = getStyles(useColorScheme());
	const messageSent: ViewStyle = {
		alignSelf: "flex-end",
		marginRight: 20,
		...styles.messageBubble
	};
	const messageReceived: ViewStyle = {
		alignSelf: "flex-start",
		marginLeft: 20,
		...styles.messageBubble
	};
	return (
		<View style={messageSent}>
			<Text style={styles.messageText}>{msg.content}</Text>
			<Text style={styles.messageStatus}>Não enviada</Text>
		</View>
	);
}

export default function ChatScreen({ navigation, route }: Props) {
	const contact = route.params;
	useEffect(() => { navigation.setOptions({ title: `Chat ${contact.name}` }); }, [contact.name]);

	function send(message: string) {
		ContactManager.sendMessage(contact, { content: message });
	}
	const array = ContactManager.useMessages(contact);
	return (
		<View style={{ display: "flex", height: "100%" }}>
			<ScrollView style={{ flexBasis: 100 }}>
				{array.map((i, idx) => <MessageView key={idx} msg={i} />)}
			</ScrollView>
			<InputBox onPress={send} />
		</View>
	);
}