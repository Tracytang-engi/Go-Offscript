import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { UploadScreen } from '../screens/UploadScreen';
import { ValuesScreen } from '../screens/ValuesScreen';
import { PathScreen } from '../screens/PathScreen';
import { WaysInScreen } from '../screens/WaysInScreen';
import { Colors } from '../constants/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.cream },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} />
      <Stack.Screen name="Values" component={ValuesScreen} />
      <Stack.Screen name="Path" component={PathScreen} />
      <Stack.Screen name="WaysIn" component={WaysInScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
