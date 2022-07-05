import React, { useContext } from 'react';
import { Button, Text } from "react-native";
import AppContext from './context';

function AddContact() {
	const context = useContext(AppContext);
	function generateContact() {

		const contactList = context?.contactInfo ?? [];

		const num = contactList.length + 1;

		const newList = contactList.slice();
		newList.push({
			name: `Contato ${num}`,
			uid: String(num)
		});

		context?.setContactInfo(newList);
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