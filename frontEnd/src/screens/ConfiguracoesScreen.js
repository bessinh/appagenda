
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMe, updateMe, deleteMe, clearToken } from '../api/client';
import { useTheme } from '../context/ThemeContext';

const ConfiguracoesScreen = () => {
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isDarkMode, toggleTheme, isLoadingTheme } = useTheme();

    useFocusEffect(
        useCallback(() => {
            const loadUserSettings = async () => {
                setIsLoading(true);
                try {
                    const response = await getMe();
                    if (!response.data.perfil.configuracoes) {
                        response.data.perfil.configuracoes = {
                            lembretesEnabled: true,
                            promocoesEnabled: true,
                        };
                    }
                    setUserProfile(response.data.perfil);
                } catch (e) {
                    console.error('Falha ao carregar as configurações do usuário.', e);
                    Alert.alert("Erro", "Não foi possível carregar suas configurações.");
                } finally {
                    setIsLoading(false);
                }
            };
            loadUserSettings();
        }, [])
    );

    const handleSettingChange = async (key, value) => {
        if (!userProfile) return;

        const updatedProfile = {
            ...userProfile,
            configuracoes: { ...userProfile.configuracoes, [key]: value },
        };
        setUserProfile(updatedProfile);

        const updatePayload = { [`perfil.configuracoes.${key}`]: value };

        try {
            await updateMe(updatePayload);
        } catch (error) {
            console.error(`Falha ao salvar a configuração '${key}'.`, error);
            const revertedProfile = {
                ...userProfile,
                configuracoes: { ...userProfile.configuracoes, [key]: !value },
            };
            setUserProfile(revertedProfile);
            Alert.alert("Erro", `Não foi possível salvar a sua preferência.`);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Excluir Conta",
            "Você tem certeza? Esta ação é permanente e todos os seus dados serão perdidos.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim, Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMe();
                            clearToken();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'TelaBemVindo' }],
                            });
                            Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.");
                        } catch (error) {
                            console.error("Erro ao excluir conta:", error);
                            Alert.alert("Erro", "Não foi possível excluir sua conta. Tente novamente mais tarde.");
                        }
                    }
                }
            ]
        );
    };

    // Estilos dinâmicos baseados no tema
    const dynamicStyles = getDynamicStyles(isDarkMode);

    if (isLoading || isLoadingTheme) {
        return <View style={[dynamicStyles.container, dynamicStyles.centered]}><ActivityIndicator size="large" color="#1C74B4" /></View>;
    }

    const { lembretesEnabled, promocoesEnabled } = userProfile?.configuracoes || {};

    return (
        <ScrollView style={dynamicStyles.container}>
            <Text style={dynamicStyles.headerTitle}>Configurações</Text>

            <View style={dynamicStyles.card}>
                <SettingSwitchRow isDarkMode={isDarkMode} icon="notifications-outline" color="#1E90FF" title="Lembretes de consulta" description="Receba um alerta 24h antes" value={lembretesEnabled} onValueChange={(newValue) => handleSettingChange('lembretesEnabled', newValue)} />
                <View style={dynamicStyles.separator} />
                <SettingSwitchRow isDarkMode={isDarkMode} icon="megaphone-outline" color="#32CD32" title="Promoções e novidades" description="Receba ofertas especiais" value={promocoesEnabled} onValueChange={(newValue) => handleSettingChange('promocoesEnabled', newValue)} />
            </View>

            <View style={dynamicStyles.card}>
                <SettingSwitchRow isDarkMode={isDarkMode} icon="contrast-outline" color="#8A2BE2" title="Tema Escuro" description="Reduz o cansaço visual à noite" value={isDarkMode} onValueChange={toggleTheme} />
            </View>

            <View style={dynamicStyles.card}>
                <SettingLinkRow isDarkMode={isDarkMode} icon="information-circle-outline" color="#FFA500" title="Sobre o App" onPress={() => Alert.alert("Sobre", "Versão do Aplicativo: 1.0.0")} />
                <View style={dynamicStyles.separator} />
                <SettingLinkRow isDarkMode={isDarkMode} icon="star-outline" color="#FF69B4" title="Avaliar na Loja" onPress={() => Alert.alert("Avaliar", "Esta ação levaria para a App Store / Google Play.")} />
            </View>
            
            <View style={dynamicStyles.card}>
                 <SettingLinkRow isDarkMode={isDarkMode} icon="shield-checkmark-outline" color="#666" title="Política de Privacidade" onPress={() => {}} />
                <View style={dynamicStyles.separator} />
                <SettingLinkRow isDarkMode={isDarkMode} icon="trash-outline" color="#DC143C" title="Excluir minha conta" onPress={handleDeleteAccount} />
            </View>
            <View style={{height: 40}}/>
        </ScrollView>
    );
};

// Componentes Reutilizáveis atualizados para aceitar o tema
const SettingSwitchRow = ({ isDarkMode, icon, color, title, description, value, onValueChange }) => {
    const styles = getDynamicStyles(isDarkMode);
    return (
        <View style={styles.row}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon} size={20} color="#fff" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>{title}</Text>
                <Text style={styles.rowDescription}>{description}</Text>
            </View>
            <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#767577", true: "#1C74B4" }} thumbColor={"#f4f3f4"} />
        </View>
    );
};

const SettingLinkRow = ({ isDarkMode, icon, color, title, onPress }) => {
    const styles = getDynamicStyles(isDarkMode);
    return (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon} size={20} color="#fff" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.rowTitle}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={22} color="#ccc" />
        </TouchableOpacity>
    );
};

// Função que gera os estilos com base no modo escuro
const getDynamicStyles = (isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#f0f2f5',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: isDarkMode ? '#fff' : '#333',
        marginTop: 60,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        borderRadius: 12,
        marginHorizontal: 15,
        marginBottom: 20,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.5 : 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: isDarkMode ? '#f5f5f5' : '#333',
    },
    rowDescription: {
        fontSize: 12,
        color: isDarkMode ? '#aaa' : '#888',
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: isDarkMode ? '#333' : '#f0f2f5',
        marginLeft: 60,
    },
});

export default ConfiguracoesScreen;
