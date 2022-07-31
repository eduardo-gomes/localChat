import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Text, TextInput, View } from "react-native";
import { RootStackParamList } from "../App";
import { NetInfoStateType, useNetInfo } from "@react-native-community/netinfo";

import { networking } from "./socket";
import ID from "./id";


export default function InfoScreen() {
	const { address, port } = networking.useAddress();
	const [clientIp, onChangeClientIp] = React.useState("10.0.2.200");
	const [clientPort, onChangeClientPort] = React.useState("5000");
	const [gotId, onGetId] = React.useState<string | null>(null);

	return (
		<View>
			<Text>Info screen</Text>
			<Text>Local IP:{address}, port: {port}</Text>
			<Text>IP:</Text><TextInput value={clientIp} onChangeText={onChangeClientIp}></TextInput>
			<Text>Port:</Text><TextInput value={clientPort} onChangeText={onChangeClientPort}></TextInput>
			<Button title="Connect and get ID" onPress={() => {
				networking.connectAndGetId(clientIp, Number(clientPort)).then(onGetId);
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