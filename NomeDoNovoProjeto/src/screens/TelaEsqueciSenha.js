// src/screens/TelaEsqueciSenha.js

import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskInput from 'react-native-mask-input';
import { solicitarCodigoRecuperacao } from '../api/client';

// --- Constantes ---
const RECOVERY_METHODS = {
  EMAIL: 'email',
  PHONE: 'phone',
};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ========================================================================
// Componente 1: Cabeçalho (Header)
// ========================================================================
const Header = ({ onBackPress }) => (
  <View style={headerStyles.header}>
    <TouchableOpacity
      onPress={onBackPress}
      style={headerStyles.backButton}
      accessible={true}
      accessibilityLabel="Voltar"
      accessibilityHint="Navega para a tela anterior"
    >
      <AntDesign name="left-square" size={30} color="#333" />
    </TouchableOpacity>
  </View>
);

// ========================================================================
// Componente 2: Introdução da Tela (ScreenIntroduction)
// ========================================================================
const ScreenIntroduction = () => (
  <>
    <Text style={styles.screenTitle}>Recuperar Senha</Text>
    <Text style={styles.descriptionText}>
      Escolha o método e enviaremos um código de verificação para você.
    </Text>
  </>
);

// ========================================================================
// Componente 3: Formulário de Recuperação (RecoveryForm)
// ========================================================================
const RecoveryForm = ({
  method,
  onMethodChange,
  inputValue,
  onInputChange,
  onSubmit,
  isLoading
}) => {
  const isEmail = method === RECOVERY_METHODS.EMAIL;

  return (
    <View style={formStyles.card}>
      {/* Abas de Seleção */}
      <View style={formStyles.tabsContainer}>
        <TouchableOpacity
          style={[formStyles.tab, isEmail && formStyles.activeTab]}
          onPress={() => onMethodChange(RECOVERY_METHODS.EMAIL)}
          accessibilityRole="button"
        >
          <Text style={[formStyles.tabText, isEmail && formStyles.activeTabText]}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[formStyles.tab, !isEmail && formStyles.activeTab]}
          onPress={() => onMethodChange(RECOVERY_METHODS.PHONE)}
          accessibilityRole="button"
        >
          <Text style={[formStyles.tabText, !isEmail && formStyles.activeTabText]}>Telefone</Text>
        </TouchableOpacity>
      </View>

      {/* Input (Condicional) */}
      <Text style={formStyles.label}>{isEmail ? 'Email' : 'Telefone'}</Text>
      {isEmail ? (
        <TextInput
          style={formStyles.input}
          placeholder={'digite o seu email...'}
          keyboardType={'email-address'}
          autoCapitalize="none"
          value={inputValue}
          onChangeText={onInputChange}
          accessibilityLabel="Campo de entrada para email"
        />
      ) : (
        <MaskInput
          style={formStyles.input}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          value={inputValue}
          onChangeText={(masked, unmasked) => onInputChange(unmasked)}
          mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
          accessibilityLabel="Campo de entrada para telefone"
        />
      )}

      {/* Botão de Envio */}
      <TouchableOpacity
        style={formStyles.sendButton}
        onPress={onSubmit}
        disabled={isLoading}
        accessibilityLabel="Enviar código de recuperação"
      >
        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={formStyles.buttonText}>Enviar Código</Text>}
      </TouchableOpacity>
    </View>
  );
};

// ========================================================================
// Componente Principal: TelaEsqueciSenha (Container)
// ========================================================================
const TelaEsqueciSenha = ({ navigation }) => {
  const [recoveryMethod, setRecoveryMethod] = useState(RECOVERY_METHODS.EMAIL);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodChange = (method) => {
    setRecoveryMethod(method);
    setInputValue('');
  };

  const handleSendRecoveryCode = async () => {
    if (recoveryMethod === RECOVERY_METHODS.EMAIL) {
      if (!EMAIL_REGEX.test(inputValue)) {
        Alert.alert('Email Inválido', 'Por favor, digite um endereço de email válido.');
        return;
      }
    } else {
      // A validação de telefone pode ser mais simples, já que o backend não a usa para envio real
      if (inputValue.length < 10) { 
        Alert.alert('Telefone Inválido', 'Por favor, digite um número de telefone com DDD.');
        return;
      }
    }

    setIsLoading(true);
    try {
      await solicitarCodigoRecuperacao(inputValue);
      Alert.alert(
        'Código Enviado!',
        `Um código de verificação foi enviado para seu ${recoveryMethod}. (Verifique o console do backend para o código).`,
        [{ text: 'OK', onPress: () => navigation.navigate('VerificacaoCodigo', { email: inputValue }) }]
      );
    } catch (error) {
      Alert.alert('Falha no Envio', error.response?.data?.mensagem || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header onBackPress={() => navigation.goBack()} />
        <ScreenIntroduction />
        <RecoveryForm
          method={recoveryMethod}
          onMethodChange={handleMethodChange}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSubmit={handleSendRecoveryCode}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F0F0' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20, marginTop: 20 },
  screenTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  descriptionText: { fontSize: 16, color: '#666', marginBottom: 30 },
});

const headerStyles = StyleSheet.create({
  header: { alignSelf: 'flex-start' },
  backButton: { padding: 5 },
});

const formStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 8, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#1C74B4' },
  tabText: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  activeTabText: { color: '#fff' },
  label: { fontSize: 16, color: '#333', marginBottom: 5 },
  input: { backgroundColor: '#F9F9F9', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
  sendButton: { backgroundColor: '#1C74B4', paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default TelaEsqueciSenha;