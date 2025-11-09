// src/screens/TelaPrestadorDashboard.js
// CÓDIGO FINAL: O texto do resumo agora se adapta (singular/plural).

import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMe, listarMinhasConsultas } from '../api/client';

const DADOS_INICIAIS_CONSULTAS = [
  // Deixando apenas 1 consulta inicial para testar o texto no singular
  { id: '1', time: '14:00', patientName: 'Roberto Dias' },
];

const TelaPrestadorDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params || {};
  const [me, setMe] = useState(null);
  const [consultasHoje, setConsultasHoje] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const respUser = await getMe();
        setMe(respUser.data);

        const respCons = await listarMinhasConsultas();
        // filtra somente consultas do dia atual
        const hojeStr = new Date().toISOString().split('T')[0];
        const apenasHoje = respCons.data
          .filter(c => (c.data || '').startsWith(hojeStr))
          .map(c => ({ id: c._id, time: c.horario || c.hora || '00:00', patientName: c.paciente?.nome || 'Paciente' }))
          .sort((a, b) => a.time.localeCompare(b.time));
        setConsultasHoje(apenasHoje);
      } catch (e) {
        // mantém vazio em caso de erro
        setConsultasHoje([]);
      }
    })();
  }, []);

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

  // ATUALIZAÇÃO: Lógica para deixar o texto do resumo dinâmico
  const totalConsultas = consultasHoje.length;
  const textoResumo = totalConsultas === 1 
    ? 'Consulta agendada para hoje' 
    : 'Consultas agendadas para hoje';

  const renderAppointmentItem = (item) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.appointmentItem} 
      onPress={() => alert(`Detalhes de ${item.patientName}`)}
    >
      <Text style={styles.appointmentTime}>{item.time}</Text>
      <Text style={styles.appointmentPatient}>{item.patientName}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {me?.nome || user?.name || 'Prestador'}!</Text>
          <Text style={styles.subGreeting}>Este é o resumo do seu dia.</Text>
        </View>

        {/* --- Card de Resumo do Dia --- */}
        {/* O número e o texto agora estão perfeitamente sincronizados */}
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
            <AntDesign name="setting" size={20} color="#1C74B4" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Gerenciar Meu Perfil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { padding: 20 },
  header: { marginBottom: 20 },
  greeting: { marginTop: 20, fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  subGreeting: { fontSize: 16, color: '#666' },
  summaryCard: { backgroundColor: '#1C74B4', borderRadius: 10, padding: 20, alignItems: 'center', marginBottom: 20 },
  summaryNumber: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  summaryText: { fontSize: 16, color: '#fff', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  appointmentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  appointmentTime: { fontSize: 16, fontWeight: 'bold', color: '#1C74B4', width: 60 },
  appointmentPatient: { fontSize: 16 },
  emptyText: { color: '#999', fontStyle: 'italic' },
  actionButton: { flexDirection: 'row', backgroundColor: '#1C74B4', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  secondaryButton: { backgroundColor: '#eef3f7' },
  secondaryButtonText: { color: '#1C74B4' },
});

export default TelaPrestadorDashboard;