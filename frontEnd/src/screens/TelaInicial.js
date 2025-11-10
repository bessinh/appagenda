import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { getMe, listarMinhasConsultas } from '../api/client';
import { useTheme } from '../context/ThemeContext';


// Função para formatar a data (UTC)
const formatBackendDate = (dateStr) => {
    try {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        // Usamos métodos UTC para datas do backend formatadas em ISO 8601
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return dateStr || 'Data Inválida';
    }
};

const TelaInicial = () => {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const styles = getDynamicStyles(isDarkMode);

    const [user, setUser] = useState(null);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Novo estado para exibir erros

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setIsLoading(true);
                setError(null); // Limpa o erro anterior
                try {
                    // 1. Buscar Dados do Usuário
                    const userResponse = await getMe();
                    // 💡 CORREÇÃO 1: Garante que 'data' exista
                    const userData = userResponse?.data; 
                    if (userData) {
                        setUser(userData);
                    }

                    // 2. Buscar Consultas
                    const appointmentsResponse = await listarMinhasConsultas();
                    // 💡 CORREÇÃO 2: Garante que 'data' exista e seja um array
                    const appointments = appointmentsResponse?.data || [];
                    
                    const now = new Date();

                    // 3. Filtrar a Próxima Consulta
                    const upcomingAppointments = appointments
                        // O filtro verifica: 1) Status 'agendado'; 2) Se a data/hora é no futuro.
                        .filter(app => {
                            if (app.status !== 'agendado' || !app.data || !app.horario) {
                                return false;
                            }
                            // Criando a data combinada. Assumimos que o backend fornece o fuso horário correto ou UTC.
                            const appointmentDateTime = new Date(`${app.data.split('T')[0]}T${app.horario}:00`);
                            return appointmentDateTime > now;
                        })
                        // Ordena pela data mais próxima
                        .sort((a, b) => {
                            const dateA = new Date(`${a.data.split('T')[0]}T${a.horario}:00`);
                            const dateB = new Date(`${b.data.split('T')[0]}T${b.horario}:00`);
                            return dateA - dateB;
                        });

                    if (upcomingAppointments.length > 0) {
                        setNextAppointment(upcomingAppointments[0]);
                    } else {
                        setNextAppointment(null);
                    }
                } catch (apiError) {
                    console.error("Erro ao buscar dados da tela inicial:", apiError);
                    setError("Não foi possível carregar os dados. Verifique sua conexão.");
                    setUser(null);
                    setNextAppointment(null);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }, [])
    );

    // Renderização de Loading e Erro
    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#1C74B4" />
                <Text style={styles.loadingText}>Carregando suas informações...</Text>
            </View>
        );
    }
    
    // 💡 Renderiza mensagem de erro em caso de falha na API
    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <AntDesign name="exclamationcircleo" size={30} color="#E74C3C" />
                <Text style={[styles.loadingText, { color: '#E74C3C', marginTop: 10 }]}>{error}</Text>
                <TouchableOpacity onPress={() => useFocusEffect.current()}> 
                    <Text style={{ color: '#1C74B4', marginTop: 20, fontSize: 16 }}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }


    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                {/* 💡 CORREÇÃO 3: Usando ?. para acesso seguro à propriedade */}
                <Text style={styles.greeting}>Olá, {user?.nome || 'Usuário'}!</Text>
                <Text style={styles.subText}>Bem-vindo de volta.</Text>
            </View>

            {/* Aplicando um estilo de opacidade quando desabilitado (melhor UX) */}
            <TouchableOpacity
                style={[styles.sectionCard, !nextAppointment && styles.disabledCard]}
                onPress={() => nextAppointment && navigation.navigate('DetalhesConsulta', { appointment: nextAppointment })}
                disabled={!nextAppointment}
            >
                <Text style={styles.sectionHeader}>Próxima Consulta</Text>
                {nextAppointment ? (
                    <View style={styles.appointmentCard}>
                        <AntDesign name="calendar" size={30} color="#1C74B4" />
                        <View style={styles.appointmentDetails}>
                            {/* 💡 CORREÇÃO 4: Acessando dentista?.nome com segurança */}
                            <Text style={styles.appointmentTitle}>{nextAppointment.dentista?.nome || 'Consulta Agendada'}</Text>
                            <Text style={styles.appointmentText}>
                                Dia: {formatBackendDate(nextAppointment.data)} às {nextAppointment.horario}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.appointmentText}>Nenhuma consulta futura agendada.</Text>
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

            <View 
                style={styles.sectionCard} 
            >
                <Text style={styles.sectionHeader}>Conteúdo em Destaque</Text>
                
                <View style={styles.highlightBlock}>
                    <Text style={styles.highlightTitle}>Promoção: Clareamento Dental</Text>
                    <Text style={styles.highlightText}>Desconto de 20% até 30/09</Text>
                </View>

                <View style={styles.highlightBlock}>
                    <Text style={styles.highlightTitle}>Top Profissional: Dra. Ana Lima</Text>
                    <Text style={styles.highlightText}>Especialista em Ortodontia</Text>
                </View>

            </View>
            
            <View style={{height: 20}} /> 

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
        flex: 1 ,
        
    },
    loadingText: {
        color: isDarkMode ? '#fff' : '#000',
        marginTop: 10
    },
    // ... (restante dos estilos omitidos para brevidade, mas mantidos os novos)
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
    highlightBlock: {
        marginBottom: 15,
        paddingHorizontal: 5, 
    },
    highlightTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#333', 
        marginBottom: 2,
    },
    highlightText: {
        fontSize: 14,
        color: isDarkMode ? '#ccc' : '#555',
    },
    // NOVO ESTILO: Feedback visual para card desabilitado
    disabledCard: {
        opacity: 0.7, 
        // Adicione um indicador visual se for relevante, mas a opacidade já ajuda
    }
});

export default TelaInicial;