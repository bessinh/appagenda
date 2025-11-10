// src/screens/TelaBemVindo.js

import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TelaBemVindo = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const styles = getDynamicStyles(isDarkMode);

  const handlePatientLogin = () => {
    navigation.navigate('TelaLogin', { userType: 'patient' });
  };

  const handleClinicLogin = () => {
    navigation.navigate('TelaLogin', { userType: 'clinic' });
  };

  const handleCadastro = () => {
    navigation.navigate('TelaCadastro');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Bem-vindo ao Aplicativo!</Text>
        <Text style={styles.title}>Agenda Digital</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Selecione o tipo de acesso</Text>
          
          <Text style={styles.description}>Agende suas consultas de forma rápida e fácil.</Text>
          <TouchableOpacity style={styles.button} onPress={handlePatientLogin}>
            <Text style={styles.buttonText}>Entrar como Paciente</Text>
            <AntDesign name="user" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>

          <Text style={styles.description}>Gerencie sua clínica de forma eficiente.</Text>
          <TouchableOpacity style={styles.button} onPress={handleClinicLogin}>
            <Text style={styles.buttonText}>Entrar com Clínica</Text>
            <AntDesign name="plus" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCadastro}>
            <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getDynamicStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#eef3f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: isDarkMode ? '#b0b0b0' : '#666',
    fontWeight: 'normal',
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: isDarkMode ? '#ffffff' : '#333',
    marginBottom: 30,
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
  cardHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDarkMode ? '#f5f5f5' : '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: isDarkMode ? '#a0a0a0' : '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C74B4',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 10,
  },
  buttonIcon: {
    color: '#fff',
  },
  linkText: {
    marginTop: 10,
    color: '#1C74B4',
    textDecorationLine: 'underline',
  },
});

export default TelaBemVindo;