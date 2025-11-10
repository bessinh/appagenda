import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { redefinirSenha } from '../api/client';

const TelaNovaSenha = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { tempToken } = route.params;

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (novaSenha.length < 6) {
      return Alert.alert('Senha muito curta', 'A senha deve ter pelo menos 6 caracteres.');
    }
    if (novaSenha !== confirmarSenha) {
      return Alert.alert('As senhas não coincidem', 'Por favor, verifique a digitação.');
    }

    setIsLoading(true);
    try {
      await redefinirSenha(tempToken, novaSenha);
      Alert.alert(
        'Sucesso!',
        'Sua senha foi redefinida. Por favor, faça login com sua nova senha.',
        [{ text: 'OK', onPress: () => navigation.navigate('TelaLogin') }]
      );
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      Alert.alert('Erro', error.response?.data?.mensagem || 'Não foi possível redefinir sua senha. O token pode ter expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Crie uma Nova Senha</Text>
        <Text style={styles.description}>Digite sua nova senha abaixo. Certifique-se de que é uma senha segura.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nova Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a nova senha"
            secureTextEntry
            value={novaSenha}
            onChangeText={setNovaSenha}
          />

          <Text style={styles.label}>Confirmar Nova Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirme a nova senha"
            secureTextEntry
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
          />

          <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Redefinir Senha</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F0F0' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  label: { fontSize: 16, color: '#333', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#F9F9F9', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#E0E0E0', fontSize: 16 },
  button: { backgroundColor: '#1C74B4', paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default TelaNovaSenha;
