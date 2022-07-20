import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import { ContactInfo } from '../lib';

const CONTACTS_KEY = "CONTACTS";
const contacts = new MMKVLoader().withInstanceID("contacts").initialize();

type ContactInfoMap = {
	[key: string]: ContactInfo
};

function getContacts() {
	let object = contacts.getMap(CONTACTS_KEY) as ContactInfoMap ?? {};
	return object;
}

function addContact(contact: ContactInfo) {
	let object = getContacts();
	object[contact.uid] = contact;
	contacts.setMap(CONTACTS_KEY, object);
}

function contactHook() {
	const [contactsArray] = useMMKVStorage<ContactInfoMap>(CONTACTS_KEY, contacts, {});
	const infos = Object.values(contactsArray);
	console.log("ContactInfoMap values:", infos);
	return infos;
}

function setName(contact: ContactInfo, name: string) {
	const newContact = { ...contact, name };
	let list = getContacts();
	list[contact.uid] = newContact;
	const res = contacts.setMap(CONTACTS_KEY, list);
	console.log("setName, new contact is:", newContact, "res:", res);
}

const messages = new MMKVLoader().withInstanceID("messages").initialize();
type Message = {
	content: string
};

function useMessages(contact: ContactInfo) {
	const [message] = useMMKVStorage<Message[]>(contact.uid, messages, []);
	return message
}

function sendMessage(contact: ContactInfo, message: Message) {
	let array = messages.getArray(contact.uid) ?? [];
	array.push(message);
	messages.setArray(contact.uid, array);
}


const ContactManager = {
	getContacts,
	addContact,
	contactHook,
	setName,
	useMessages,
	sendMessage
};

export default ContactManager;

export { getContacts, addContact };

export type { Message };