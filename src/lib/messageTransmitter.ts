///Store and transmit messages
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import type { ContactInfo } from '../lib';
import { MessageTypes, TextMessage, TextMessageAck } from "./netMessages";

const messages = new MMKVLoader().withInstanceID("messages").initialize();
type Message = {
	content: string,
	id?: string,
	sent?: boolean,
	local?: boolean
};
interface MessageWithId extends Message {
	id: string
};

interface StoredMessage extends MessageWithId {
	id: string,
	local: boolean
};

function useMessages(contact: ContactInfo) {
	const [message] = useMMKVStorage<StoredMessage[]>(contact.uid, messages, []);
	return message
}

function sendMessage(contact: ContactInfo, message: Message) {
	let array = messages.getArray(contact.uid) ?? [];
	message.id = array.length.toString();
	message.local = true;
	array.push(message);
	messages.setArray(contact.uid, array);
	queueMessage(contact.uid, message as MessageWithId);
}

////Networking:

import { Connection } from "./socket";

const pendingMessages = new MMKVLoader().withInstanceID("pendingMessages").initialize();
function queueMessage(contactId: string, message: MessageWithId) {
	let array = pendingMessages.getArray(contactId) ?? [];
	array.push(message);
	pendingMessages.setArray(contactId, array);
}

function onConnect(connection: Connection) {
	const uid = connection.getPeerId();
	const pending = pendingMessages.getArray<StoredMessage>(uid) ?? [];
	console.log(`[Message manager] Connected to ${uid}, pendingMessages:`, pending);
	pending.forEach((msg) => {
		let netMsg: TextMessage = { type: MessageTypes.TEXT_MESSAGE, content: msg.content, id: msg.id };
		connection.send(netMsg);
	})
}
function onIncomingMessage({ origin, msg }: { origin: Connection, msg: TextMessage | TextMessageAck }) {
	const uid = origin.getPeerId()
	if (msg.type == MessageTypes.TEXT_MESSAGE) {
		console.log("From", uid, "got message:", msg);
		origin.send({ type: MessageTypes.TEXT_MESSAGE_ACK, id: msg.id } as TextMessageAck);
	} else
		console.log("From", uid, "ACK message id:", msg.id);
}

export { useMessages, sendMessage, onConnect, onIncomingMessage };
export type { Message };