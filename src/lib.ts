class Contact {
	readonly uid: string
	name: string

	constructor(name: string) {
		this.name = name;
		this.uid = this.name; //Until we implement contacts
	}

	getInfo(): ContactInfo {
		return { uid: this.uid, name: this.name }
	}
}

interface MessageInfo {
};

interface ContactInfo {
	readonly name: string
	readonly uid: string
	readonly lastMessage?: MessageInfo
};

export { Contact };
export type { ContactInfo };