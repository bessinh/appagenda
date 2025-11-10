// src/screens/TabNavigator.js - VERSÃO CORRIGIDA FINAL

import { AntDesign, Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Importa as telas
import TelaAgenda from './TelaAgenda';
import TelaBuscar from './TelaBuscar';
import TelaInicial from './TelaInicial';
import TelaMenu from './TelaMenu';
import DetalhesProfissionalScreen from './DetalhesProfissionalScreen';
import TelaNotificacoesCliente from './TelaNotificacoesCliente';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BuscarStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="TelaBuscar"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="TelaBuscar" component={TelaBuscar} />
            <Stack.Screen
                name="DetalhesProfissional"
                component={DetalhesProfissionalScreen}
                options={{ headerShown: true, title: 'Detalhes' }}
            />
            <Stack.Screen
                name="AgendaScreen"
                component={TelaAgenda}
                options={{ headerShown: true, title: 'Agendar' }}
            />
        </Stack.Navigator>
    );
};

// MUDANÇA 1: Adicionamos "navigation" aqui para receber a navegação principal
const MainTabNavigator = ({ navigation, route = { params: {} }, onLogout }) => {
    const user = route?.params?.user;

    return (
        <Tab.Navigator
            initialRouteName="Início"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#aaa',
                tabBarStyle: {
                    backgroundColor: '#1C74B4',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
            }}
        >
            <Tab.Screen
                name="Início"
                component={TelaInicial}
                initialParams={{ user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Buscar"
                component={BuscarStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="search" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Agenda"
                component={TelaAgenda}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="calendar" size={size} color={color} />
                    ),
                }}
            />
           
          
            
        
            <Tab.Screen
                name="Menu"
                children={() => <TelaMenu navigation={navigation} onLogout={onLogout} />}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="bars" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;