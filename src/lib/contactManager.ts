import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

import { ContactInfo } from '../lib';


const contacts = new MMKVLoader().withInstanceID("contacts").initialize();

let inMemory: ContactInfo[] | null;

function getContacts() {
	if (inMemory) return inMemory;
	inMemory = contacts.getArray("CONTACTS") as ContactInfo[] ?? [];
	return inMemory;
}

type CallbackType = ((contacts: ContactInfo[]) => void) | undefined;
let callback: CallbackType;

function addContact(contact: ContactInfo) {
	inMemory = getContacts();
	inMemory.push(contact);
	contacts.setArray("CONTACTS", inMemory);
	if (callback) callback(inMemory);
}

function setCallback(_callback: CallbackType){
	callback = _callback;
}

function contactHook(){
	const [contactsArray, setContacts] = useMMKVStorage<ContactInfo[]>("CONTACTS", contacts, []);
	return contactsArray;
}

const ContactManager = {
	getContacts,
	addContact,
	contactHook,
	clear: () =>{
		inMemory = [];
		contacts.setArray("CONTACTS", inMemory);
	}
};

export default ContactManager;

export { getContacts, addContact, setCallback };