// EditarPerfilScreen.js (Versão Atualizada)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, Pressable, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMe, updateMe } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import MaskInput from 'react-native-mask-input';
import { AntDesign } from '@expo/vector-icons'; // Para ícones

// ⚠️ SIMULE AS SEGUINTES FUNÇÕES NO SEU ARQUIVO DE API REAL:
// import { solicitarAlteracaoEmail, confirmarAlteracaoEmail, solicitarAlteracaoTelefone, confirmarAlteracaoTelefone } from '../api/client';

// Função utilitária para simular funções de API pendentes
const apiSimulated = (value, type) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Simulação: Código enviado para ${value} (${type})`);
            resolve({ success: true });
        }, 1500);
    });
};

const EditarPerfilScreen = () => {
    const { isDarkMode } = useTheme();
    const styles = getDynamicStyles(isDarkMode);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Dados do formulário
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    // ... (campos de endereço)
    const [cep, setCep] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState(null); // URL da imagem de perfil

    // 💡 ESTADOS DO MODAL DE VERIFICAÇÃO
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newContactValue, setNewContactValue] = useState(''); // Novo email/telefone
    const [verificationCode, setVerificationCode] = useState(''); // Código digitado
    const [verificationType, setVerificationType] = useState(null); // 'email' ou 'phone'
    const [modalStep, setModalStep] = useState(1); // 1: Solicitar, 2: Confirmar

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
                    // 💡 Novo campo de imagem
                    setProfileImageUrl(data.profileImageUrl || null); 
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

    // 💡 LÓGICA DE VERIFICAÇÃO DE E-MAIL/TELEFONE
    const handleRequestChange = (type) => {
        setVerificationType(type);
        setNewContactValue(type === 'email' ? email : phone); // Define o valor atual como placeholder inicial
        setVerificationCode('');
        setModalStep(1);
        setIsModalVisible(true);
    };

    const handleSendCode = async () => {
        if (!newContactValue) {
            Alert.alert("Erro", `Digite o novo ${verificationType === 'email' ? 'e-mail' : 'telefone'}.`);
            return;
        }

        setIsSaving(true);
        try {
            // Chamar a função da API para solicitar o código
            await apiSimulated(newContactValue, verificationType); // ⚠️ SUBSTITUIR PELA SUA FUNÇÃO REAL
            
            Alert.alert('Sucesso', `Código de segurança enviado para o novo ${verificationType}.`);
            setModalStep(2); // Vai para o passo de confirmação
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar o código. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmCode = async () => {
        if (verificationCode.length < 4) { // Assumindo 4 dígitos
            Alert.alert("Erro", "O código de segurança deve ter 4 dígitos.");
            return;
        }

        setIsSaving(true);
        try {
            // Chamar a função da API para confirmar o código
            // ⚠️ SUBSTITUIR PELA SUA FUNÇÃO REAL (EX: confirmarAlteracaoEmail)
            const apiCall = verificationType === 'email' 
                ? apiSimulated(newContactValue, 'confirm_email') 
                : apiSimulated(newContactValue, 'confirm_phone');
                
            await apiCall; 

            // Se for bem-sucedido, atualiza o estado da tela
            if (verificationType === 'email') {
                setEmail(newContactValue);
            } else {
                setPhone(newContactValue);
            }

            Alert.alert('Sucesso', `Seu ${verificationType} foi atualizado com sucesso!`);
            setIsModalVisible(false);
        } catch (error) {
            Alert.alert('Erro', 'Código inválido ou expirado. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };
    
    // Função para salvar nome e endereço (que não exigem verificação)
    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const payload = {
                nome: name,
                // Telefone e Email só são alterados via Modal
                endereco: { cep, logradouro: street, numero, bairro: neighborhood, cidade: city, estado: state, complemento: complement, }
            };
            await updateMe(payload);
            Alert.alert('Sucesso', 'Nome e Endereço foram salvos!');
        } catch (error) {
            console.error("Falha ao salvar alterações do perfil.", error);
            Alert.alert("Erro", "Não foi possível salvar suas alterações.");
        } finally {
            setIsSaving(false);
        }
    };

    // 💡 SIMULAÇÃO DA SELEÇÃO DE IMAGEM
    const handleImageChange = () => {
        Alert.alert(
            "Mudar Imagem",
            "A lógica de seleção de imagem (Image Picker) deve ser implementada aqui.",
            [{ text: "OK" }]
        );
        // Lógica de seleção (usando ImagePicker) e upload para o backend iria aqui
    };


    if (isLoading) {
        // Revertido para o fundo sólido
        return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#1C74B4" /></View>;
    }

    // 💡 MODAL DE VERIFICAÇÃO
    const renderVerificationModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={styles.modalCenteredView}>
                <View style={[styles.modalView, {backgroundColor: isDarkMode ? '#1e1e1e' : '#fff'}]}>
                    <Text style={[styles.modalTitle, {color: isDarkMode ? '#fff' : '#000'}]}>
                        {modalStep === 1 ? `Novo ${verificationType === 'email' ? 'E-mail' : 'Telefone'}` : 'Confirmar Código'}
                    </Text>

                    {modalStep === 1 && (
                        <>
                            <Text style={styles.modalText}>
                                Digite o novo {verificationType === 'email' ? 'e-mail' : 'telefone'} para receber o código.
                            </Text>
                            <TextInput 
                                style={[styles.input, {width: '100%'}]} 
                                value={newContactValue} 
                                onChangeText={setNewContactValue}
                                keyboardType={verificationType === 'email' ? 'email-address' : 'numeric'}
                                placeholder={`Novo ${verificationType === 'email' ? 'E-mail' : 'Telefone'}`}
                                placeholderTextColor={styles.placeholder.color}
                            />
                            <TouchableOpacity style={styles.modalButton} onPress={handleSendCode} disabled={isSaving}>
                                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Enviar Código</Text>}
                            </TouchableOpacity>
                        </>
                    )}

                    {modalStep === 2 && (
                        <>
                            <Text style={styles.modalText}>
                                Enviamos um código para **{newContactValue}**. Digite-o abaixo para confirmar a alteração.
                            </Text>
                            <TextInput 
                                style={[styles.input, {width: '100%', textAlign: 'center'}]} 
                                value={verificationCode} 
                                onChangeText={setVerificationCode}
                                keyboardType="numeric"
                                maxLength={4}
                                placeholder="----"
                                placeholderTextColor={styles.placeholder.color}
                            />
                            <TouchableOpacity style={styles.modalButton} onPress={handleConfirmCode} disabled={isSaving}>
                                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Confirmar</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                    
                    <Pressable style={styles.modalCloseButton} onPress={() => setIsModalVisible(false)}>
                        <Text style={[styles.modalCloseText, {color: isDarkMode ? '#aaa' : '#666'}]}>Cancelar</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
    
    // 💡 RENDERIZAÇÃO DA TELA PRINCIPAL
    return (
        <View style={styles.fullScreenContainer}>
            <ScrollView style={styles.container}>
                <View style={styles.form}>
                    
                    {/* 💡 IMAGEM DE PERFIL */}
                    <View style={styles.profileImageContainer}>
                        <TouchableOpacity onPress={handleImageChange}>
                            {profileImageUrl ? (
                                <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <AntDesign name="user" size={60} color={isDarkMode ? '#888' : '#ccc'} />
                                    <View style={styles.cameraIcon}>
                                        <AntDesign name="camerao" size={20} color="#fff" />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                    
                    {/* NOME (Alteração direta) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome Completo</Text>
                        <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={styles.placeholder.color} />
                    </View>
                    
                    {/* E-MAIL (Alteração via modal) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>E-mail</Text>
                        <View style={styles.contactRow}>
                            <TextInput style={[styles.input, styles.disabledInput, styles.contactInput]} value={email} editable={false} />
                            <TouchableOpacity style={styles.changeButton} onPress={() => handleRequestChange('email')}>
                                <Text style={styles.changeButtonText}>Mudar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* TELEFONE (Alteração via modal) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Telefone</Text>
                        <View style={styles.contactRow}>
                            <MaskInput 
                                style={[styles.input, styles.disabledInput, styles.contactInput]} 
                                value={phone} 
                                mask={['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]} 
                                editable={false}
                            />
                            <TouchableOpacity style={styles.changeButton} onPress={() => handleRequestChange('phone')}>
                                <Text style={styles.changeButtonText}>Mudar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Endereço</Text>
                    
                    {/* CAMPOS DE ENDEREÇO (Alteração direta) */}
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
                    {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
                </TouchableOpacity>
            </ScrollView>
            
            {renderVerificationModal()}
        </View>
    );
};

// ... ESTILOS (Continua abaixo)
const getDynamicStyles = (isDarkMode) => StyleSheet.create({
    // 💡 NOVO: Container para envolver a tela toda (necessário se o ScrollView for transparente)
    fullScreenContainer: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#f5f5f5', 
    },
    // ⬅️ REVERTIDO PARA O FUNDO SÓLIDO
    container: { 
        flex: 1, 
        backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' 
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#f5f5f5' 
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
    },
    
    // 💡 NOVOS ESTILOS PARA E-MAIL/TELEFONE E IMAGEM
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    contactInput: {
        flex: 1,
        marginRight: 10,
    },
    changeButton: {
        backgroundColor: '#1C74B4',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        height: 48, // Ajustar com a altura do input
        justifyContent: 'center',
    },
    changeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    // Imagem de Perfil
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#1C74B4',
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: isDarkMode ? '#2c2c2c' : '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: isDarkMode ? '#444' : '#ddd',
        position: 'relative',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1C74B4',
        borderRadius: 15,
        padding: 5,
    },
    
    // 💡 ESTILOS DO MODAL
    modalCenteredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '85%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: isDarkMode ? '#ccc' : '#333',
    },
    modalButton: {
        backgroundColor: '#1C74B4',
        borderRadius: 8,
        padding: 12,
        elevation: 2,
        marginTop: 15,
        width: '100%',
    },
    modalCloseButton: {
        marginTop: 20,
        padding: 10,
    },
    modalCloseText: {
        fontSize: 16,
    }
});

export default EditarPerfilScreen;