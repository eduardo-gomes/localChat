///Store and transmit messages
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import type { ContactInfo } from '../lib';
import { MessageTypes, TextMessage, TextMessageAck } from "./netMessages";
import { sendIfConnected } from "./messageConnectedTransmit";

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

function sendMessage(contact: ContactInfo, messageSource: Message) {
	const id = new Date().toISOString();
	const local = true;
	const content = messageSource.content;
	let message: StoredMessage = { content, id, local };
	appendMessage(contact.uid, message);
	queueMessage(contact.uid, message);
}

function appendMessage(uid: string, message: StoredMessage) {
	let array = messages.getArray(uid) ?? [];
	array.push(message);
	messages.setArray(uid, array);
}

function receiveMessage(uid: string, textMessage: TextMessage) {
	const id = textMessage.id;
	const local = false;
	const content = textMessage.content;
	let message: StoredMessage = { content, id, local };;
	appendMessage(uid, message);
}

////Networking:

import { Connection } from "./socket";

const pendingMessages = new MMKVLoader().withInstanceID("pendingMessages").initialize();
function queueMessage(contactId: string, message: StoredMessage) {
	let array = pendingMessages.getArray<MessageWithId>(contactId) ?? [];
	array.push(message);
	pendingMessages.setArray(contactId, array);
	sendIfConnected(contactId);
}

function unQueueMessage(contactId: string, messageId: string) {
	let array = pendingMessages.getArray<MessageWithId>(contactId) ?? [];
	let removed = array.filter(msg => msg.id != messageId);
	pendingMessages.setArray(contactId, removed);
}

function sendToConnection(connection: Connection) {
	const uid = connection.getPeerId();
	const pending = pendingMessages.getArray<MessageWithId>(uid) ?? [];
	console.log(`[Message manager] send to ${uid}, pendingMessages:`, pending);
	pending.forEach((msg) => {
		let netMsg: TextMessage = { type: MessageTypes.TEXT_MESSAGE, content: msg.content, id: msg.id };
		connection.send(netMsg);
	})
}
function onIncomingMessage({ origin, msg }: { origin: Connection, msg: TextMessage | TextMessageAck }) {
	const uid = origin.getPeerId()
	if (msg.type == MessageTypes.TEXT_MESSAGE) {
		// console.log("From", uid, "got message:", msg);
		origin.send({ type: MessageTypes.TEXT_MESSAGE_ACK, id: msg.id } as TextMessageAck);
		receiveMessage(uid, msg);
	} else
		unQueueMessage(uid, msg.id);
}

export { useMessages, sendMessage, sendToConnection, onIncomingMessage };
export type { Message };