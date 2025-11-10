// src/screens/AjudaScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, LayoutAnimation, ActivityIndicator, Alert } from 'react-native';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getHelpContent } from '../api/client';

// -- Componente "Sanfona" (Accordion) para o FAQ --
const FaqItem = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.faqContainer}>
      <TouchableOpacity style={styles.faqQuestionRow} onPress={toggleExpand}>
        <Text style={styles.faqQuestionText}>{question}</Text>
        <AntDesign name={isExpanded ? 'up' : 'down'} size={18} color="#1C74B4" />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};


const AjudaScreen = () => {
  const [helpData, setHelpData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        const response = await getHelpContent();
        setHelpData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados de ajuda:", error);
        Alert.alert("Erro", "Não foi possível carregar o conteúdo de ajuda.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHelpData();
  }, []);

  const handleContactPress = (type) => {
    if (!helpData?.contato) return;

    const { telefone, email, whatsapp } = helpData.contato;

    if (type === 'call') {
      Linking.openURL(`tel:${telefone}`);
    } else if (type === 'email') {
      Linking.openURL(`mailto:${email}?subject=Ajuda sobre o App`);
    } else if (type === 'whatsapp') {
      Linking.openURL(`whatsapp://send?phone=${whatsapp}&text=Olá! Preciso de ajuda com o aplicativo.`);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1C74B4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ajuda e Suporte</Text>

      {/* Seção de Perguntas Frequentes */}
      <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
      <View style={styles.section}>
        {helpData?.faq?.map((faq, index) => (
          <FaqItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </View>

      {/* Seção de Contato */}
      <Text style={styles.sectionTitle}>Ainda precisa de ajuda?</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.contactRow} onPress={() => handleContactPress('call')}>
          <Ionicons name="call-outline" size={24} color="#1C74B4" />
          <Text style={styles.contactLabel}>Ligar para o Suporte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow} onPress={() => handleContactPress('email')}>
          <Ionicons name="mail-outline" size={24} color="#1C74B4" />
          <Text style={styles.contactLabel}>Enviar um E-mail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow} onPress={() => handleContactPress('whatsapp')}>
          <MaterialCommunityIcons name="whatsapp" size={24} color="#1C74B4" />
          <Text style={styles.contactLabel}>Conversar no WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        margin: 20,
        marginTop: 50,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 15,
        marginBottom: 10,
        marginLeft: 20,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        borderRadius: 8,
        overflow: 'hidden',
    },
    faqContainer: {
        borderBottomWidth: 1,
        borderColor: '#f0f2f5',
    },
    faqQuestionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    faqQuestionText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginRight: 10,
    },
    faqAnswerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    faqAnswerText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderColor: '#f0f2f5',
    },
    contactLabel: {
        fontSize: 16,
        color: '#1C74B4',
        marginLeft: 15,
        fontWeight: 'bold',
    },
});

export default AjudaScreen;