import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMe, updateMe } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import MaskInput from 'react-native-mask-input';

const EditarPerfilScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getDynamicStyles(isDarkMode);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Dados do formulário
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');

    useFocusEffect(
        useCallback(() => {
            const loadUserData = async () => {
                setIsLoading(true);
                try {
                    const { data } = await getMe();
                    setName(data.nome || '');
                    setEmail(data.email || '');
                    setPhone(data.telefone || '');
                    setCep(data.endereco?.cep || '');
                    setStreet(data.endereco?.logradouro || '');
                    setNumber(data.endereco?.numero || '');
                    setComplement(data.endereco?.complemento || '');
                    setNeighborhood(data.endereco?.bairro || '');
                    setCity(data.endereco?.cidade || '');
                    setState(data.endereco?.estado || '');
                } catch (error) {
                    console.error("Falha ao carregar dados do perfil.", error);
                    Alert.alert("Erro", "Não foi possível carregar seus dados.");
                } finally {
                    setIsLoading(false);
                }
            };
            loadUserData();
        }, [])
    );

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const payload = {
                nome: name,
                telefone: phone,
                endereco: {
                    cep,
                    logradouro: street,
                    numero,
                    bairro: neighborhood,
                    cidade: city,
                    estado: state,
                    complemento: complement,
                }
            };
            await updateMe(payload);
            Alert.alert('Sucesso', 'Suas alterações foram salvas!');
        } catch (error) {
            console.error("Falha ao salvar alterações do perfil.", error);
            Alert.alert("Erro", "Não foi possível salvar suas alterações.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#1C74B4" /></View>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome Completo</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={styles.placeholder.color} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>E-mail</Text>
                    <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Telefone</Text>
                    <MaskInput 
                        style={styles.input} 
                        value={phone} 
                        onChangeText={(masked, unmasked) => setPhone(unmasked)} 
                        mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]} 
                        placeholderTextColor={styles.placeholder.color}
                    />
                </View>

                <Text style={styles.sectionTitle}>Endereço</Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>CEP</Text>
                    <MaskInput style={styles.input} value={cep} onChangeText={(m, u) => setCep(u)} keyboardType="numeric" mask={[ /\d/,/\d/,/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/]} placeholderTextColor={styles.placeholder.color} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Rua / Logradouro</Text>
                    <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholderTextColor={styles.placeholder.color} />
                </View>
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Número</Text>
                        <TextInput style={styles.input} value={number} onChangeText={setNumber} keyboardType="numeric" placeholderTextColor={styles.placeholder.color} />
                    </View>
                    <View style={[styles.inputGroup, { flex: 2 }]}>
                        <Text style={styles.label}>Complemento</Text>
                        <TextInput style={styles.input} value={complement} onChangeText={setComplement} placeholderTextColor={styles.placeholder.color} />
                    </View>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bairro</Text>
                    <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} placeholderTextColor={styles.placeholder.color} />
                </View>
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
                        <Text style={styles.label}>Cidade</Text>
                        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholderTextColor={styles.placeholder.color} />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Estado (UF)</Text>
                        <TextInput style={styles.input} value={state} onChangeText={setState} maxLength={2} autoCapitalize="characters" placeholderTextColor={styles.placeholder.color} />
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar Alterações</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const getDynamicStyles = (isDarkMode) => StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' 
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    form: { 
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: isDarkMode ? '#fff' : '#333', 
        marginTop: 20, 
        marginBottom: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: isDarkMode ? '#333' : '#eee', 
        paddingBottom: 10 
    },
    inputGroup: { 
        marginBottom: 20 
    },
    label: { 
        fontSize: 16, 
        color: isDarkMode ? '#aaa' : '#666', 
        marginBottom: 5 
    },
    input: { 
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff', 
        color: isDarkMode ? '#fff' : '#000',
        paddingHorizontal: 15, 
        paddingVertical: 12, 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: isDarkMode ? '#444' : '#ddd', 
        fontSize: 16 
    },
    disabledInput: {
        backgroundColor: isDarkMode ? '#2c2c2c' : '#f0f0f0',
        color: isDarkMode ? '#888' : '#777',
    },
    row: { 
        flexDirection: 'row' 
    },
    saveButton: { 
        backgroundColor: '#1C74B4', 
        marginVertical: 20, 
        marginHorizontal: 20, 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    saveButtonText: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    placeholder: {
        color: isDarkMode ? '#999' : '#aaa'
    }
});

export default EditarPerfilScreen;