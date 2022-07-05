import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ContactList from './contactList';
import { styles } from './styles';

const Stack = createNativeStackNavigator();

const App = () => {

	return (
		<NavigationContainer>
			<Stack.Navigator>
				<Stack.Screen
					name="Home"
					component={ContactList}
					options={{ title: "Lista de contatos", headerStyle: styles.navigatorHeader, headerTintColor: styles.navigatorHeader.color }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};


export default App;
