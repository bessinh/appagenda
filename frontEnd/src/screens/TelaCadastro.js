// src/screens/TelaCadastro.js

import { AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskInput from 'react-native-mask-input';
import { register } from '../api/client';
import { useTheme } from '../context/ThemeContext';

const TelaCadastro = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const styles = getDynamicStyles(isDarkMode);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoConta, setTipoConta] = useState('paciente');
  const [documento, setDocumento] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepChange = async (masked, unmasked) => {
    setCep(unmasked);
    if (unmasked.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${unmasked}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setLogradouro(data.logradouro);
          setBairro(data.bairro);
          setCidade(data.localidade);
          setEstado(data.uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setErro('');
    try {
      await register({
        nome,
        email,
        senha,
        tipoConta,
        documento,
        telefone,
        endereco: {
          cep,
          logradouro,
          numero,
          bairro,
          cidade,
          estado,
        },
      });
      Alert.alert('Cadastro realizado!', 'Você já pode fazer login.');
      navigation.navigate('TelaLogin');
    } catch (error) {
      setErro(error.response?.data?.mensagem || 'Erro ao cadastrar. Verifique os dados ou a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const labelDocumento = tipoConta === 'paciente' ? 'CPF' : 'CNPJ';
  const maskDocumento = tipoConta === 'paciente' 
    ? [/\d/,/\d/,/\d/,'.',/\d/,/\d/,/\d/,'.',/\d/,/\d/,/\d/,'-',/\d/,/\d/] 
    : [/\d/,/\d/,'.',/\d/,/\d/,/\d/,'.',/\d/,/\d/,/\d/,'/',/\d/,/\d/,/\d/,/\d/,'-',/\d/,/\d/];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <AntDesign name="left-square" size={30} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          <Text style={styles.screenTitle}>Criar uma conta</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput style={styles.input} placeholder="Seu nome completo..." placeholderTextColor={isDarkMode ? '#999' : '#aaa'} value={nome} onChangeText={setNome} />
            
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="seu@email.com..." placeholderTextColor={isDarkMode ? '#999' : '#aaa'} keyboardType="email-address" value={email} onChangeText={setEmail} />

            <Text style={styles.label}>Senha</Text>
            <TextInput style={styles.input} placeholder="Crie uma senha..." placeholderTextColor={isDarkMode ? '#999' : '#aaa'} secureTextEntry value={senha} onChangeText={setSenha} />

            <Text style={styles.label}>Tipo de Conta</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={tipoConta} style={styles.picker} onValueChange={(itemValue) => setTipoConta(itemValue)} dropdownIconColor={isDarkMode ? '#fff' : '#000'}>
                <Picker.Item label="Sou Paciente" value="paciente" color={isDarkMode ? '#fff' : '#000'}/>
                <Picker.Item label="Sou Clínica / Prestador" value="prestador" color={isDarkMode ? '#fff' : '#000'}/>
              </Picker>
            </View>
            
            <Text style={styles.label}>{labelDocumento}</Text>
            <MaskInput style={styles.input} value={documento} onChangeText={(masked, unmasked) => setDocumento(unmasked)} mask={maskDocumento} placeholderTextColor={isDarkMode ? '#999' : '#aaa'}/>

            <Text style={styles.label}>Telefone</Text>
            <MaskInput style={styles.input} placeholder="(00) 00000-0000" placeholderTextColor={isDarkMode ? '#999' : '#aaa'} keyboardType="phone-pad" value={telefone} onChangeText={(masked, unmasked) => setTelefone(unmasked)} mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]} />

            <Text style={styles.label}>CEP</Text>
            <View style={styles.cepContainer}>
              <MaskInput style={styles.input} placeholder="00000-000" placeholderTextColor={isDarkMode ? '#999' : '#aaa'} keyboardType="numeric" value={cep} onChangeText={handleCepChange} mask={[ /\d/,/\d/,/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/]} />
              {cepLoading && <ActivityIndicator style={styles.cepLoading} size="small" color="#1C74B4" />}
            </View>

            <Text style={styles.label}>Endereço</Text>
            <TextInput style={styles.input} placeholder="Rua, Avenida..." placeholderTextColor={isDarkMode ? '#999' : '#aaa'} value={logradouro} onChangeText={setLogradouro} />
            
            <Text style={styles.label}>Número</Text>
            <TextInput style={styles.input} placeholder="Ex: 123" placeholderTextColor={isDarkMode ? '#999' : '#aaa'} keyboardType="numeric" value={numero} onChangeText={setNumero} />
            
            <Text style={styles.label}>Bairro</Text>
            <TextInput style={styles.input} placeholder="Seu bairro..." placeholderTextColor={isDarkMode ? '#999' : '#aaa'} value={bairro} onChangeText={setBairro} />
            
            <Text style={styles.label}>Cidade</Text>
            <TextInput style={styles.input} placeholder="Sua cidade..." placeholderTextColor={isDarkMode ? '#999' : '#aaa'} value={cidade} onChangeText={setCidade} />
            
            <Text style={styles.label}>Estado (UF)</Text>
            <TextInput style={styles.input} placeholder="Ex: SP" placeholderTextColor={isDarkMode ? '#999' : '#aaa'} maxLength={2} autoCapitalize="characters" value={estado} onChangeText={setEstado} />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
            </TouchableOpacity>
            {erro ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>{erro}</Text> : null}
            <TouchableOpacity onPress={() => navigation.navigate('TelaLogin')}>
              <Text style={styles.loginLink}>Já tem conta? Faça Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getDynamicStyles = (isDarkMode) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F0F0' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  container: { paddingHorizontal: 20, paddingVertical: 30 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 15, padding: 5 },
  screenTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: isDarkMode ? '#fff' : '#000' },
  card: { 
    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', 
    borderRadius: 15, 
    padding: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: isDarkMode ? 0.5 : 0.1, 
    shadowRadius: 5, 
    elevation: 3 
  },
  label: { fontSize: 16, color: isDarkMode ? '#f5f5f5' : '#333', marginBottom: 5, marginTop: 15 },
  input: { 
    flex: 1, 
    backgroundColor: isDarkMode ? '#2c2c2c' : '#F9F9F9', 
    color: isDarkMode ? '#fff' : '#000',
    borderRadius: 8, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderColor: isDarkMode ? '#444' : '#E0E0E0', 
    fontSize: 16 
  },
  pickerContainer: { 
    backgroundColor: isDarkMode ? '#2c2c2c' : '#F9F9F9', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: isDarkMode ? '#444' : '#E0E0E0', 
    overflow: 'hidden', 
    marginTop: 5 
  },
  picker: { 
    height: 50, 
    width: '100%',
    color: isDarkMode ? '#fff' : '#000',
  },
  cepContainer: { flexDirection: 'row', alignItems: 'center' },
  cepLoading: { marginLeft: 10 },
  button: { backgroundColor: '#1C74B4', paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginLink: { color: '#1C74B4', fontSize: 15, textDecorationLine: 'underline', textAlign: 'center', marginTop: 15 },
});

export default TelaCadastro;
