import React from 'react';
import { Button, Text, TextInput, useColorScheme, View } from "react-native";
import ContactManager from './lib/contactManager';
import ID from './lib/id';
import { networking } from './lib/socket';
import { getStyles } from './styles';

function GetIdFromAddress({ onGetId }: { onGetId: (id: string) => void }) {
	const styles = getStyles(useColorScheme());
	const [clientIp, onChangeClientIp] = React.useState("");
	const [clientPort, onChangeClientPort] = React.useState("");

	return (
		<View style={{ marginTop: 20 }}>
			<Text style={styles.labelForm}>O ID pode ser obtido a partir do endereço e porta do dispositivo:</Text>
			<TextInput style={styles.textFormInput} placeholder="Endereço" value={clientIp} onChangeText={onChangeClientIp} />
			<TextInput style={styles.textFormInput} placeholder="Porta" value={clientPort} onChangeText={onChangeClientPort} />
			<Button title='obter id' onPress={() => {
				networking.connectAndGetId(clientIp, Number(clientPort)).then(onGetId);
			}} />
		</View>);
}

function AddContact() {
	const styles = getStyles(useColorScheme());
	function saveContactById(id: string, name?: string) {
		if (name?.length == 0)
			name = undefined;

		if (id.length == 0)
			return false;//Can't create contact with null id

		ContactManager.addContact({
			name: name ?? `Contato ${id}`,
			uid: id
		});
		return true;
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
			<Button title='Salvar' onPress={() => { if (saveContactById(id, name)) clear(); }} />
			{id.length ? undefined : <GetIdFromAddress onGetId={setId} />}
		</View>
	);
}

export default AddContact;