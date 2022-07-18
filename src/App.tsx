import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Appearance, Button } from 'react-native';
import AddContact from './addContact';

import ContactList from './contactList';
import { ContactInfo } from './lib';
import { getNavigatorTheme } from './styles';
import InfoScreen from './lib/infoScreen';
import { getId } from './lib/id';

import ContactManager, { getContacts, setCallback } from "./lib/contactManager";

type RootStackParamList = {
	Home: undefined;
	AddContact: undefined;
	NetInfo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

class App extends React.Component {
	state: {
		contactInfo: ContactInfo[],
	};

	constructor(props: {}) {
		super(props);
		this.state = {
			contactInfo: [],
		};

		ContactManager.clear();//clear dummy contacts

		this.state.contactInfo = getContacts();
		setCallback((contactInfo) => this.setState({ contactInfo }));

		getId().then(console.info);
	}
	render() {
		const theme = getNavigatorTheme(Appearance.getColorScheme());

		return (
			<NavigationContainer theme={theme}>
				<Stack.Navigator>
					<Stack.Screen
						name="Home"
						component={ContactList}
						options={{ title: "Lista de contatos", headerRight: () => (__DEV__ ? <Button title="netInfo" /> : undefined) }}
					/>
					<Stack.Screen
						name="AddContact"
						component={AddContact}
					/>
					{__DEV__ ? <Stack.Screen
						name="NetInfo"
						component={InfoScreen}
					/> : undefined}
				</Stack.Navigator>
			</NavigationContainer>
		);
	}
	componentWillUnmount() {
		console.log("Will unmount app");
	}
};


export default App;
export type { RootStackParamList };