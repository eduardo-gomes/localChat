import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Appearance, Button } from 'react-native';
import AddContact from './addContact';

import ContactList from './contactList';
import { ContactInfo } from './lib';
import { getNavigatorTheme, NavigatorTheme } from './styles';
import InfoScreen from './lib/infoScreen';
import { getId } from './lib/id';

import { networking } from './lib/socket';
import EditContact from './screens/editContact';

type RootStackParamList = {
	Home: undefined;
	AddContact: undefined;
	NetInfo: undefined;
	EditContact: ContactInfo;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

networking.log();

class App extends React.Component {
	state: {
		theme: NavigatorTheme
	};
	schemeListener;

	constructor(props: {}) {
		super(props);
		this.state = {
			theme: getNavigatorTheme(Appearance.getColorScheme())
		};
		this.schemeListener = Appearance.addChangeListener((preferences: Appearance.AppearancePreferences) => {this.setState({theme: getNavigatorTheme(preferences.colorScheme)})});

		getId().then(console.info);
	}
	render() {
		const theme = this.state.theme;

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
					<Stack.Screen
						name="EditContact"
						component={EditContact}
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
		this.schemeListener.remove();
		console.log("Will unmount app");
		networking.close();
	}
};


export default App;
export type { RootStackParamList };