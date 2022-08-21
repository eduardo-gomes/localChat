import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Button, Pressable, Text, View } from "react-native";
import { RootStackParamList } from "../App";
import { getId } from "../lib/id";
import { networking } from "../lib/socket";
import { getStyles } from "../styles";
import type { Discovered_Host } from "../lib/zeroconf";

type Props = NativeStackScreenProps<RootStackParamList, "Zeroconf">;

function ZeroconfScreen({ navigation, route }: Props) {
	const [id, setId] = React.useState("");
	React.useEffect(() => { getId().then(setId) }, []);
	const available = networking.zeroconf.useAvailable();
	const mapped = available.map(map);
	function map(host: Discovered_Host) {
		const action = () => { navigation.navigate("AddContact", { id: host.id }) };
		return (
			<Pressable onPress={action} key={host.id} style={getStyles().contactInfoList}>
				<Text>ID: {host.id}{host.id == id ? " (você)" : ""}</Text>
				<Text>{host.address}:{host.port}</Text>
			</Pressable>);
	}
	return (
		<View>
			<Text>Seu ID: {id}</Text>
			<Text>Contatos na rede:</Text>
			{mapped}
			<Button title="Adicionar manualmente" onPress={() => navigation.navigate("AddContact")} />
		</View>
	);
}

export default ZeroconfScreen;