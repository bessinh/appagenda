import { AntDesign, Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMe, updateMe } from '../api/client';
import MaskInput, { Masks } from 'react-native-mask-input';

// ⚠️ SIMULAÇÃO DE FUNÇÕES DE API para o fluxo de confirmação
// Estas funções DEVERIAM interagir com seu backend
const mockApi = {
    // Simula o envio de um código (ex: por e-mail ou SMS)
    requestOtp: async (type, value) => {
        console.log(`[API] Solicitando OTP para ${type}: ${value}`);
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
    },
    // Simula a confirmação do código no servidor
    confirmChange: async (type, value, code) => {
        console.log(`[API] Confirmando ${type}: ${value} com código: ${code}`);
        // ⚠️ O código de validação SIMULADO é '123456'
        if (code !== '123456') {
            throw new Error('Código de confirmação inválido.');
        }
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
    }
};

// Dados de exemplo para o perfil do prestador
const DADOS_INICIAIS_PERFIL = {
  name: 'Dr. Lucas Costa',
  telefone: '(11) 99999-9999',
  email: 'lucas.costa@exemplo.com',
  specialties: ['Clínico Geral'],
  // ✨ DADOS RESTAURADOS
  services: [
    { name: 'Consulta de Rotina', estimatedTime: '30 min', description: 'Atendimento geral e avaliação.' },
    { name: 'Limpeza', estimatedTime: '45 min', description: 'Remoção de tártaro e polimento.' },
    { name: 'Restauração', estimatedTime: '1 h', description: 'Preenchimento de cáries ou fraturas.' },
  ],
  featuredContent: [
    { title: 'Consulta Online Gratuita', description: 'Agende uma primeira consulta virtual para tirar suas dúvidas sem custo.', link: 'https://example.com/promocao' },
  ],
};


const TelaPrestadorPerfil = ({ navigation }) => {
  const [name, setName] = useState(DADOS_INICIAIS_PERFIL.name);
  const [email, setEmail] = useState(DADOS_INICIAIS_PERFIL.email);
  const [tipo, setTipo] = useState('');
  const [telefone, setTelefone] = useState(DADOS_INICIAIS_PERFIL.telefone);
  
  // ESTADOS DE SEGURANÇA OTP
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [newTelefone, setNewTelefone] = useState(telefone);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [fieldToConfirm, setFieldToConfirm] = useState(null); // 'email' ou 'telefone'
  const [isLoading, setIsLoading] = useState(false); 
  
  // ESTADOS MANTIDOS
  const [specialties, setSpecialties] = useState(DADOS_INICIAIS_PERFIL.specialties);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [message, setMessage] = useState('');
  
  // ✨ ESTADOS RESTAURADOS: SERVIÇOS E DESTAQUES
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

  // Carrega dados reais do usuário (com restauração de serviços/destaques)
  useEffect(() => {
    (async () => {
      try {
        const resp = await getMe();
        setName(resp.data?.nome || DADOS_INICIAIS_PERFIL.name);
        
        const currentEmail = resp.data?.email || DADOS_INICIAIS_PERFIL.email;
        const currentTelefone = resp.data?.telefone || DADOS_INICIAIS_PERFIL.telefone;
        
        setEmail(currentEmail);
        setNewEmail(currentEmail); 
        setTipo(resp.data?.tipo || '');
        setTelefone(currentTelefone); 
        setNewTelefone(currentTelefone); 
        
        if (resp.data?.perfil) {
          setSpecialties(resp.data.perfil.especialidades || []);
          
          // ✨ RESTAURAÇÃO: SERVIÇOS
          setServices((resp.data.perfil.servicos || []).map(s => ({
            name: s.nome,
            estimatedTime: s.tempoEstimado,
            description: s.descricao,
          })));

          // ✨ RESTAURAÇÃO: DESTAQUES
          setFeaturedContent((resp.data.perfil.destaque || []).map(d => ({
            title: d.titulo,
            description: d.descricao,
            link: d.link,
          })));
        }
      } catch {}
    })();
  }, []);

  // 📞 FLUXO DE CONFIRMAÇÃO: Solicitar o código (Mantido)
  const handleRequestOtp = async (field, value) => {
    const currentValue = field === 'email' ? email : telefone;
    if (!value || value === currentValue) {
      return Alert.alert("Inválido", `O novo ${field} deve ser diferente do atual.`);
    }

    setIsLoading(true);
    try {
      await mockApi.requestOtp(field, value);
      setFieldToConfirm(field);
      setOtpCode(''); 
      setShowConfirmationModal(true);
      setMessage(`Código enviado para o novo ${field}. Digite '123456' para simular a confirmação.`);
    } catch (e) {
      Alert.alert("Erro", e.message || `Falha ao solicitar código para ${field}.`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // 🔒 FLUXO DE CONFIRMAÇÃO: Confirmar o código (Mantido)
  const handleConfirmChange = async () => {
    if (!otpCode || otpCode.length < 6) {
      return Alert.alert("Inválido", "Insira o código de 6 dígitos.");
    }
    
    setIsLoading(true);
    const value = fieldToConfirm === 'email' ? newEmail : newTelefone;

    try {
      await mockApi.confirmChange(fieldToConfirm, value, otpCode);
      
      if (fieldToConfirm === 'email') {
        setEmail(newEmail);
        setIsEditingEmail(false);
      } else {
        setTelefone(value); 
        setIsEditingPhone(false);
      }

      await updateMe({ [fieldToConfirm]: value });

      setShowConfirmationModal(false);
      setMessage(`✅ ${fieldToConfirm === 'email' ? 'E-mail' : 'Telefone'} alterado e confirmado com sucesso!`);
    } catch (e) {
      Alert.alert("Erro de Confirmação", e.message || "Falha ao confirmar o código.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };


  // Lógica para especialidades (Mantida)
  const handleAddSpecialty = () => {
    if (newSpecialty.trim() !== '' && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialtyToRemove) => {
    setSpecialties(specialties.filter(specialty => specialty !== specialtyToRemove));
  };
  
  // ✨ Lógica para serviços (Restaurada)
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

  // ✨ Lógica para conteúdo em destaque (Restaurada)
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


  // Lógica para Salvar Todas as Alterações
  const handleSaveChanges = async () => {
    if (isEditingEmail || isEditingPhone) {
        return Alert.alert("Edição Pendente", "Finalize ou cancele a edição de E-mail/Telefone antes de salvar outras alterações.");
    }
    
    try {
      const payload = {
        nome: name,
        email: email, // Valor confirmado
        telefone: telefone, // Valor confirmado
        'perfil.especialidades': specialties,
        // ✨ PAYLOAD RESTAURADO: SERVIÇOS E DESTAQUES
        'perfil.servicos': services.map(s => ({ nome: s.name, tempoEstimado: s.estimatedTime, descricao: s.description })),
        'perfil.destaque': featuredContent.map(d => ({ titulo: d.title, descricao: d.description, link: d.link }))
      };
      await updateMe(payload);
      setMessage('Perfil atualizado com sucesso!');
    } catch (e) {
      Alert.alert('Erro', e.message || 'Erro ao salvar perfil');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  // Função de Logout (Mantida)
  const handleLogout = () => {
    Alert.alert(
      "Sair da Conta", "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          onPress: () => { 
            setMessage("Você saiu da sua conta."); 
            setTimeout(() => setMessage(''), 3000); 
          }, 
          style: "destructive" 
        }
      ]
    );
  };
  
  // 🔑 Componente Modal de Confirmação (Mantido)
  const ConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showConfirmationModal}
      onRequestClose={() => {
        if (!isLoading) setShowConfirmationModal(false);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Confirmação de Alteração</Text>
          <Text style={styles.modalText}>
            Um código de 6 dígitos foi enviado para o novo **{fieldToConfirm}**. Insira-o abaixo para confirmar a alteração.
          </Text>
          <MaskInput
            style={[styles.input, { textAlign: 'center' }]}
            placeholder="000000"
            mask={[/\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="numeric"
            maxLength={6}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.modalButton, styles.buttonConfirm]}
            onPress={handleConfirmChange}
            disabled={isLoading}
          >
            <Text style={styles.textStyle}>{isLoading ? 'Confirmando...' : 'Confirmar Código'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.buttonCancel]}
            onPress={() => setShowConfirmationModal(false)}
            disabled={isLoading}
          >
            <Text style={styles.textStyle}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ConfirmationModal />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Meu Perfil</Text>

        {message ? (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        ) : null}

        {/* --- 1. Informações Pessoais (Com OTP Security) --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações Pessoais</Text>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          
          {/* E-MAIL com LÓGICA DE CONFIRMAÇÃO */}
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.editableFieldContainer}>
            <TextInput 
              style={[styles.input, styles.editableInput, !isEditingEmail && styles.uneditableInput]} 
              value={isEditingEmail ? newEmail : email}
              onChangeText={setNewEmail}
              editable={isEditingEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Novo e-mail"
            />
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => {
                if (isEditingEmail) {
                  handleRequestOtp('email', newEmail);
                } else {
                  setNewEmail(email); 
                  setIsEditingEmail(true);
                }
              }}
              disabled={isLoading || (isEditingEmail && newEmail === email)} 
            >
              <Feather name={isEditingEmail ? 'send' : 'edit'} size={20} color={isEditingEmail ? (newEmail === email ? '#ccc' : '#28a745') : '#1C74B4'} />
            </TouchableOpacity>
          </View>
          {isEditingEmail && <Text style={styles.helperText}>Altere e clique em Enviar. O código de confirmação será enviado.</Text>}
          
          {/* TELEFONE com LÓGICA DE CONFIRMAÇÃO */}
          <Text style={styles.label}>Telefone</Text>
          <View style={styles.editableFieldContainer}>
            <MaskInput
              style={[styles.input, styles.editableInput, !isEditingPhone && styles.uneditableInput]}
              placeholder={isEditingPhone ? "(99) 99999-9999" : telefone}
              mask={Masks.BRL_PHONE} 
              value={isEditingPhone ? newTelefone : telefone}
              onChangeText={setNewTelefone}
              keyboardType="numeric"
              editable={isEditingPhone}
            />
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => {
                if (isEditingPhone) {
                  handleRequestOtp('telefone', newTelefone);
                } else {
                  setNewTelefone(telefone); 
                  setIsEditingPhone(true);
                }
              }}
              disabled={isLoading || (isEditingPhone && newTelefone === telefone)}
            >
              <Feather name={isEditingPhone ? 'send' : 'edit'} size={20} color={isEditingPhone ? (newTelefone === telefone ? '#ccc' : '#28a745') : '#1C74B4'} />
            </TouchableOpacity>
          </View>
          {isEditingPhone && <Text style={styles.helperText}>Altere e clique em Enviar. O código de confirmação será enviado.</Text>}

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
        
        {/* --- 2. Serviços Oferecidos (RESTAURADO) --- */}
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
        
        {/* --- 3. Conteúdo em Destaque (RESTAURADO) --- */}
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

        {/* --- 4. Botões de Ação --- */}
        <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSaveChanges} 
            disabled={isEditingEmail || isEditingPhone || isLoading}
        >
          <Text style={styles.saveButtonText}>Salvar Todas as Alterações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoading}>
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 5, marginTop: 10 }, 
  input: { backgroundColor: '#f0f2f5', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 5 }, 
  successMessage: { backgroundColor: '#d4edda', borderColor: '#c3e6cb', borderWidth: 1, borderRadius: 8, padding: 15, marginBottom: 15 },
  successText: { color: '#155724', textAlign: 'center' },

  // Estilos de Especialidades
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

  // Estilos de Serviços (RESTAURADOS)
  serviceItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#eef3f7', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  serviceInfo: { flex: 1, },
  serviceName: { fontWeight: 'bold', fontSize: 16, },
  serviceDescription: { fontSize: 14, color: '#666', marginTop: 5, },
  serviceTime: { fontSize: 12, color: '#888', marginTop: 5, },
  serviceActions: { flexDirection: 'row', alignItems: 'center', },

  // Estilos de Destaques (RESTAURADOS)
  featuredItem: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#f9fbe7', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  featuredInfo: { flex: 1, },
  featuredTitle: { fontWeight: 'bold', fontSize: 16, color: '#333', },
  featuredDescription: { fontSize: 14, color: '#555', marginTop: 5, },
  featuredLink: { fontSize: 12, color: '#1C74B4', marginTop: 5, },


  // Estilos de Segurança OTP (Mantidos)
  editableFieldContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, },
  editableInput: { flex: 1, marginRight: 10, marginBottom: 0, },
  uneditableInput: { backgroundColor: '#e9ecef', color: '#6c757d', },
  editButton: { padding: 8, },
  helperText: { fontSize: 12, color: '#1C74B4', marginBottom: 10, marginTop: -5, },
  
  // Estilos do Modal (Mantidos)
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.4)', },
  modalView: { margin: 20, backgroundColor: "white", borderRadius: 10, padding: 35, alignItems: "center", width: '85%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, },
  modalText: { marginBottom: 15, textAlign: "center" },
  modalButton: { borderRadius: 8, padding: 10, elevation: 2, marginTop: 10, minWidth: 150, alignItems: 'center', },
  buttonConfirm: { backgroundColor: "#28a745", },
  buttonCancel: { backgroundColor: "#6c757d", },
  textStyle: { color: "white", fontWeight: "bold", textAlign: "center" },
  
  // Estilos de Botões (Mantidos)
  saveButton: { backgroundColor: '#1C74B4', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#dc3545', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, marginBottom: 30, },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', },
});

export default TelaPrestadorPerfil;