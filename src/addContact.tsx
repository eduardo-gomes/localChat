import React from 'react';
import { Button, Text } from "react-native";
import ContactManager from './lib/contactManager';


function AddContact() {
	function generateContact() {

		const contactList = ContactManager.getContacts();

		const num = contactList.length + 1;

		ContactManager.addContact({
			name: `Contato ${num}`,
			uid: String(num)
		});
	}

	return (
		<>
			<Text>Aqui serão adicionados os contatos</Text>
			<Text>Como ainda não existe a funcionalidade de adicionar contato, o botão abaixo insere um elemento na lista de contatos para visualização do layout</Text>
			<Button title='Adicionar "contato" na lista' onPress={generateContact} />
		</>
	);
}

export default AddContact;