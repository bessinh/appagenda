import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { getMe, listarMinhasConsultas } from '../api/client';
import { useTheme } from '../context/ThemeContext';

const formatBackendDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    } catch (e) {
        return dateStr;
    }
};

const TelaInicial = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const styles = getDynamicStyles(isDarkMode);

    const [user, setUser] = useState(null);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const userResponse = await getMe();
                    setUser(userResponse.data);

                    const appointmentsResponse = await listarMinhasConsultas();
                    const appointments = appointmentsResponse.data || [];
                    const now = new Date();

                    const upcomingAppointments = appointments
                        .filter(app => app.status === 'agendado' && new Date(`${app.data.split('T')[0]}T${app.horario}:00`) > now)
                        .sort((a, b) => new Date(`${a.data.split('T')[0]}T${a.horario}:00`) - new Date(`${b.data.split('T')[0]}T${b.horario}:00`));

                    if (upcomingAppointments.length > 0) {
                        setNextAppointment(upcomingAppointments[0]);
                    } else {
                        setNextAppointment(null);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados da tela inicial:", error);
                    setUser(null);
                    setNextAppointment(null);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }, [])
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#1C74B4" />
                <Text style={styles.loadingText}>Carregando suas informações...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.greeting}>Olá, {user?.nome || 'Usuário'}!</Text>
                <Text style={styles.subText}>Bem-vindo de volta.</Text>
            </View>

            <TouchableOpacity
                style={styles.sectionCard}
                onPress={() => nextAppointment && navigation.navigate('DetalhesConsulta', { appointment: nextAppointment })}
                disabled={!nextAppointment}
            >
                <Text style={styles.sectionHeader}>Próxima Consulta</Text>
                {nextAppointment ? (
                    <View style={styles.appointmentCard}>
                        <AntDesign name="calendar" size={30} color="#1C74B4" />
                        <View style={styles.appointmentDetails}>
                            <Text style={styles.appointmentTitle}>{nextAppointment.dentista?.nome || 'Consulta'}</Text>
                            <Text style={styles.appointmentText}>
                                Dia: {formatBackendDate(nextAppointment.data)} às {nextAppointment.horario}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.appointmentText}>Nenhuma consulta agendada.</Text>
                )}
            </TouchableOpacity>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>Ações Rápidas</Text>
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Agenda')}
                    >
                        <FontAwesome name="plus-circle" size={30} color="#fff" />
                        <Text style={styles.actionButtonText}>Agendar Agora</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Buscar')}
                    >
                        <AntDesign name="search" size={30} color="#fff" />
                        <Text style={styles.actionButtonText}>Buscar Profissionais</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

// Função para gerar estilos dinâmicos baseados no tema
const getDynamicStyles = (isDarkMode) => StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' 
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: isDarkMode ? '#fff' : '#000',
    },
    headerContainer: { 
        marginBottom: 25, 
        marginTop: 30 
    },
    greeting: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: isDarkMode ? '#fff' : '#333' 
    },
    subText: { 
        fontSize: 16, 
        color: isDarkMode ? '#aaa' : '#666' 
    },
    sectionHeader: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#1C74B4', 
        marginBottom: 10 
    },
    sectionCard: { 
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', 
        borderRadius: 10, 
        padding: 15, 
        marginBottom: 20, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: isDarkMode ? 0.5 : 0.1, 
        shadowRadius: 4, 
        elevation: 3 
    },
    appointmentCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 10, 
        backgroundColor: isDarkMode ? '#2c2c2c' : '#eef3f7', 
        borderRadius: 8 
    },
    appointmentDetails: { 
        marginLeft: 15 
    },
    appointmentTitle: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: '#1C74B4' 
    },
    appointmentText: { 
        fontSize: 14, 
        color: isDarkMode ? '#ccc' : '#555', 
        marginVertical: 2 
    },
    quickActionsContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    },
    actionButton: { 
        backgroundColor: '#1C74B4', 
        borderRadius: 8, 
        padding: 15, 
        alignItems: 'center', 
        flex: 1, 
        marginHorizontal: 5 
    },
    actionButtonText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        marginTop: 5 
    },
});

export default TelaInicial;
