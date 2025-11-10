// src/screens/TelaDetalhesConsulta.js

import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Função para formatar a data que vem do backend (YYYY-MM-DDTHH:mm:ss.sssZ)
const formatBackendDate = (dateStr) => {
    try {
        const date = new Date(dateStr);
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    } catch (e) {
        return dateStr; // Retorna a string original em caso de erro
    }
};

const TelaDetalhesConsulta = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointment } = route.params;

  const handleCancelAppointment = () => {
    navigation.navigate('MotivoCancelamento', { appointment });
  };

  const handleReschedule = () => {
    // Navega para a tela de agendamento, já passando o profissional correto
    navigation.navigate('MainApp', {
      screen: 'Agenda',
      params: { profissional: appointment.dentista },
    });
  };

  const professionalName = appointment.dentista?.nome || 'Profissional não informado';
  const specialty = appointment.dentista?.perfil?.especialidades?.join(', ') || 'Especialidade não informada';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><AntDesign name="left-square" size={30} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>Detalhes da Consulta</Text>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AntDesign name="calendar" size={30} color="#1C74B4" />
            <Text style={styles.cardTitle}>{specialty}</Text>
          </View>
          <View style={styles.infoRow}><FontAwesome name="user-md" size={20} color="#555" style={styles.icon} /><Text style={styles.infoText}>Com: {professionalName}</Text></View>
          <View style={styles.infoRow}><AntDesign name="calendar" size={20} color="#555" style={styles.icon} /><Text style={styles.infoText}>Data: {formatBackendDate(appointment.data)}</Text></View>
          <View style={styles.infoRow}><AntDesign name="field-time" size={20} color="#555" style={styles.icon} /><Text style={styles.infoText}>Hora: {appointment.horario}</Text></View>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleReschedule}><AntDesign name="retweet" size={25} color="#fff" /><Text style={styles.buttonText}>Remarcar Consulta</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelAppointment}><AntDesign name="close-circle" size={25} color="#D9534F" /><Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar Agendamento</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Seus estilos permanecem os mesmos
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 20 },
  backButton: { position: 'absolute', top: 20, left: 20, padding: 10, zIndex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 60, marginBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15, marginBottom: 15 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1C74B4', marginLeft: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icon: { width: 25 },
  infoText: { fontSize: 16, color: '#333', marginLeft: 10 },
  button: { flexDirection: 'row', backgroundColor: '#1C74B4', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  cancelButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D9534F' },
  cancelButtonText: { color: '#D9534F' },
});

export default TelaDetalhesConsulta;