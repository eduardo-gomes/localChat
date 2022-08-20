import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import type { ContactInfo } from '../lib';
import { sizeInBlocks } from "./fileStorage";
import { FileAckMessage, TextMessageAck } from "./netMessages";

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
	local?: boolean,
};
interface StoredFileMessage extends File {
	id: string,
	isFile: true,
	local: boolean,
	last_confirmed: number
};
type StoredAnyMessage = StoredFileMessage | StoredMessage;

function useMessages(contact: ContactInfo) {
	const [message] = useMMKVStorage<StoredAnyMessage[]>(contact.uid, messages, []);
	return message
}

function appendMessage(uid: string, message: StoredAnyMessage) {
	let array = messages.getArray<StoredAnyMessage>(uid) ?? [];
	array.push(message);
	messages.setArray(uid, array);
}

function findMessage(uid: string, id: string) {
	let array = messages.getArray<StoredAnyMessage>(uid) ?? [];
	return array.find(msg => msg.id == id);
}

function getPending(contactId: string) {
	let array = messages.getArray<StoredAnyMessage>(contactId) ?? [];
	function isPending(msg: StoredAnyMessage){
		if(msg.local != true)
			return false;
		if((msg as StoredFileMessage).isFile == true){
			let file = msg as StoredFileMessage;
			return file.last_confirmed+1 < sizeInBlocks(file.size);
		}else{
			return !msg.sent;
		}
	}
	return array.filter(isPending);
}

function ackMessage(contactId: string, ack: TextMessageAck | FileAckMessage) {
	let id = ack.id;
	let array = messages.getArray<StoredAnyMessage>(contactId) ?? [];
	let found = array.find(msg => msg.local && msg.id == id);
	//TODO: Ack file blocks
	if (!found) return;
	found.sent = true;
	messages.setArray(contactId, array);
}

function confirmFileBlock(uid: string, { block, id }: { block: number, id: string }) {
	let array = messages.getArray<StoredAnyMessage>(uid) ?? [];
	const idx = array.findIndex((msg) => msg.id == id && (msg as StoredFileMessage)["isFile"] == true)
	if (idx == -1) {
		console.error("Did not find file to confirm block:", uid, id);
		return;
	}
	(array[idx] as StoredFileMessage).last_confirmed = block;
	messages.setArray(uid, array);
}

export { appendMessage, findMessage, getPending, ackMessage, confirmFileBlock };
export { useMessages };
export type { Message, MessageWithId, StoredMessage, File, StoredFileMessage, StoredAnyMessage };