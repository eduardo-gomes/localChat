enum MessageTypes {
	BANNER = "BANNER",
	TEXT_MESSAGE = "MESSAGE_TXT"
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
	content: string
};

export type { NetMessage, BannerMessage, TextMessage };
export { MessageTypes };