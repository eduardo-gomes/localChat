import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Appearance } from 'react-native';
import AddContact from './addContact';

import ContactList from './contactList';
import AppContext, { ContextInfo } from './context';
import { ContactInfo } from './lib';
import { getNavigatorTheme } from './styles';

type RootStackParamList = {
	Home: undefined;
	AddContact: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
	const theme = getNavigatorTheme(Appearance.getColorScheme());
	const [contactInfoState, setContactListState] = React.useState<ContactInfo[]>([/*{ name: 'Contato 1', uid: "123456789" }*/]);

	const contextHolder: ContextInfo = {
		contactInfo: contactInfoState,
		setContactInfo: setContactListState,
	};

	return (
		<AppContext.Provider value={contextHolder}>
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
		</AppContext.Provider>
	);
};


export default App;
export type { RootStackParamList };