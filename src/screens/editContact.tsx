import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Button, Text, TextInput, useColorScheme, View } from "react-native";
import { RootStackParamList } from "../App";
import ContactManager from "../lib/contactManager";
import { getStyles } from "../styles";

type Props = NativeStackScreenProps<RootStackParamList, "EditContact">;

export default function EditContact({ navigation, route }: Props) {
	const styles = getStyles(useColorScheme());
	const contact = route.params;
	const [name, setName] = React.useState(contact.name);
	function updateName() {
		ContactManager.setName(contact, name);
	}
	return (<View>
		<Text>ID</Text>
		<Text>{contact.uid}</Text>
		<Text>Nome</Text>
		<TextInput style={styles.textFormInput} value={name} onChangeText={setName} />
		<Button title="Salvar" onPress={updateName} />
	</View>);
}