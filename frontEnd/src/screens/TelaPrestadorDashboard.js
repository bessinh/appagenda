// src/screens/TelaPrestadorDashboard.js

import { AntDesign } from '@expo/vector-icons';
// 💡 useFocusEffect e useCallback são adicionados para forçar a atualização dos dados
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMe, listarMinhasConsultas } from '../api/client';
// Importação do ThemeContext (mantida para quando você reativar o Dark Mode)
import { useTheme } from '../context/ThemeContext'; 

const TelaPrestadorDashboard = () => {
    // 💡 MANUTENÇÃO: Lógica do tema desativada temporariamente (mantém o isDarkMode falso)
    // Se você não reativar o Dark Mode, você pode remover o useTheme, mas mantive por segurança.
    const { isDarkMode } = { isDarkMode: false }; 
    // const { isDarkMode } = useTheme(); // Se você quiser reativar o tema depois
    const styles = getDynamicStyles(isDarkMode); 

    const navigation = useNavigation();
    const route = useRoute();
    const { user } = route.params || {};
    const [me, setMe] = useState(null);
    const [consultasHoje, setConsultasHoje] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 💡 ATUALIZAÇÃO PRINCIPAL: useFocusEffect para recarregar dados
    // Isso garante que o número de consultas atualize sempre que o cliente agendar
    useFocusEffect(
        // O useCallback é crucial para evitar loops infinitos
        useCallback(() => {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    // Busca dados do Prestador
                    const respUser = await getMe();
                    setMe(respUser.data);

                    // Busca a lista completa de consultas
                    const respCons = await listarMinhasConsultas();
                    
                    // Filtra consultas para o dia atual (Lógica mantida)
                    const hojeStr = new Date().toISOString().split('T')[0];
                    const apenasHoje = respCons.data
                        .filter(c => (c.data || '').startsWith(hojeStr))
                        .map(c => ({ 
                            id: c._id, 
                            time: c.horario || c.hora || '00:00', 
                            patientName: c.paciente?.nome || 'Paciente' 
                        }))
                        .sort((a, b) => a.time.localeCompare(b.time));
                    
                    setConsultasHoje(apenasHoje);
                } catch (e) {
                    console.error("Erro ao carregar dados do prestador:", e);
                    setConsultasHoje([]);
                } finally {
                    setIsLoading(false);
                }
            };

            loadData(); 
            
            // Cleanup function (opcional, mas boa prática)
            return () => {}; 
        }, []) // Dependências vazias = dispara quando a tela foca
    );

    // Lógica para filtrar próximas consultas (mantida)
    const proximasConsultas = useMemo(() => {
        const agora = new Date();
        const horaAtual = agora.getHours();
        const minutoAtual = agora.getMinutes();

        return consultasHoje.filter(consulta => {
            const [hora, minuto] = consulta.time.split(':');
            if (parseInt(hora) > horaAtual) return true;
            if (parseInt(hora) === horaAtual && parseInt(minuto) > minutoAtual) return true;
            return false;
        });
    }, [consultasHoje]);

    // Lógica para o texto do resumo (mantida)
    const totalConsultas = consultasHoje.length;
    const textoResumo = totalConsultas === 1 
        ? 'Consulta agendada para hoje' 
        : 'Consultas agendadas para hoje';

    const renderAppointmentItem = (item) => (
        <TouchableOpacity 
            key={item.id}
            style={styles.appointmentItem} 
            onPress={() => navigation.navigate('DetalhesConsulta', { consultaId: item.id })}
        >
            <Text style={styles.appointmentTime}>{item.time}</Text>
            <Text style={styles.appointmentPatient}>{item.patientName}</Text>
        </TouchableOpacity>
    );
    
    // Indicador de Loading (mantido)
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centered]}>
                <ActivityIndicator size="large" color="#1C74B4" />
            </SafeAreaView>
        );
    }

    // Estrutura do componente (mantida)
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Olá, {me?.nome || user?.name || 'Prestador'}!</Text>
                    <Text style={styles.subGreeting}>Este é o resumo do seu dia.</Text>
                </View>

                {/* --- Card de Resumo do Dia --- */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryNumber}>{totalConsultas}</Text>
                    <Text style={styles.summaryText}>{textoResumo}</Text>
                </View>

                {/* --- Card de Próximas Consultas --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Próximas Consultas de Hoje</Text>
                    {proximasConsultas.length > 0 ? (
                        proximasConsultas.map(item => renderAppointmentItem(item))
                    ) : (
                        <Text style={styles.emptyText}>Nenhuma próxima consulta para hoje.</Text>
                    )}
                </View>

                {/* --- Card de Ações Rápidas --- */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Ações Rápidas</Text>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Minha Agenda')}
                    >
                        <AntDesign name="calendar" size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>Ver Minha Agenda Completa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={() => navigation.navigate('Meu Perfil')}
                    >
                        <AntDesign name="setting" size={20} color={isDarkMode ? '#1C74B4' : '#1C74B4'} /> 
                        <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Gerenciar Meu Perfil</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// 💡 FUNÇÃO PARA ESTILOS DINÂMICOS (adaptada para funcionar sem o Dark Mode ativo, mas pronta para ele)
const getDynamicStyles = (isDarkMode) => {
    // Definindo cores estáticas quando o Dark Mode não está sendo usado
    const color_bg_screen = isDarkMode ? '#121212' : '#f0f2f5';
    const color_bg_card = isDarkMode ? '#1e1e1e' : '#fff';
    const color_text_primary = isDarkMode ? '#fff' : '#1a1a1a';
    const color_text_secondary = isDarkMode ? '#aaa' : '#666';
    const color_border = isDarkMode ? '#333' : '#f0f0f0';
    const color_primary = '#1C74B4'; // Cor fixa para botões e destaque
    const color_secondary_bg = isDarkMode ? '#2c2c2c' : '#eef3f7';

    return StyleSheet.create({
        safeArea: { 
            flex: 1, 
            backgroundColor: color_bg_screen
        },
        centered: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        container: { 
            padding: 20 
        },
        header: { 
            marginBottom: 20 
        },
        greeting: { 
            marginTop: 20, 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: color_text_primary 
        },
        subGreeting: { 
            fontSize: 16, 
            color: color_text_secondary 
        },
        summaryCard: { 
            backgroundColor: color_primary, 
            borderRadius: 10, 
            padding: 20, 
            alignItems: 'center', 
            marginBottom: 20 
        },
        summaryNumber: { 
            fontSize: 48, 
            fontWeight: 'bold', 
            color: '#fff' 
        },
        summaryText: { 
            fontSize: 16, 
            color: '#fff', 
            fontWeight: '500' 
        },
        card: { 
            backgroundColor: color_bg_card, 
            borderRadius: 10, 
            padding: 20, 
            marginBottom: 20 
        },
        cardTitle: { 
            fontSize: 18, 
            fontWeight: 'bold', 
            marginBottom: 15,
            color: color_text_primary 
        },
        appointmentItem: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingVertical: 10, 
            borderBottomWidth: 1, 
            borderBottomColor: color_border 
        },
        appointmentTime: { 
            fontSize: 16, 
            fontWeight: 'bold', 
            color: color_primary, 
            width: 60 
        },
        appointmentPatient: { 
            fontSize: 16,
            color: color_text_primary 
        },
        emptyText: { 
            color: color_text_secondary, 
            fontStyle: 'italic' 
        },
        actionButton: { 
            flexDirection: 'row', 
            backgroundColor: color_primary, 
            padding: 15, 
            borderRadius: 8, 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginTop: 10 
        },
        actionButtonText: { 
            color: '#fff', 
            fontSize: 16, 
            fontWeight: 'bold', 
            marginLeft: 10 
        },
        secondaryButton: { 
            backgroundColor: color_secondary_bg
        },
        secondaryButtonText: { 
            color: color_primary
        },
    });
};

export default TelaPrestadorDashboard;