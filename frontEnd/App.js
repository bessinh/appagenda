
import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import * as Notifications from 'expo-notifications';

// Importação de todas as telas
import MainTabNavigator from './src/screens/TabNavigator';
import PrestadorTabNavigator from './src/screens/PrestadorTabNavigator';
import TelaBemVindo from './src/screens/TelaBemVindo';
import TelaCadastro from './src/screens/TelaCadastro';
import TelaLogin from './src/screens/TelaLogin';
import TelaEsqueciSenha from './src/screens/TelaEsqueciSenha';
import TelaVerificacaoCodigo from './src/screens/TelaVerificacaoCodigo';
import TelaNovaSenha from './src/screens/TelaNovaSenha';

import TelaDetalhesConsulta from './src/screens/TelaDetalhesConsulta';
import TelaMotivoCancelamento from './src/screens/TelaMotivoCancelamento';
import DetalhesProfissionalScreen from './src/screens/DetalhesProfissionalScreen';
import TelaAgenda from './src/screens/TelaAgenda';
import EditarPerfilScreen from './src/screens/EditarPerfilScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import AjudaScreen from './src/screens/AjudaScreen';

// Configura o comportamento da notificação com o app em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Stack = createNativeStackNavigator();

// Componente interno que usa o contexto do tema
const AppContent = () => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? DarkTheme : DefaultTheme;
    const navigationRef = useNavigationContainerRef();

    useEffect(() => {
        // Listener para quando uma notificação é recebida com o app em primeiro plano
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notificação recebida em foreground:', notification);
        });

        // Listener para quando o usuário interage com a notificação (toca nela)
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Interação com notificação:', response);
            const { consultaId } = response.notification.request.content.data;
            
            if (navigationRef.isReady()) {
                // Leva o usuário para a tela inicial para ver o status atualizado
                navigationRef.navigate('MainApp', { screen: 'Início' });
            }
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    return (
        <NavigationContainer ref={navigationRef} theme={theme}>
            <Stack.Navigator
                initialRouteName="TelaBemVindo"
                screenOptions={{ headerShown: false }}
            >
                {/* Telas de Autenticação e Boas-Vindas */}
                <Stack.Screen name="TelaBemVindo" component={TelaBemVindo} />
                <Stack.Screen name="TelaCadastro" component={TelaCadastro} />
                <Stack.Screen name="TelaLogin" component={TelaLogin} />
                <Stack.Screen name="TelaEsqueciSenha" component={TelaEsqueciSenha} />
                <Stack.Screen name="VerificacaoCodigo" component={TelaVerificacaoCodigo} />
                <Stack.Screen name="TelaNovaSenha" component={TelaNovaSenha} />

                {/* Navegadores Principais (Tabs) */}
                <Stack.Screen name="MainApp" component={MainTabNavigator} />
                <Stack.Screen name="PrestadorApp" component={PrestadorTabNavigator} />

                {/* Telas do Fluxo de Agendamento */}
                <Stack.Screen
                    name="DetalhesProfissional"
                    component={DetalhesProfissionalScreen}
                    options={{
                        headerShown: true,
                        title: 'Detalhes do Profissional'
                    }}
                />
                <Stack.Screen
                    name="AgendaScreen"
                    component={TelaAgenda}
                    options={{
                        headerShown: true,
                        title: 'Agendar Consulta'
                    }}
                />

                {/* Telas Adicionais */}
                <Stack.Screen name="DetalhesConsulta" component={TelaDetalhesConsulta} />
                <Stack.Screen name="MotivoCancelamento" component={TelaMotivoCancelamento} />

                {/* Telas do Menu */}
                <Stack.Screen
                    name="EditarPerfil"
                    component={EditarPerfilScreen}
                    options={{ headerShown: true, title: 'Editar Perfil' }}
                />
                <Stack.Screen
                    name="Configuracoes"
                    component={ConfiguracoesScreen}
                    options={{ headerShown: true, title: 'Configurações' }}
                />
                <Stack.Screen
                    name="Ajuda"
                    component={AjudaScreen}
                    options={{ headerShown: true, title: 'Ajuda e Suporte' }}
                />

            </Stack.Navigator>
        </NavigationContainer>
    );
}

// App principal que envolve tudo com o ThemeProvider
function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
