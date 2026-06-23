import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/Auth/WelcomeScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import TermsScreen from '../screens/Auth/TermsScreen';

import BuyerNavigator from './BuyerNavigator';
import { SellerNavigator, AdminNavigator, DeliveryNavigator } from './RoleNavigators';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />

        {/* Role-based app shells */}
        <Stack.Screen name="BuyerApp" component={BuyerNavigator} />
        <Stack.Screen name="SellerApp" component={SellerNavigator} />
        <Stack.Screen name="AdminApp" component={AdminNavigator} />
        <Stack.Screen name="DeliveryApp" component={DeliveryNavigator} />

        {/* Quick role switcher used after login (demo only) */}
        <Stack.Screen name="RoleRouter" component={BuyerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
