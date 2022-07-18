enum MessageTypes {
	BANNER = "Banner"
};

interface Message {
	type: string
};

type BannerMessage = {
	type: MessageTypes.BANNER,
	id: string
};

export type { Message, BannerMessage };
export { MessageTypes };