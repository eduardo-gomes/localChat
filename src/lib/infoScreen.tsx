import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Text, TextInput, View } from "react-native";
import { RootStackParamList } from "../App";

import { networking } from "./socket";
import ID from "./id";


export default function InfoScreen() {
	const addr = networking.getAddress();
	const [ip, onChangeIp] = React.useState("10.0.2.200");
	const [port, onChangePort] = React.useState("5000");
	const [gotId, onGetId] = React.useState<string | null>(null);

	return (
		<View>
			<Text>Info screen</Text>
			<Text>{JSON.stringify(addr)}</Text>
			<Text>IP:</Text><TextInput value={ip} onChangeText={onChangeIp}></TextInput>
			<Text>Port:</Text><TextInput value={port} onChangeText={onChangePort}></TextInput>
			<Button title="Send hello" onPress={() => {
				networking.probeId(ip, Number(port)).then(onGetId);
			}} />
			{gotId ? <Text>Id: {gotId}</Text> : undefined}
			<Button title="Reset ID" onPress={ID.resetId} />
		</View>
	);
}

type Navigation<Screen extends keyof RootStackParamList> = NativeStackNavigationProp<RootStackParamList, Screen>;

function InfoButton<Screen extends keyof RootStackParamList>(navigation: Navigation<Screen>) {
	return (<Button onPress={() => { navigation.navigate("NetInfo"); }} title="NetInfo" />);
}

export { InfoButton };