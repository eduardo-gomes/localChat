import React from 'react';
import { Button, Text, TextInput, View } from "react-native";
import ContactManager from './lib/contactManager';
import ID from './lib/id';
import { networking } from './lib/socket';
import { styles } from './styles';


function AddContact() {
	function saveContactById(id: string, name?: string) {
		if (name?.length == 0)
			name = undefined;

		ContactManager.addContact({
			name: name ?? `Contato ${id}`,
			uid: id
		});
	}
	const status = networking.useServerStatus();
	const address = networking.useAddress();

	let addrElement;
	addrElement = <Text>Endereço local: {address.address}, porta: {address.port}</Text>

	const [name, setName] = React.useState("");
	const [id, setId] = React.useState("");

	const [localId, setLocalId] = React.useState<string | null>(null);

	React.useEffect(() => { ID.getId().then(setLocalId) }, []);

	function clear() {
		setName("");
		setId("");
	}

	return (
		<View style={{ padding: 10 }}>
			<Text>Server is {status.running ? "" : "not "}running</Text>
			<Text>ID: {localId ?? "..."}</Text>
			{addrElement}
			<Text style={styles.labelForm}>Nome:</Text>
			<TextInput style={styles.textFormInput} value={name} onChangeText={setName}></TextInput>
			<Text style={styles.labelForm}>ID</Text>
			<TextInput style={styles.textFormInput} value={id} onChangeText={setId} placeholder="Insira o id, ou obtenha a partir do endereço"></TextInput>
			<Button title='Salvar' onPress={() => { saveContactById(id, name); clear(); }} />
		</View>
	);
}

export default AddContact;