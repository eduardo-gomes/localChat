enum MessageTypes {
	BANNER = "BANNER",
	TEXT_MESSAGE = "MESSAGE_TXT",
	FILE_MESSAGE = "MESSAGE_FILE",
	FILE_MESSAGE_ACK = "FILE_ACK",
	FILE_MESSAGE_REQUEST = "FILE_REQUEST",
	TEXT_MESSAGE_ACK = "TXT_ACK"
};

type NetMessage = BannerMessage | TextMessage | FileMessage | FileRequestMessage | FileAckMessage | TextMessageAck;

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

type FileRequestMessage = { //peer asks for file, in response to FileMessage
	type: MessageTypes.FILE_MESSAGE_REQUEST,
	port: number, //Port where peer should send file
	id: string
};

type FileAckMessage = { //Reports if file was successfully received
	type: MessageTypes.FILE_MESSAGE_ACK,
	id: string
};

type TextMessageAck = {
	type: MessageTypes.TEXT_MESSAGE_ACK,
	id: string
};

export type { NetMessage, BannerMessage, TextMessage, TextMessageAck, FileMessage, FileRequestMessage, FileAckMessage };
export { MessageTypes };