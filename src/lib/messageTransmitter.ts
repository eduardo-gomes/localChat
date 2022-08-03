///Store and transmit messages
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import type { ContactInfo } from '../lib';
import { MessageTypes, TextMessage, TextMessageAck, FileMessage } from "./netMessages";
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
type StoredFileMessage = {
	path: string,
	id: string,
	name: string,
	size: number,
	isFile: true,
	sent?: boolean,
	local: boolean,
};
type StoredAnyMessage = StoredFileMessage | StoredMessage;

function useMessages(contact: ContactInfo) {
	const [message] = useMMKVStorage<StoredAnyMessage[]>(contact.uid, messages, []);
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

function appendMessage(uid: string, message: StoredAnyMessage) {
	let array = messages.getArray<StoredAnyMessage>(uid) ?? [];
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

function getPending(contactId: string) {
	let array = messages.getArray<StoredAnyMessage>(contactId) ?? [];
	return array.filter(msg => msg.local && msg.sent == false);
}

function unQueueMessage(contactId: string, messageId: string) {
	let array = messages.getArray<StoredAnyMessage>(contactId) ?? [];
	let found = array.find(msg => msg.local && msg.id == messageId);
	if (!found) return;
	found.sent = true;
	messages.setArray(contactId, array);
}

function sendToConnection(connection: Connection) {
	const uid = connection.getPeerId();
	const pending = getPending(uid);
	console.log(`[Message manager] send to ${uid}, pendingMessages:`, pending);
	pending.forEach((msg) => {
		function toNetMessage(_msg: StoredAnyMessage) {
			if ((_msg as StoredMessage).content) {
				const msg = _msg as StoredMessage;
				return { type: MessageTypes.TEXT_MESSAGE, content: msg.content, id: msg.id } as TextMessage;
			} else {
				const msg = _msg as StoredFileMessage;
				return { type: MessageTypes.FILE_MESSAGE, id: msg.id, name: msg.name, size: msg.size } as FileMessage;
			}
		}
		connection.send(toNetMessage(msg));
	})
}
function onIncomingMessage({ origin, msg }: { origin: Connection, msg: TextMessage | TextMessageAck | FileMessage }) {
	const uid = origin.getPeerId()
	if (msg.type == MessageTypes.TEXT_MESSAGE) {
		// console.log("From", uid, "got message:", msg);
		origin.send({ type: MessageTypes.TEXT_MESSAGE_ACK, id: msg.id } as TextMessageAck);
		receiveMessage(uid, msg);
	} else if (msg.type == MessageTypes.FILE_MESSAGE) {
		console.log("Received file message:", msg);
	} else
		unQueueMessage(uid, msg.id);
}

export { useMessages, sendMessage, sendToConnection, onIncomingMessage };
export type { Message };