import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const DetalhesProfissionalScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    
    // 1. Recebe os dados do profissional (dentista)
    const dentist = route.params?.user; 

    if (!dentist) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Erro: Profissional não encontrado.</Text>
                <Button title="Voltar" onPress={() => navigation.goBack()} color="#1C74B4" />
            </View>
        );
    }

    // --- FUNÇÃO DE NAVEGAÇÃO FINAL ---
    const handleAgendarConsulta = () => {
        // Navega para a tela 'AgendaScreen' e passa o objeto 'dentist' como parâmetro 'profissional'
        navigation.navigate('AgendaScreen', {
            profissional: dentist,
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.title}>Detalhes do Profissional</Text>
            
            <View style={styles.card}>
                <Text style={styles.name}>{dentist.nome}</Text>
                <Text style={styles.specialty}>{dentist.perfil?.especialidades?.join(', ') || 'Especialidade não informada'}</Text>
                
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={18} color="#6c757d" />
                    <Text style={styles.infoText}>{dentist.address}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <MaterialIcons name="near-me" size={18} color="#6c757d" />
                    <Text style={styles.infoText}>Apenas {dentist.distance.toFixed(1)} km de distância</Text>
                </View>
                
            </View>

            <Text style={styles.sectionTitle}>Confirmação</Text>
            <Text style={styles.confirmationText}>
                Confirme se este é o profissional desejado para prosseguir com a seleção de data e horário.
            </Text>

            {/* O BOTÃO AGORA CHAMA A FUNÇÃO DE NAVEGAÇÃO CORRETA */}
            <TouchableOpacity 
                style={styles.agendarButton}
                onPress={handleAgendarConsulta} 
            >
                <Text style={styles.agendarButtonText}>Agendar Consulta</Text>
            </TouchableOpacity>
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
        padding: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 50,
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1C74B4',
        marginBottom: 5,
    },
    specialty: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginLeft: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    confirmationText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        lineHeight: 24,
    },
    agendarButton: {
        backgroundColor: '#28a745', // Cor verde para a ação principal
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    agendarButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    }
});

export default DetalhesProfissionalScreen;