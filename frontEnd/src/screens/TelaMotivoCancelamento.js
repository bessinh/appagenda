// src/screens/TelaMotivoCancelamento.js

import { AntDesign } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHelpContent, cancelarConsulta } from '../api/client';

const TelaMotivoCancelamento = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointment } = route.params;

  const [motivos, setMotivos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    const fetchMotivos = async () => {
      try {
        const response = await getHelpContent();
        setMotivos(response.data?.motivosCancelamento || []);
      } catch (error) {
        console.error("Erro ao buscar motivos de cancelamento:", error);
        Alert.alert("Erro", "Não foi possível carregar os motivos. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMotivos();
  }, []);

  const handleSelectReason = async (reason) => {
    setIsCanceling(true);
    try {
      await cancelarConsulta(appointment._id, reason);
      Alert.alert('Sucesso', 'Sua consulta foi cancelada.');
      navigation.navigate('MainApp', { screen: 'Início' });
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      Alert.alert("Erro", error.response?.data?.erro || "Não foi possível cancelar a consulta.");
    } finally {
      setIsCanceling(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.reasonButton} onPress={() => handleSelectReason(item)} disabled={isCanceling}>
      <Text style={styles.reasonText}>{item}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#1C74B4" />
          <Text style={{ marginTop: 10 }}>Carregando motivos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <AntDesign name="left-square" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Motivo do Cancelamento</Text>
        <Text style={styles.subtitle}>Por favor, selecione o motivo pelo qual você está cancelando a consulta.</Text>
        {isCanceling ? (
          <ActivityIndicator size="large" color="#1C74B4" />
        ) : (
          <FlatList
            data={motivos}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            style={styles.list}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 20 },
  backButton: { position: 'absolute', top: 20, left: 20, padding: 10, zIndex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 60, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  list: { width: '100%' },
  reasonButton: { backgroundColor: '#fff', padding: 20, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  reasonText: { fontSize: 16, color: '#333' },
});

export default TelaMotivoCancelamento;