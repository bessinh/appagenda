import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { listarPrestadores, listarHorariosDisponiveis, agendarConsulta } from '../api/client';
import { useTheme } from '../context/ThemeContext';

LocaleConfig.locales['pt-br'] = { monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'], monthNamesShort: ['Jan.','Fev.','Mar','Abr','Mai','Jun','Jul.','Ago','Set.','Out.','Nov.','Dez.'], dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'], dayNamesShort: ['Dom.','Seg.','Ter.','Qua.','Qui.','Sex.','Sáb.'], today: 'Hoje' };
LocaleConfig.defaultLocale = 'pt-br';

const TelaAgenda = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { isDarkMode } = useTheme();
    const styles = getDynamicStyles(isDarkMode);

    const [professionals, setProfessionals] = useState([]);
    const [selectedProfessional, setSelectedProfessional] = useState(route.params?.profissional || null);
    
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [timesForSelectedDate, setTimesForSelectedDate] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useFocusEffect(
        useCallback(() => {
            const fetchProfessionals = async () => {
                setIsLoading(true);
                setError('');
                try {
                    // Sempre busca os profissionais para garantir dados atualizados
                    const response = await listarPrestadores();
                    setProfessionals(response.data);
                } catch (err) {
                    setError('Não foi possível carregar os profissionais.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            // A lógica de `selectedProfessional` é tratada na renderização.
            // A busca de dados deve ocorrer sempre que a tela recebe foco.
            fetchProfessionals();
            
        }, []) // O array de dependências vazio garante que isso rode a cada foco.
    );

    useEffect(() => {
        if (selectedProfessional?._id) {
            const fetchSchedule = async () => {
                setIsLoading(true);
                setError('');
                setAvailableSlots([]);
                try {
                    const response = await listarHorariosDisponiveis(selectedProfessional._id);
                    setAvailableSlots(response.data);
                } catch (err) {
                    setError('Não foi possível carregar a agenda deste profissional.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSchedule();
        }
    }, [selectedProfessional]);

    const markedDates = useMemo(() => {
        const marks = {};
        availableSlots.forEach(slot => {
            const date = slot.data.split('T')[0];
            marks[date] = { ...marks[date], marked: true, dotColor: '#1C74B4' };
        });
        if (selectedDate) {
            marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#1C74B4' };
        }
        return marks;
    }, [availableSlots, selectedDate]);

    const onDayPress = (day) => {
        setSelectedDate(day.dateString);
        const times = availableSlots
            .filter(slot => slot.data.split('T')[0] === day.dateString)
            .map(slot => ({ id: slot._id, time: slot.horario }))
            .sort((a, b) => a.time.localeCompare(b.time));
        setTimesForSelectedDate(times);
    };

    const handleConfirmAppointment = (timeSlot) => {
        Alert.alert(
            "Confirmar Agendamento",
            `Deseja agendar com ${selectedProfessional.nome} para o dia ${formatarData(selectedDate)} às ${timeSlot.time}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        try {
                            await agendarConsulta(timeSlot.id);
                            Alert.alert('Sucesso!', 'Sua consulta foi agendada.');
                            navigation.navigate('MainApp', { screen: 'Início' });
                        } catch (err) {
                            Alert.alert('Erro', err.response?.data?.erro || 'Não foi possível agendar. O horário pode não estar mais disponível.');
                            console.error(err);
                        }
                    }
                }
            ]
        );
    };
    
    const formatarData = (dataString) => {
        if (!dataString) return '...';
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const calendarTheme = isDarkMode ? {
        backgroundColor: '#1e1e1e',
        calendarBackground: '#1e1e1e',
        textSectionTitleColor: '#b6c1cd',
        selectedDayBackgroundColor: '#1C74B4',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#1C74B4',
        dayTextColor: '#d9e1e8',
        textDisabledColor: '#333',
        dotColor: '#1C74B4',
        selectedDotColor: '#ffffff',
        arrowColor: '#1C74B4',
        monthTextColor: '#d9e1e8',
        indicatorColor: 'blue',
        textDayFontWeight: '300',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '300',
        textDayFontSize: 16,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 16
    } : {};

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#1C74B4" /></View>;
    }
    if (error) {
        return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
    }

    if (!selectedProfessional) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={styles.header}>Escolha um(a) Dentista</Text>
                    <FlatList
                        data={professionals}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.professionalCard}
                                onPress={() => setSelectedProfessional(item)}
                            >
                                <Text style={styles.professionalName}>{item.nome}</Text>
                                <Text style={styles.professionalSpecialty}>
                                    {item.perfil?.especialidades?.join(', ') || 'Especialidade não informada'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.noHorarios}>Nenhum profissional encontrado.</Text>}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {
                    setSelectedProfessional(null);
                    setAvailableSlots([]);
                    setSelectedDate('');
                    setTimesForSelectedDate([]);
                }} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#333'} />
                    <Text style={styles.backButtonText}>Trocar de Dentista</Text>
                </TouchableOpacity>

                <Text style={styles.header}>Agenda de {selectedProfessional.nome}</Text>
                <Text style={styles.subHeader}>{selectedProfessional.perfil?.especialidades?.join(', ') || ''}</Text>
                
                <Calendar
                    onDayPress={onDayPress}
                    markedDates={markedDates}
                    minDate={new Date().toISOString().split('T')[0]}
                    theme={calendarTheme}
                />

                <Text style={styles.horariosHeader}>Horários disponíveis em {formatarData(selectedDate)}</Text>
                
                {selectedDate ? (
                    <FlatList
                        data={timesForSelectedDate}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.timeItem} onPress={() => handleConfirmAppointment(item)}>
                                <Text style={styles.timeText}>{item.time}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.noHorarios}>Nenhum horário disponível nesta data.</Text>}
                    />
                ) : (
                    <Text style={styles.noHorarios}>Selecione uma data para ver os horários.</Text>
                )}
            </View>
        </SafeAreaView>
    );
};

const getDynamicStyles = (isDarkMode) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' },
    container: { flex: 1, padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' },
    errorText: { color: 'red', fontSize: 16 },
    backButton: { flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 20, left: 20, padding: 10, zIndex: 1 },
    backButtonText: { marginLeft: 8, fontSize: 16, color: '#1C74B4', fontWeight: 'bold' },
    header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 60, marginBottom: 20, color: isDarkMode ? '#fff' : '#333' },
    subHeader: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: isDarkMode ? '#aaa' : '#666', marginTop: -15 },
    professionalCard: {
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        padding: 20,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: isDarkMode ? '#444' : '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.5 : 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    professionalName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#333',
    },
    professionalSpecialty: {
        fontSize: 14,
        color: isDarkMode ? '#aaa' : '#666',
        marginTop: 4,
    },
    horariosHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 20, color: isDarkMode ? '#fff' : '#333' },
    timeItem: { 
        flex: 1, 
        backgroundColor: isDarkMode ? '#2c2c2c' : '#fff', 
        paddingVertical: 12, 
        margin: 4, 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: '#1C74B4', 
        alignItems: 'center' 
    },
    timeText: { color: '#1C74B4', fontWeight: 'bold' },
    noHorarios: { textAlign: 'center', marginTop: 20, color: isDarkMode ? '#aaa' : '#666', fontStyle: 'italic' },
});

export default TelaAgenda;
