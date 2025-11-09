import { AntDesign, FontAwesome, Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';

// Importe as telas reais que já criamos
import TelaPrestadorDashboard from './TelaPrestadorDashboard';
import TelaPrestadorAgenda from './TelaPrestadorAgenda';
import TelaPrestadorPerfil from './TelaPrestadorPerfil';
// --- IMPORTE A NOVA TELA DE NOTIFICAÇÕES AQUI ---
import TelaNotificacoesPrestador from './TelaNotificacoesPrestador';

// Componente temporário para as telas que ainda não fizemos
const TelaPlaceholder = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{route.name}</Text>
    <Text>Em construção...</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const PrestadorTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1C74B4',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={TelaPrestadorDashboard}
        options={{
          tabBarIcon: ({ color, size }) => <AntDesign name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Minha Agenda"
        component={TelaPrestadorAgenda}
        options={{
          tabBarIcon: ({ color, size }) => <AntDesign name="calendar" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Meu Perfil"
        component={TelaPrestadorPerfil}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="user-circle-o" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Notificações"
        // --- USE O NOVO COMPONENTE DE NOTIFICAÇÕES AQUI ---
        component={TelaNotificacoesPrestador}
        options={{
          tabBarIcon: ({ color, size }) => <Feather name="bell" size={size} color={color} />,
          tabBarBadge: 3,
        }}
      />
    </Tab.Navigator>
  );
};

export default PrestadorTabNavigator;