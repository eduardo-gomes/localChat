import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import { ContactInfo } from '../lib';

const CONTACTS_KEY = "CONTACTS";
const contacts = new MMKVLoader().withInstanceID("contacts").initialize();

type ContactInfoMap = {
	[key: string]: ContactInfo
};

function getContacts() {
	let object = contacts.getMap(CONTACTS_KEY) as ContactInfoMap ?? {};
	if (object instanceof Array)
		object = {};
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

function hasUser(uid: string) {
	let list = getContacts();
	return list.hasOwnProperty(uid);
}

import { useMessages, sendMessage } from "./messageTransmitter";

const ContactManager = {
	getContacts,
	addContact,
	contactHook,
	setName,
	useMessages,
	sendMessage,
	hasUser,
};

export default ContactManager;

export { getContacts, addContact };

import type { Message } from "./messageTransmitter";
export type { Message };