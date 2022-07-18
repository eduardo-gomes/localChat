import React from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Text, View } from "react-native";
import { RootStackParamList } from "../App";

import { networking } from "./socket";
import ID from "./id";


export default function InfoScreen() {
	const addr = networking.getAddress();

	return (
		<View>
			<Text>Info screen</Text>
			<Text>{JSON.stringify(addr)}</Text>
			<Button title="Send hello" onPress={networking.sendHello}/>
			<Button title="Reset ID" onPress={ID.resetId} />
		</View>
	);
}

type Navigation<Screen extends keyof RootStackParamList> = NativeStackNavigationProp<RootStackParamList, Screen>;

function InfoButton<Screen extends keyof RootStackParamList>(navigation: Navigation<Screen>) {
	return (<Button onPress={() => {navigation.navigate("NetInfo");}} title="NetInfo"/>);
}

export {InfoButton};