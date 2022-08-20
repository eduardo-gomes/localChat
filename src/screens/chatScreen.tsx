import React, { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Pressable, ScrollView, Text, TextInput, TextStyle, ToastAndroid, useColorScheme, View, ViewStyle } from "react-native";
import { getStyles } from "../styles";
import DocumentPicker from "react-native-document-picker";
import FileViewer from "react-native-file-viewer";

import BotãoRedondo from "../botãoRedondo";
import ContactManager from "../lib/contactManager";
import type { Message, File } from "../lib/messageTransmitter";
import { StoredFileMessage } from "../lib/messageStorage";
import { sizeInBlocks } from "../lib/fileStorage";

type Props = NativeStackScreenProps<RootStackParamList, "EditContact">;

function InputBox({ onText: onPress, onFile }: { onText: (msg: string) => void, onFile: (file: File) => void }) {
	const styles = getStyles(useColorScheme());
	const [message, setMessage] = React.useState("");
	function callback() {
		onPress(message);
		setMessage("");
	}

	function fileCallback() {
		console.log("Want to send file");
		DocumentPicker.pick({ copyTo: "documentDirectory" }).then((result) => {
			let mapped = result
				.map(({ name, size, fileCopyUri }) => ({ name, size, path: fileCopyUri }))
				.filter(element => element.size != null && element.path != null) as { name: string, size: number, path: string }[];
			mapped.forEach(onFile);
		}).catch(e => console.warn("Failed to pick file:", e));
	}

	return (
		<View style={{ margin: 5, flexDirection: "row" }}>
			<BotãoRedondo size={50} background={styles.mainColor.color} color={styles.secondaryColor.color} character="+" onPress={fileCallback} onLongPress={() => ToastAndroid.show("Enviar arquivo", ToastAndroid.SHORT)} />
			<TextInput style={{ ...styles.textFormInput, flexGrow: 1 }} value={message} onChangeText={setMessage} placeholder="Mensagem" />
			<BotãoRedondo size={50} background={styles.mainColor.color} color={styles.secondaryColor.color} character="➤" onPress={callback} onLongPress={() => ToastAndroid.show("Enviar mensagem", ToastAndroid.SHORT)} />
		</View>);
}

function MessageView({ msg }: { msg: Message | File }) {
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

	let _msg = msg;
	if ((_msg as Message).content) {
		const msg = _msg as Message;
		return (
			<View style={style}>
				<Text style={styles.messageText}>{msg.content}</Text>
				{notSent ? <Text style={styles.messageStatus}>Não enviada</Text> : undefined}
			</View>
		);
	} else {
		const msg = _msg as File;
		const fileProgress = function getFileProgress() {
			const got = (msg as StoredFileMessage).last_confirmed + 1;
			const blocks = sizeInBlocks(msg.size);
			if (blocks == got)
				return 100;
			else
				return Math.max(got / blocks, 0) * 100;
		}();
		const fileTransferred: boolean = (fileProgress >= 100);
		const status = (fileTransferred ? undefined : (msg.local && !msg.sent ? " | Não enviado" : " | Transferência incompleta :" + fileProgress.toFixed(1) + "%"));
		function open() {
			if (!msg.local && !fileTransferred) {
				ToastAndroid.show("Arquivo incompleto!", ToastAndroid.SHORT);
				return;
			}
			const path = msg.path.replace("file:", "");
			FileViewer.open(path).then(() => console.log("open:", path)).catch((error) => {
				console.error("Could not open file:", path, error);
			});
		}
		return (
			<Pressable onPress={open}>
				<View style={style}>
					<Text style={styles.messageText}>File: {msg.name}</Text>
					<Text style={styles.messageStatus}>Size: {msg.size}{status}</Text>
				</View>
			</Pressable>
		);
	}
}

export default function ChatScreen({ navigation, route }: Props) {
	const contact = route.params;
	useEffect(() => { navigation.setOptions({ title: `Chat ${contact.name}` }); }, [contact.name]);

	function send(message: string) {
		ContactManager.sendMessage(contact, { content: message });
	}
	function sendFile(file: File) {
		ContactManager.sendMessage(contact, file);
	}
	const array = ContactManager.useMessages(contact);
	return (
		<View style={{ display: "flex", height: "100%" }}>
			<ScrollView style={{ flexBasis: 100 }}>
				{array.map((i, idx) => <MessageView key={idx} msg={i} />)}
			</ScrollView>
			<InputBox onText={send} onFile={sendFile} />
		</View>
	);
}