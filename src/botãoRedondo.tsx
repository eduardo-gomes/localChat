import React from "react";
import { Pressable, Text } from "react-native";

function PlusButton({ size, background, color, onPress, character }: { size: number, background: string, color: string, character?: string, onPress: () => void }) {
	if (!character) character = "+";
	return (
		<Pressable style={{
			backgroundColor: background,
			width: size,
			height: size,
			borderRadius: 50,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		}}
			onPress={onPress}
			android_ripple={{
				radius: size / 2
			}}
		>
			<Text style={{
				fontSize: size,
				textAlign: "center",
				textAlignVertical: "bottom",
				color
			}}>{character}</Text>
		</Pressable>
	);
}

export default PlusButton;