enum MessageTypes {
	BANNER = "BANNER",
	TEXT_MESSAGE = "MESSAGE_TXT",
	FILE_MESSAGE = "MESSAGE_FILE",
	FILE_MESSAGE_ACK = "FILE_ACK",
	FILE_MESSAGE_DATA = "FILE_DATA",
	FILE_DATA_ACK = "FILE_DATA_ACK",
	TEXT_MESSAGE_ACK = "TXT_ACK"
};

type NetMessage = BannerMessage | TextMessage | FileMessage | FileDataMessage | FileAckMessage | TextMessageAck | FileAckData;

type BannerMessage = {
	type: MessageTypes.BANNER,
	id: string
};

type TextMessage = {
	type: MessageTypes.TEXT_MESSAGE,
	content: string,
	id: string
};

type FileMessage = {
	type: MessageTypes.FILE_MESSAGE,
	name: string,
	size: number,
	id: string
};

type FileDataMessage = {
	type: MessageTypes.FILE_MESSAGE_DATA,
	id: string
	block_offset: number,
	data_base64: string
};

type FileAckData = {
	type: MessageTypes.FILE_DATA_ACK,
	id: string
	block_offset: number
};

type FileAckMessage = {
	type: MessageTypes.FILE_MESSAGE_ACK,
	id: string
};

type TextMessageAck = {
	type: MessageTypes.TEXT_MESSAGE_ACK,
	id: string
};

export type { NetMessage, BannerMessage, TextMessage, TextMessageAck, FileMessage, FileDataMessage, FileAckMessage, FileAckData };
export { MessageTypes };