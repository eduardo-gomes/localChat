interface Message {
	type: String
};

type BannerMessage = {
	type: "Banner",
	id: String
};

export type {Message, BannerMessage};