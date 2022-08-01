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
	let message: StoredMessage = { content, id, local, sent: false };
	appendMessage(contact.uid, message);
	sendIfConnected(contact.uid);
}

function appendMessage(uid: string, message: StoredMessage) {
	let array = messages.getArray<StoredMessage>(uid) ?? [];
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

function getPending(contactId: string){
	let array = messages.getArray<StoredMessage>(contactId) ?? [];
	return array.filter(msg => msg.local && msg.sent == false);
}

function unQueueMessage(contactId: string, messageId: string) {
	let array = messages.getArray<StoredMessage>(contactId) ?? [];
	let found = array.find(msg => msg.local && msg.id == messageId);
	if(!found) return;
	found.sent = true;
	messages.setArray(contactId, array);
}

function sendToConnection(connection: Connection) {
	const uid = connection.getPeerId();
	const pending = getPending(uid);
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