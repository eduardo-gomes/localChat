///Store and transmit messages
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import type { ContactInfo } from '../lib';
import { MessageTypes, TextMessage } from "./netMessages";

const messages = new MMKVLoader().withInstanceID("messages").initialize();
type Message = {
	content: string,
	sent?: boolean
};

function useMessages(contact: ContactInfo) {
	const [message] = useMMKVStorage<Message[]>(contact.uid, messages, []);
	return message
}

function sendMessage(contact: ContactInfo, message: Message) {
	let array = messages.getArray(contact.uid) ?? [];
	array.push(message);
	messages.setArray(contact.uid, array);
	queueMessage(contact.uid, message);
}

////Networking:

import { Connection } from "./socket";

const pendingMessages = new MMKVLoader().withInstanceID("pendingMessages").initialize();
function queueMessage(contactId: string, message: Message) {
	let array = pendingMessages.getArray(contactId) ?? [];
	array.push(message);
	pendingMessages.setArray(contactId, array);
}

function onConnect(connection: Connection) {
	const uid = connection.getPeerId();
	const pending = pendingMessages.getArray<Message>(uid) ?? [];
	console.log(`[Message manager] Connected to ${uid}, pendingMessages:`, pending);
	pending.forEach((msg) => {
		let netMsg: TextMessage = { type: MessageTypes.TEXT_MESSAGE, content: msg.content };
		connection.send(netMsg);
	})
}

export { useMessages, sendMessage, onConnect };
export type { Message };