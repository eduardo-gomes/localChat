import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { ScrollView, Text, TextInput, TextStyle, ToastAndroid, useColorScheme, View, ViewStyle } from "react-native";
import { getStyles } from "../styles";
import DocumentPicker from "react-native-document-picker";

import BotãoRedondo from "../botãoRedondo";
import ContactManager, { Message } from "../lib/contactManager";

type Props = NativeStackScreenProps<RootStackParamList, "EditContact">;

function InputBox({ onText: onPress }: { onText: (msg: string) => void }) {
	const styles = getStyles(useColorScheme());
	const [message, setMessage] = React.useState("");
	function callback() {
		onPress(message);
		setMessage("");
	}

	function fileCallback() {
		console.log("Want to send file");
		DocumentPicker.pick({ copyTo: "documentDirectory" }).then((result) => {
			let mapped = result.map(resp => ({ name: resp.name, size: resp.size, sourceUri: resp.fileCopyUri })).filter(element => element.sourceUri);
			console.log(mapped);
		});
	}

	return (
		<View style={{ margin: 5, flexDirection: "row" }}>
			<BotãoRedondo size={50} background={styles.mainColor.color} color={styles.secondaryColor.color} character="+" onPress={fileCallback} onLongPress={() => ToastAndroid.show("Enviar arquivo", ToastAndroid.SHORT)} />
			<TextInput style={{ ...styles.textFormInput, flexGrow: 1 }} value={message} onChangeText={setMessage} placeholder="Mensagem" />
			<BotãoRedondo size={50} background={styles.mainColor.color} color={styles.secondaryColor.color} character="➤" onPress={callback} onLongPress={() => ToastAndroid.show("Enviar mensagem", ToastAndroid.SHORT)} />
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
		...styles.messageBubble,
		...styles.receivedMessageColor
	};
	const isLocal = msg.local ?? false;
	const notSent = isLocal && !msg.sent;
	const style = isLocal ? messageSent : messageReceived;
	return (
		<View style={style}>
			<Text style={styles.messageText}>{msg.content}</Text>
			{notSent ? <Text style={styles.messageStatus}>Não enviada</Text> : undefined}
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
			<InputBox onText={send} />
		</View>
	);
}