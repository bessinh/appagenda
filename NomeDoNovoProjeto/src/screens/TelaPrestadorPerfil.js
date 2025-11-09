import { AntDesign, Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMe, updateMe } from '../api/client';
import { listarHorariosDentista, criarHorarioDisponivel, removerHorarioDisponivel } from '../api/client';

// Dados de exemplo para o perfil do prestador
const DADOS_INICIAIS_PERFIL = {
  name: 'Dr. Lucas Costa',
  specialties: ['Clínico Geral'],
  services: [
    { name: 'Consulta de Rotina', estimatedTime: '30 min', description: 'Atendimento geral e avaliação.' },
    { name: 'Limpeza', estimatedTime: '45 min', description: 'Remoção de tártaro e polimento.' },
    { name: 'Restauração', estimatedTime: '1 h', description: 'Preenchimento de cáries ou fraturas.' },
  ],
  // Novo array para o conteúdo em destaque
  featuredContent: [
    { title: 'Consulta Online Gratuita', description: 'Agende uma primeira consulta virtual para tirar suas dúvidas sem custo.', link: 'https://example.com/promocao' },
  ],
  schedule: [
    { date: '2025-10-01', times: ['09:00', '10:30', '14:00'] },
    { date: '2025-10-02', times: ['11:00', '15:00'] },
  ],
};

// Funções utilitárias para datas
const getFormattedDate = (date) => {
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return date.toLocaleDateString('pt-BR', options);
};

const getYYYYMMDD = (date) => {
  return date.toISOString().split('T')[0];
};

const generateDates = (days) => {
  const dateList = [];
  let currentDate = new Date();
  for (let i = 0; i < days; i++) {
    dateList.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dateList;
};

const TelaPrestadorPerfil = () => {
  const [name, setName] = useState(DADOS_INICIAIS_PERFIL.name);
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('');
  const [specialties, setSpecialties] = useState(DADOS_INICIAIS_PERFIL.specialties);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [services, setServices] = useState(DADOS_INICIAIS_PERFIL.services);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceTime, setNewServiceTime] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [featuredContent, setFeaturedContent] = useState(DADOS_INICIAIS_PERFIL.featuredContent);
  const [newFeaturedTitle, setNewFeaturedTitle] = useState('');
  const [newFeaturedDescription, setNewFeaturedDescription] = useState('');
  const [newFeaturedLink, setNewFeaturedLink] = useState('');
  const [editingFeaturedItem, setEditingFeaturedItem] = useState(null);
  const [schedule, setSchedule] = useState(DADOS_INICIAIS_PERFIL.schedule);
  const [realSlots, setRealSlots] = useState([]); // [{ _id, date, time }]
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTime, setNewTime] = useState('');
  const [message, setMessage] = useState('');

  // Carrega dados reais do usuário
  useEffect(() => {
    (async () => {
      try {
        const resp = await getMe();
        setName(resp.data?.nome || '');
        setEmail(resp.data?.email || '');
        setTipo(resp.data?.tipo || '');
        // carrega perfil detalhado, se houver
        if (resp.data?.perfil) {
          setSpecialties(resp.data.perfil.especialidades || []);
          setServices((resp.data.perfil.servicos || []).map(s => ({
            name: s.nome,
            estimatedTime: s.tempoEstimado,
            description: s.descricao,
          })));
          setFeaturedContent((resp.data.perfil.destaque || []).map(d => ({
            title: d.titulo,
            description: d.descricao,
            link: d.link,
          })));
        }
        // carrega horários reais
        try {
          const respH = await listarHorariosDentista();
          const lista = respH.data.map(h => ({ _id: h._id, date: h.data, time: h.hora }));
          setRealSlots(lista);
        } catch {}
      } catch {}
    })();
  }, []);

  // Lógica para especialidades
  const handleAddSpecialty = () => {
    if (newSpecialty.trim() !== '' && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialtyToRemove) => {
    setSpecialties(specialties.filter(specialty => specialty !== specialtyToRemove));
  };

  // Lógica para serviços
  const handleSaveService = () => {
    if (newServiceName.trim() !== '') {
      if (editingService) {
        setServices(services.map(s => 
          s.name === editingService.name 
            ? {
                name: newServiceName.trim(),
                estimatedTime: newServiceTime.trim() || 'Não especificado',
                description: newServiceDescription.trim() || 'Sem descrição',
              }
            : s
        ));
        setEditingService(null);
        setMessage('Serviço editado com sucesso!');
      } else {
        const isDuplicate = services.some(service => service.name === newServiceName.trim());
        if (!isDuplicate) {
          const newService = {
            name: newServiceName.trim(),
            estimatedTime: newServiceTime.trim() || 'Não especificado',
            description: newServiceDescription.trim() || 'Sem descrição',
          };
          setServices([...services, newService]);
          setMessage('Serviço adicionado com sucesso!');
        } else {
          setMessage('Serviço já existe!');
        }
      }
      setNewServiceName('');
      setNewServiceTime('');
      setNewServiceDescription('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewServiceName(service.name);
    setNewServiceTime(service.estimatedTime);
    setNewServiceDescription(service.description);
  };

  const handleRemoveService = (serviceToRemoveName) => {
    setServices(services.filter(service => service.name !== serviceToRemoveName));
  };

  // Lógica para conteúdo em destaque
  const handleSaveFeaturedItem = () => {
    if (newFeaturedTitle.trim() !== '') {
      if (editingFeaturedItem) {
        setFeaturedContent(featuredContent.map(item => 
          item.title === editingFeaturedItem.title 
            ? {
                title: newFeaturedTitle.trim(),
                description: newFeaturedDescription.trim() || 'Sem descrição',
                link: newFeaturedLink.trim() || null,
              }
            : item
        ));
        setEditingFeaturedItem(null);
        setMessage('Item em destaque editado!');
      } else {
        const isDuplicate = featuredContent.some(item => item.title === newFeaturedTitle.trim());
        if (!isDuplicate) {
          const newItem = {
            title: newFeaturedTitle.trim(),
            description: newFeaturedDescription.trim() || 'Sem descrição',
            link: newFeaturedLink.trim() || null,
          };
          setFeaturedContent([...featuredContent, newItem]);
          setMessage('Item em destaque adicionado!');
        } else {
          setMessage('Item em destaque já existe!');
        }
      }
      setNewFeaturedTitle('');
      setNewFeaturedDescription('');
      setNewFeaturedLink('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditFeaturedItem = (item) => {
    setEditingFeaturedItem(item);
    setNewFeaturedTitle(item.title);
    setNewFeaturedDescription(item.description);
    setNewFeaturedLink(item.link);
  };

  const handleRemoveFeaturedItem = (itemToRemoveTitle) => {
    setFeaturedContent(featuredContent.filter(item => item.title !== itemToRemoveTitle));
  };

  // Lógica para agenda
  const handleAddOrUpdateTime = async () => {
    if (!selectedDate || newTime.trim() === '') return;
    const formattedDate = getYYYYMMDD(selectedDate);
    const ok = /^([01]\d|2[0-3]):([0-5]\d)$/.test(newTime.trim());
    if (!ok) {
      return Alert.alert('Formato inválido', 'Use HH:MM (24h)');
    }
    // Bloquear horários passados na data de hoje
    const todayStr = new Date().toISOString().split('T')[0];
    if (formattedDate === todayStr) {
      const [hh, mm] = newTime.trim().split(':').map(Number);
      const now = new Date();
      const candidate = new Date();
      candidate.setHours(hh, mm, 0, 0);
      if (candidate <= now) {
        return Alert.alert('Horário inválido', 'Não é permitido criar horários no passado.');
      }
    }
    try {
      await criarHorarioDisponivel({ data: formattedDate, hora: newTime.trim() });
      const respH = await listarHorariosDentista();
      const lista = respH.data.map(h => ({ _id: h._id, date: h.data, time: h.hora }));
      setRealSlots(lista);
      setNewTime('');
      setMessage('Horário adicionado!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      Alert.alert('Erro', e.response?.data?.erro || 'Falha ao adicionar horário');
    }
  };

  const handleRemoveTime = async (timeToRemove) => {
    if (!selectedDate) return;
    const formattedDate = getYYYYMMDD(selectedDate);
    const slot = realSlots.find(s => s.date === formattedDate && s.time === timeToRemove);
    if (!slot?._id) return;
    try {
      await removerHorarioDisponivel(slot._id);
      const respH = await listarHorariosDentista();
      const lista = respH.data.map(h => ({ _id: h._id, date: h.data, time: h.hora }));
      setRealSlots(lista);
      setMessage('Horário removido!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      Alert.alert('Erro', e.response?.data?.erro || 'Falha ao remover horário');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        nome: name,
        'perfil.especialidades': specialties,
        'perfil.servicos': services.map(s => ({ nome: s.name, tempoEstimado: s.estimatedTime, descricao: s.description })),
        'perfil.destaque': featuredContent.map(d => ({ titulo: d.title, descricao: d.description, link: d.link }))
      };
      await updateMe(payload);
      setMessage('Perfil atualizado com sucesso!');
    } catch (e) {
      setMessage('Erro ao salvar perfil');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calendarDates = generateDates(14); 
  const timesForSelectedDate = selectedDate 
    ? realSlots.filter(s => s.date === getYYYYMMDD(selectedDate)).map(s => s.time).sort()
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Meu Perfil</Text>

        {message ? (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        ) : null}

        {/* Informações Pessoais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações Pessoais</Text>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.label}>E-mail</Text>
          <TextInput style={styles.input} value={email} editable={false} />
          <Text style={styles.label}>Tipo de conta</Text>
          <TextInput style={styles.input} value={tipo} editable={false} />
          <Text style={styles.label}>Especialidades</Text>
          <View style={styles.specialtiesList}>
            {specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyItem}>
                <Text>{specialty}</Text>
                <TouchableOpacity onPress={() => handleRemoveSpecialty(specialty)}>
                  <AntDesign name="close-circle" size={20} color="#D9534F" style={{marginLeft: 5}}/>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.addServiceContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Adicionar nova especialidade"
              value={newSpecialty}
              onChangeText={setNewSpecialty}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddSpecialty}>
              <AntDesign name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Serviços Oferecidos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Serviços Oferecidos</Text>
          {services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                <Text style={styles.serviceTime}>Tempo estimado: {service.estimatedTime}</Text>
              </View>
              <View style={styles.serviceActions}>
                <TouchableOpacity onPress={() => handleEditService(service)} style={{marginRight: 10}}>
                  <Feather name="edit" size={20} color="#1C74B4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveService(service.name)}>
                  <AntDesign name="close-circle" size={20} color="#D9534F" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.addServiceContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder={editingService ? "Editar nome do serviço" : "Nome do serviço"}
              value={newServiceName}
              onChangeText={setNewServiceName}
            />
          </View>
          <View style={styles.addServiceContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder={editingService ? "Editar tempo estimado" : "Tempo estimado (ex: 30 min)"}
              value={newServiceTime}
              onChangeText={setNewServiceTime}
            />
          </View>
          <View style={styles.addServiceContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder={editingService ? "Editar descrição" : "Descrição do serviço"}
              value={newServiceDescription}
              onChangeText={setNewServiceDescription}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleSaveService}>
              <Text style={styles.addButtonText}>
                {editingService ? "Salvar" : <AntDesign name="plus" size={24} color="#fff" />}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Conteúdo em Destaque */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conteúdo em Destaque</Text>
          {featuredContent.map((item, index) => (
            <View key={index} style={styles.featuredItem}>
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredTitle}>{item.title}</Text>
                <Text style={styles.featuredDescription}>{item.description}</Text>
                {item.link ? <Text style={styles.featuredLink}>{item.link}</Text> : null}
              </View>
              <View style={styles.serviceActions}>
                <TouchableOpacity onPress={() => handleEditFeaturedItem(item)} style={{marginRight: 10}}>
                  <Feather name="edit" size={20} color="#1C74B4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveFeaturedItem(item.title)}>
                  <AntDesign name="close-circle" size={20} color="#D9534F" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.addServiceContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder={editingFeaturedItem ? "Editar título do destaque" : "Título do destaque"}
              value={newFeaturedTitle}
              onChangeText={setNewFeaturedTitle}
            />
          </View>
          <View style={styles.addServiceContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder={editingFeaturedItem ? "Editar descrição" : "Descrição do destaque"}
              value={newFeaturedDescription}
              onChangeText={setNewFeaturedDescription}
            />
          </View>
          <View style={styles.addServiceContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder={editingFeaturedItem ? "Editar link" : "Link opcional"}
              value={newFeaturedLink}
              onChangeText={setNewFeaturedLink}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleSaveFeaturedItem}>
              <Text style={styles.addButtonText}>
                {editingFeaturedItem ? "Salvar" : <AntDesign name="plus" size={24} color="#fff" />}
              </Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Agendamentos */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, {flexDirection: 'row', alignItems: 'center'}]}>
            <Feather name="calendar" size={20} color="#1a1a1a" /> Agendar Atendimentos
          </Text>

          {/* Lista de Datas */}
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.calendarContainer}>
            {calendarDates.map((date) => {
              const isSelected = selectedDate && getYYYYMMDD(selectedDate) === getYYYYMMDD(date);
              const hasAppointments = schedule.some(day => day.date === getYYYYMMDD(date));
              
              return (
                <TouchableOpacity
                  key={getYYYYMMDD(date)}
                  onPress={() => setSelectedDate(date)}
                  style={[
                    styles.dateButton,
                    isSelected ? styles.dateButtonSelected : null,
                    hasAppointments && !isSelected ? styles.dateButtonHasAppointments : null,
                  ]}
                >
                  <Text style={[styles.dateText, isSelected ? styles.dateTextSelected : null, {fontSize: 12}]}>
                    {getFormattedDate(date).split(' ')[0]}
                  </Text>
                  <Text style={[styles.dateText, isSelected ? styles.dateTextSelected : null, {fontSize: 20}]}>
                    {date.getDate()}
                  </Text>
                  <Text style={[styles.dateText, isSelected ? styles.dateTextSelected : null, {fontSize: 12}]}>
                    {getFormattedDate(date).split(' ')[2]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Horários reais para a data selecionada */}
          {selectedDate ? (
            <View style={styles.timesContainer}>
              <Text style={styles.sectionTitle}>
                Horários para {getFormattedDate(selectedDate)}
              </Text>
              
              <View style={styles.timeChipsContainer}>
                {timesForSelectedDate.map((time, index) => (
                  <View key={index} style={styles.timeChip}>
                    <Text style={styles.timeChipText}>{time}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTime(time)} style={{marginLeft: 5}}>
                      <AntDesign name="closecircle" size={14} color="#2F80ED" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.addTimeContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 10 }]}
                  placeholder="Ex: 09:00"
                  value={newTime}
                  onChangeText={setNewTime}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdateTime}>
                  <AntDesign name="plus" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noDateSelected}>
              <Text style={styles.noDateSelectedText}>
                Selecione uma data para gerenciar os horários.
              </Text>
            </View>
          )}
        </View>

        {/* Salvar Alterações */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { backgroundColor: '#f0f2f5', borderRadius: 8, padding: 12, fontSize: 16 },
  serviceItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#eef3f7', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  serviceTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  addServiceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  addButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, minWidth: 50, alignItems: 'center' },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saveButton: { backgroundColor: '#1C74B4', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  successMessage: { backgroundColor: '#d4edda', borderColor: '#c3e6cb', borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 15 },
  successText: { color: '#155724', textAlign: 'center' },
  
  // Conteúdo em destaque
  featuredItem: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#f9fbe7', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  featuredLink: {
    fontSize: 12,
    color: '#1C74B4',
    marginTop: 5,
  },

  // Agendamento
  calendarContainer: { marginVertical: 10, paddingBottom: 10 },
  dateButton: { flexShrink: 0, width: 80, height: 80, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', marginRight: 10 },
  dateButtonSelected: { backgroundColor: '#1C74B4', borderColor: '#1C74B4' },
  dateButtonHasAppointments: { borderColor: '#28a745', borderWidth: 2 },
  dateText: { color: '#000' },
  dateTextSelected: { color: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  timesContainer: { marginTop: 10 },
  timeChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  timeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f0ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginRight: 5, marginBottom: 5 },
  timeChipText: { color: '#1C74B4' },
  addTimeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  noDateSelected: { backgroundColor: '#f0f2f5', borderRadius: 10, padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 120 },
  noDateSelectedText: { color: '#666', textAlign: 'center' },
});

export default TelaPrestadorPerfil;