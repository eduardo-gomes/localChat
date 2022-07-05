import React from "react";
import { Pressable, Text } from "react-native";

function PlusButton({ size, background, color, onPress }: { size: number, background: string, color: string, onPress: () => void }) {
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
			}}>+</Text>
		</Pressable>
	);
}

export default PlusButton;