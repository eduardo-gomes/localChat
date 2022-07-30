///Store and transmit messages
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import type { ContactInfo } from '../lib';

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
}

export { useMessages, sendMessage };
export type { Message };