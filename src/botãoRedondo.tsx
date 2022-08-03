import React from "react";
import { Pressable, Text } from "react-native";

function PlusButton({ size, background, color, onPress, onLongPress, character }: { size: number, background: string, color: string, character?: string, onPress: () => void, onLongPress?: () => void }) {
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
			onLongPress={onLongPress}
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