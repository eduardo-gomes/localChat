enum MessageTypes {
	BANNER = "BANNER",
	TEXT_MESSAGE = "MESSAGE_TXT",
	TEXT_MESSAGE_ACK = "TXT_ACK"
};

interface NetMessage {
	type: string
};

type BannerMessage = {
	type: MessageTypes.BANNER,
	id: string
};

type TextMessage = {
	type: MessageTypes.TEXT_MESSAGE,
	content: string,
	id: string
};

type TextMessageAck = {
	type: MessageTypes.TEXT_MESSAGE_ACK,
	id: string
};

export type { NetMessage, BannerMessage, TextMessage, TextMessageAck };
export { MessageTypes };