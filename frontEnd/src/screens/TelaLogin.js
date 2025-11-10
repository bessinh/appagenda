// src/screens/TelaLogin.js

import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { login, setToken, getMe, updateMe } from '../api/client';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../context/ThemeContext';

const TelaLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { isDarkMode } = useTheme();
  const styles = getDynamicStyles(isDarkMode);

  const userType = route.params?.userType || 'patient';
  const title = userType === 'clinic' ? 'Acesso do Prestador' : 'Acesso do Paciente';

  const handleLogin = async () => {
    setLoading(true);
    setErro('');
    try {
      const response = await login({
        email,
        senha: password,
      });
      
      setToken(response.data.token);

      const userResponse = await getMe();
      const user = userResponse.data;

      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          if (token) {
            updateMe({ expoPushToken: token });
          }
        }
      } catch (e) {
        console.error("Erro ao obter o push token:", e);
      }

      if (user.tipo === 'prestador') {
        navigation.navigate('PrestadorApp', { user });
      } else {
        navigation.navigate('MainApp', { user });
      }
    } catch (error) {
      setErro(error.response?.data?.erro || 'Falha no login. Verifique suas credenciais ou a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('TelaEsqueciSenha');
  };

  const handleRegister = () => {
    navigation.navigate('TelaCadastro');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.content}>
        <AntDesign name={userType === 'clinic' ? 'plus-square' : 'user'} size={80} color="#1C74B4" style={styles.icon} />
        <Text style={styles.title}>{title}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
          {erro ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{erro}</Text> : null}

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.link}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.link}>Não tem uma conta? <Text style={{ fontWeight: 'bold' }}>Cadastre-se</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getDynamicStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDarkMode ? '#fff' : '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.5 : 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: isDarkMode ? '#f5f5f5' : '#555',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    backgroundColor: isDarkMode ? '#2c2c2c' : '#f0f0f0',
    color: isDarkMode ? '#fff' : '#000',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#1C74B4',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    color: '#1C74B4',
    textDecorationLine: 'underline',
  },
});

export default TelaLogin;