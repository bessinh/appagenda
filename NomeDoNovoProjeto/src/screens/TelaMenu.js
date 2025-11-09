import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { getMe, clearToken } from '../api/client';

const TelaMenu = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const response = await getMe();
          setUser(response.data);
        } catch (error) {
          console.error("Erro ao buscar dados do usuário no menu:", error);
          Alert.alert('Sessão expirada', 'Por favor, faça login novamente.');
          handleLogout();
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }, [])
  );

  const handleEditProfile = () => {
    navigation.navigate('EditarPerfil');
  };

  const handleSettings = () => {
    navigation.navigate('Configuracoes');
  };

  const handleHelp = () => {
    navigation.navigate('Ajuda');
  };

  const handleLogout = () => {
    clearToken();
    navigation.reset({
        index: 0,
        routes: [{ name: 'TelaBemVindo' }],
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileIconWrapper}>
          <AntDesign name="user" size={50} color="#1C74B4" />
        </View>
        <View style={styles.profileTextContainer}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.profileName}>{user?.nome || 'Usuário'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'Carregando...'}</Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <View style={styles.itemContent}>
            <AntDesign name="edit" size={24} color="#555" />
            <Text style={styles.menuItemText}>Editar Perfil</Text>
          </View>
          <AntDesign name="right" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <View style={styles.itemContent}>
            <AntDesign name="setting" size={24} color="#555" />
            <Text style={styles.menuItemText}>Configurações</Text>
          </View>
          <AntDesign name="right" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
          <View style={styles.itemContent}>
            <AntDesign name="questioncircle" size={24} color="#555" />
            <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
          </View>
          <AntDesign name="right" size={18} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <View style={styles.itemContent}>
            <AntDesign name="logout" size={24} color="#d9534f" />
            <Text style={[styles.menuItemText, { color: '#d9534f' }]}>Sair</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1C74B4',
      paddingVertical: 20,
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    profileIconWrapper: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#f0f0f0'
    },
    profileTextContainer: {
      marginLeft: 15,
    },
    profileName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#fff',
    },
    profileEmail: {
      fontSize: 14,
      color: '#eee',
    },
    menuList: {
      marginTop: -10,
      backgroundColor: '#fff',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      paddingTop: 10,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderColor: '#f0f0f0',
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuItemText: {
      fontSize: 16,
      marginLeft: 20,
      color: '#333',
    },
    logoutButton: {
      marginTop: 10,
      borderBottomWidth: 0,
    },
  });

export default TelaMenu;
