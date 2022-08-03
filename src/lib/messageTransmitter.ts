///Store and transmit messages
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";
import RNFS from "react-native-fs";

import type { ContactInfo } from '../lib';
import { MessageTypes, TextMessage, TextMessageAck, FileMessage, FileRequestMessage } from "./netMessages";
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
type File = {
	path: string,
	id?: string,
	name: string,
	size: number,
	isFile?: true,
	sent?: boolean,
	transferred?: boolean
	local?: boolean,
};
interface StoredFileMessage extends File {
	id: string,
	isFile: true,
	local: boolean,
};
type StoredAnyMessage = StoredFileMessage | StoredMessage;

function useMessages(contact: ContactInfo) {
	const [message] = useMMKVStorage<StoredAnyMessage[]>(contact.uid, messages, []);
	return message
}

function sendMessage(contact: ContactInfo, messageSource: Message | File) {
	const id = generateRandomUUID();
	const local = true;
	function parse(src: Message | File): StoredAnyMessage {
		if ((src as Message).content) {
			const content = (src as Message).content;
			return { content, id, local, sent: false };
		} else {
			let src = messageSource as File;
			return { isFile: true, id, local, sent: false, name: src.name, path: src.path, size: src.size };
		}
	}
	let message = parse(messageSource);
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

function receiveFileMessage(uid: string, { name, size, id }: FileMessage): string {
	const folder = `${RNFS.DocumentDirectoryPath}/${uid}/${id}`;
	RNFS.mkdir(folder).then(console.log).catch(console.error);
	const path = `${folder}/${name}`;
	console.log("[transmitter] path to receive file:", path, name);
	let message: StoredFileMessage = { name, size, id, isFile: true, local: false, path };;
	appendMessage(uid, message);
	return path;
}

function findMessage(uid: string, id: string) {
	let array = messages.getArray<StoredAnyMessage>(uid) ?? [];
	return array.find(msg => msg.id == id);
}

function setFileSent(uid: string, id: string, value: boolean) {
	let array = messages.getArray<StoredAnyMessage>(uid) ?? [];
	const pos = array.findIndex(msg => msg.id == id);
	if (pos == -1) return undefined;
	array[pos].sent = value;
}

////Networking:

import { Connection } from "./socket";
import { FileReceiver, sendFile } from "./fileSocket";
import generateRandomUUID from "./uuid";

async function receiveFileMessageAndRequest(origin: Connection, uid: string, fileMsg: FileMessage) {
	const path = receiveFileMessage(uid, fileMsg);
	let receiver = new FileReceiver(path, 7000);
	const { port } = await receiver.addrPromise;
	console.log()
	origin.send({ type: MessageTypes.FILE_MESSAGE_REQUEST, id: fileMsg.id, port });
	console.log(`[Transmitter] File request: ids: ${uid}/${fileMsg.id}, name: ${fileMsg.name}, size: ${fileMsg.size}, toPort: ${port}, saveTo: ${path}`);
	receiver.getPromise.then(() => {
		console.log("[Transmitter]Received:", fileMsg);
		setFileSent(uid, fileMsg.id, true);
	}).catch((e) => {
		console.warn("[Transmitter]File receiver Failed:", e);
		setFileSent(uid, fileMsg.id, false);
	});
}

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

function sendFileToUser(uid: string, request: FileRequestMessage, address: string) {
	const stored = findMessage(uid, request.id);
	if (!stored) {
		console.log("FileMessage not found, user:", uid, "message id", request.id);
		return;
	}
	if ((stored as StoredFileMessage).isFile) {
		const { path, size } = (stored as StoredFileMessage);
		sendFile(path, size, { address, port: request.port }).then(() => setFileSent(uid, request.id, true)).catch(() => {
			console.log("Failed do send file", uid, request.id);
			setFileSent(uid, request.id, false);
		});
	}
}

function onIncomingMessage({ origin, msg }: { origin: Connection, msg: TextMessage | TextMessageAck | FileMessage | FileRequestMessage }) {
	const uid = origin.getPeerId()
	if (msg.type == MessageTypes.TEXT_MESSAGE) {
		// console.log("From", uid, "got message:", msg);
		origin.send({ type: MessageTypes.TEXT_MESSAGE_ACK, id: msg.id } as TextMessageAck);
		receiveMessage(uid, msg);
	} else if (msg.type == MessageTypes.FILE_MESSAGE) {
		console.log("Received file message:", msg);
		receiveFileMessageAndRequest(origin, uid, msg);
	} else if (msg.type == MessageTypes.FILE_MESSAGE_REQUEST) {
		console.log("Received file request:", msg);
		if (origin.address)
			sendFileToUser(uid, msg, origin.address);
		else
			throw "Received request from disconnected socket!";
	} else
		unQueueMessage(uid, msg.id);
}

export { useMessages, sendMessage, sendToConnection, onIncomingMessage };
export type { Message, File };