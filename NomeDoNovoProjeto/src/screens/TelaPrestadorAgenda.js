// src/screens/TelaPrestadorAgenda.js
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { liberarHorario, listarMinhasConsultas, removerHorarioDisponivel, cancelarConsulta } from '../api/client';

LocaleConfig.locales['pt-br'] = { monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'], monthNamesShort: ['Jan.','Fev.','Mar','Abr','Mai','Jun','Jul.','Ago','Set.','Out.','Nov.','Dez.'], dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'], dayNamesShort: ['Dom.','Seg.','Ter.','Qua.','Qui.','Sex.','Sáb.'], today: 'Hoje' };
LocaleConfig.defaultLocale = 'pt-br';

const TODAY_STRING = new Date().toISOString().split('T')[0];

const TelaPrestadorAgenda = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [selectedDate, setSelectedDate] = useState(TODAY_STRING);
  const [horariosDoDia, setHorariosDoDia] = useState([]);
  const [todosHorarios, setTodosHorarios] = useState([]);
  const [novoHorario, setNovoHorario] = useState('');

  const refreshAgenda = useCallback(async () => {
    try {
      const resp = await listarMinhasConsultas();
      const todasAsConsultas = resp.data || [];
      setTodosHorarios(todasAsConsultas);

      const agora = new Date();
      const doDia = todasAsConsultas
        .filter(c => c.data.split('T')[0] === selectedDate)
        .map(c => {
          let isPast = false;
          if (c.data.split('T')[0] === TODAY_STRING) {
            const [hour, minute] = c.horario.split(':');
            const horarioDaConsulta = new Date();
            horarioDaConsulta.setHours(hour, minute, 0, 0);
            if (horarioDaConsulta < agora) {
              isPast = true;
            }
          }
          return {
            _id: c._id,
            data: c.data.split('T')[0],
            time: c.horario,
            isBooked: c.status === 'agendado',
            isCanceled: c.status === 'cancelado', // Adicionado
            isPast,
            patientName: c.paciente?.nome || (c.status === 'cancelado' ? 'Cancelado' : 'Disponível')
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));
      
      setHorariosDoDia(doDia);
    } catch (err) {
      console.error("Erro ao recarregar agenda:", err);
      setTodosHorarios([]);
      setHorariosDoDia([]);
    }
  }, [selectedDate]);

  useEffect(() => {
    refreshAgenda();
  }, [selectedDate, refreshAgenda]);

  const markedDates = useMemo(() => {
    const marks = {};
    todosHorarios.forEach(h => {
      const date = h.data.split('T')[0];
      marks[date] = { ...marks[date], marked: true, dotColor: '#1C74B4' };
    });
    if (selectedDate) {
        marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#1C74B4' };
    }
    return marks;
  }, [todosHorarios, selectedDate]);

  const handleCriar = async (time) => {
    try {
      const ok = /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
      if (!ok) {
        return Alert.alert('Formato inválido', 'Use HH:MM (24h)');
      }
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedDate === todayStr) {
        const [hh, mm] = time.split(':').map(Number);
        const now = new Date();
        const candidate = new Date();
        candidate.setHours(hh, mm, 0, 0);
        if (candidate <= now) {
          return Alert.alert('Horário inválido', 'Não é permitido criar horários no passado.');
        }
      }
      await liberarHorario({ data: selectedDate, horario: time });
      Alert.alert('Sucesso', 'Horário cadastrado!');
      setNovoHorario('');
      await refreshAgenda();
    } catch (e) {
      Alert.alert('Erro', e.response?.data?.erro || 'Falha ao cadastrar horário');
    }
  };

  const handleSlotPress = (item) => {
    if (item.isBooked) {
      Alert.alert(
        "Cancelar Consulta",
        `Tem certeza que deseja cancelar a consulta com ${item.patientName}? O paciente será notificado.`,
        [
          { text: "Voltar", style: "cancel" },
          { 
            text: "Confirmar Cancelamento", 
            style: "destructive",
            onPress: () => proceedWithCancellation(item) 
          }
        ]
      );
    } else {
      handleRemover(item);
    }
  };

  const proceedWithCancellation = async (item) => {
    try {
      await cancelarConsulta(item._id, "Cancelado pelo dentista");
      Alert.alert('Sucesso', 'A consulta foi cancelada e o paciente foi notificado.');
      await refreshAgenda();
    } catch (e) {
      Alert.alert('Erro', e.response?.data?.erro || 'Falha ao cancelar a consulta.');
    }
  };

  const handleRemover = async (item) => {
    try {
      if (!item._id) return Alert.alert('Aviso', 'Este horário não pode ser removido.');
      if (item.isBooked) return Alert.alert('Aviso', 'Não é possível remover um horário já agendado.');

      await removerHorarioDisponivel(item._id);
      Alert.alert('Sucesso', 'Horário removido com sucesso!');
      await refreshAgenda();
    } catch (e) {
      Alert.alert('Erro', e.response?.data?.erro || 'Falha ao remover horário');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.timeSlot, 
        item.isBooked ? styles.bookedSlot : styles.availableSlot,
        item.isCanceled && styles.canceledSlot, // Adicionado
        item.isPast && styles.pastSlot
      ]}
      disabled={item.isPast || item.isCanceled} // Modificado
      onPress={() => handleSlotPress(item)}
    >
      <Text style={[styles.timeText, item.isPast && styles.pastText]}>{item.time}</Text>
      <Text style={[
        item.isBooked ? styles.patientText : styles.availableText,
        item.isCanceled && styles.canceledText, // Adicionado
        item.isPast && styles.pastText
      ]}>
        {item.isBooked ? item.patientName : (item.isCanceled ? 'Cancelado' : 'Remover')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Minha Agenda</Text>
        <Text style={styles.subHeader}>Gerencie seus horários disponíveis e agendados.</Text>
        
        <Calendar
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          current={selectedDate}
          minDate={TODAY_STRING}
          theme={{
            todayTextColor: '#1C74B4',
            arrowColor: '#1C74B4',
            selectedDayBackgroundColor: '#1C74B4',
            dotColor: '#1C74B4'
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
          <TextInput
            placeholder="HH:MM"
            value={novoHorario}
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, '').slice(0, 4);
              let formatted = digits;
              if (digits.length >= 3) {
                formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`;
              }
              setNovoHorario(formatted);
            }}
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, minWidth: 110, marginRight: 8 }}
            keyboardType="number-pad"
            maxLength={5}
          />
          <TouchableOpacity style={{ backgroundColor: '#1C74B4', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }} onPress={() => handleCriar(novoHorario)}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={horariosDoDia}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          ListHeaderComponent={<Text style={styles.listHeader}>Horários de {selectedDate}</Text>}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma atividade para este dia.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', paddingVertical: 20, color: '#333' },
  subHeader: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 10 },
  listHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, paddingHorizontal: 20, color: '#333' },
  timeSlot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 10 },
  bookedSlot: { backgroundColor: '#eef3f7' },
  availableSlot: { backgroundColor: '#fff' },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  patientText: { fontSize: 16, color: '#1C74B4' },
  availableText: { fontSize: 16, color: '#d9534f', fontStyle: 'italic' },
  canceledSlot: {
    backgroundColor: '#fff5f5',
    borderColor: '#fde0e0',
  },
  canceledText: {
    fontSize: 16,
    color: '#d9534f',
    fontStyle: 'italic',
  },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#999' },
  pastSlot: {
    backgroundColor: '#f8f9fa',
  },
  pastText: {
    color: '#adb5bd',
    textDecorationLine: 'line-through',
  },
});

export default TelaPrestadorAgenda;
