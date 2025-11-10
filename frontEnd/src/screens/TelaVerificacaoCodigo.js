// src/screens/TelaVerificacaoCodigo.js

import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { AntDesign } from '@expo/vector-icons';
import { verificarCodigoRecuperacao, solicitarCodigoRecuperacao } from '../api/client';

const CELL_COUNT = 6;
const RESEND_DELAY = 60;

const TelaVerificacaoCodigo = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params || {};

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const [error, setError] = useState('');

  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (code.length === CELL_COUNT) {
      handleVerifyCode();
    }
    if (error) {
      setError('');
    }
  }, [code]);

  const handleVerifyCode = async () => {
    if (code.length !== CELL_COUNT) {
      setError('Por favor, preencha todos os 6 dígitos.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await verificarCodigoRecuperacao(email, code);
      const { tempToken } = response.data;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sucesso!', 'Código verificado com sucesso.', [
        { text: 'OK', onPress: () => navigation.navigate('TelaNovaSenha', { tempToken }) },
      ]);

    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err.response?.data?.mensagem || 'Ocorreu um erro na verificação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    try {
        await solicitarCodigoRecuperacao(email);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Código Reenviado', `Um novo código foi enviado para ${email}. (Verifique o console do backend).`);
        setCountdown(RESEND_DELAY);
        setCode('');
    } catch (err) {
        Alert.alert('Erro', 'Não foi possível reenviar o código.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="left-square" size={30} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Verifique seu Código</Text>
        <Text style={styles.description}>
          Enviamos um código de 6 dígitos para{' '}
          <Text style={styles.identifierText}>{email}</Text>.
        </Text>

        <CodeField
          ref={ref}
          {...props}
          value={code}
          onChangeText={setCode}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <View
              onLayout={getCellOnLayoutHandler(index)}
              key={index}
              style={[styles.cellRoot, isFocused && styles.focusCell, !!error && styles.errorCell]}
            >
              <Text style={styles.cellText}>
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />
        
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyCode}
          disabled={isLoading || code.length < CELL_COUNT}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verificar</Text>}
        </TouchableOpacity>
        
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Não recebeu o código? </Text>
          <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0}>
            <Text style={[styles.resendButtonText, countdown > 0 && styles.resendButtonDisabled]}>
              {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F0F0' },
  container: { flex: 1, padding: 20 },
  // MUDANÇA 3: Melhorando o estilo do botão de voltar
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 80, // Adicionado espaço para o botão de voltar
  },
  description: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  identifierText: { fontWeight: 'bold', color: '#333' },
  
  codeFieldRoot: { marginTop: 20, marginBottom: 10 },
  cellRoot: { width: 45, height: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  cellText: { color: '#333', fontSize: 24, textAlign: 'center' },
  focusCell: { borderColor: '#1C74B4', borderWidth: 2 },
  
  errorCell: {
    borderColor: '#D9534F',
  },
  errorText: {
    color: '#D9534F',
    textAlign: 'center',
    marginTop: 10, // Adicionado espaço
    marginBottom: 10, // Adicionado espaço
    fontSize: 14,
  },

  verifyButton: { backgroundColor: '#1C74B4', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  resendText: { fontSize: 16, color: '#666' },
  resendButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1C74B4' },
  resendButtonDisabled: { color: '#999' },
});

export default TelaVerificacaoCodigo;