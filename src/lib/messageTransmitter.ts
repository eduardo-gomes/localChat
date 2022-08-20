///Store and transmit messages
import type { ContactInfo } from '../lib';
import { MessageTypes, TextMessage, TextMessageAck, FileMessage, FileDataMessage, FileAckMessage, FileAckData } from "./netMessages";
import { sendIfConnected } from "./messageConnectedTransmit";
import { ackMessage, appendMessage, confirmFileBlock, findMessage, getPending } from "./messageStorage";
import { createFilePath, storeFileData } from "./fileStorage";
import type { Message, File, StoredAnyMessage, StoredMessage, StoredFileMessage } from "./messageStorage";

function sendMessage(contact: ContactInfo, messageSource: Message | File) {
	const id = generateRandomUUID();
	const local = true;
	function parse(src: Message | File): StoredAnyMessage {
		if ((src as Message).content) {
			const content = (src as Message).content;
			return { content, id, local, sent: false };
		} else {
			let src = messageSource as File;
			return { isFile: true, id, local, sent: false, name: src.name, path: src.path, size: src.size, last_confirmed: -1 };
		}
	}
	let message = parse(messageSource);
	appendMessage(contact.uid, message);
	sendIfConnected(contact.uid);
}

function receiveMessage(uid: string, textMessage: TextMessage) {
	const id = textMessage.id;
	const local = false;
	const content = textMessage.content;
	let message: StoredMessage = { content, id, local };;
	appendMessage(uid, message);
}

function receiveFileMessage(uid: string, { name, size, id }: FileMessage) {
	const path = createFilePath(uid, id, name);
	console.log("[transmitter] path to receive file:", path, name);
	let message: StoredFileMessage = { name, size, id, isFile: true, local: false, path, last_confirmed: -1 };;
	appendMessage(uid, message);
}
function receiveFile(uid: string, msg: FileMessage) {
	receiveFileMessage(uid, msg);
}

function receiveFileData(uid: string, msg: FileDataMessage) {
	const file = findMessage(uid, msg.id) as StoredFileMessage;
	storeFileData(file, msg).then(() => {
		const block = msg.block_offset;
		if (file.last_confirmed == block - 1) {
			confirmFileBlock(uid, { block, id: msg.id });
			console.log("Should send file ack")
		}
	}).catch((e) => console.error("Failed to store", file.path, msg.block_offset, e));
}

////Networking:

import { Connection } from "./socket";
import generateRandomUUID from "./uuid";

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
				// Send FileMessage or FileData
				return { type: MessageTypes.FILE_MESSAGE, id: msg.id, name: msg.name, size: msg.size } as FileMessage;
			}
		}
		connection.send(toNetMessage(msg));
	})
}

function onIncomingMessage({ origin, msg }: { origin: Connection, msg: TextMessage | TextMessageAck | FileMessage | FileDataMessage | FileAckMessage | FileAckData }) {
	const uid = origin.getPeerId()
	if (msg.type == MessageTypes.TEXT_MESSAGE) {
		// console.log("From", uid, "got message:", msg);
		origin.send({ type: MessageTypes.TEXT_MESSAGE_ACK, id: msg.id } as TextMessageAck);
		receiveMessage(uid, msg);
	} else if (msg.type == MessageTypes.FILE_MESSAGE) {
		console.log("Received file message:", msg);
		receiveFile(uid, msg);
	} else if (msg.type == MessageTypes.FILE_MESSAGE_DATA) {
		let obj = Object.create(msg) as FileDataMessage;
		obj.data_base64 = `[base64 length ${msg.data_base64.length}]`;
		console.log("Received file part:", obj);
		receiveFileData(uid, msg);
	} else if (msg.type == MessageTypes.FILE_DATA_ACK) {
		console.log("Received file ACK part:", msg.block_offset);
		confirmFileBlock(uid, { block: msg.block_offset, id: msg.id });
	} else
		ackMessage(uid, msg);
}

export { sendMessage, sendToConnection, onIncomingMessage };
export type { Message, File };