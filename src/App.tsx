import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Appearance } from 'react-native';
import AddContact from './addContact';

import ContactList from './contactList';
import { getNavigatorTheme } from './styles';

type RootStackParamList = {
	Home: undefined;
	AddContact: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
	const theme = getNavigatorTheme(Appearance.getColorScheme());

	return (
		<NavigationContainer theme={theme}>
			<Stack.Navigator>
				<Stack.Screen
					name="Home"
					component={ContactList}
					options={{ title: "Lista de contatos" }}
				/>
				<Stack.Screen
					name="AddContact"
					component={AddContact}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};


export default App;
export type { RootStackParamList };