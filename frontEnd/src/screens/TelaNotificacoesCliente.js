import { Feather, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listarMinhasConsultas, getMe, markNotificationsAsRead } from '../api/client';
import { useTheme } from '../context/ThemeContext';

// Utilitário para formatar data legível
function formatarDataHora(dateStr, horaStr) {
  try {
    const base = dateStr.includes('T') ? new Date(dateStr) : new Date(`${dateStr}T${(horaStr||'00:00')}:00`);
    return base.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return `${dateStr} ${horaStr || ''}`.trim();
  }
}

const NOTIFICATION_TYPES = {
  agendamento: { icon: 'calendar', color: '#28a745' },
  cancelamento: { icon: 'x-circle', color: '#d9534f' },
  lembrete: { icon: 'bell', color: '#ffc107' },
};

const TelaNotificacoesCliente = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const styles = getDynamicStyles(isDarkMode);
  
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Hook para atualizar o badge na barra de abas
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
      });
    }, [navigation, unreadCount])
  );

  // Hook para buscar e processar as notificações
  useFocusEffect(
    useCallback(() => {
      const fetchNotifications = async () => {
        setIsLoading(true);
        try {
          // Busca consultas e dados do usuário em paralelo
          const [consultasResp, userResp] = await Promise.all([
            listarMinhasConsultas(),
            getMe(),
          ]);

          const consultas = consultasResp.data || [];
          const readIds = new Set(userResp.data?.readNotificationIds || []);
          const agora = new Date();

          const itens = consultas.map(c => {
            const dtLegivel = formatarDataHora(c.data, c.horario);
            const timestamp = c.updatedAt ? new Date(c.updatedAt) : new Date();
            let type = 'agendamento';
            let title = 'Consulta Agendada';
            let message = `Sua consulta com ${c.dentista?.nome || 'o profissional'} foi marcada para ${dtLegivel}.`;

            if (c.status === 'cancelado') {
              type = 'cancelamento';
              title = 'Consulta Cancelada';
              message = `Sua consulta em ${dtLegivel} com ${c.dentista?.nome} foi cancelada. Motivo: ${c.motivoCancelamento}`;
            } else {
              const dataConsulta = new Date(`${c.data.split('T')[0]}T${c.horario}:00`);
              const diffMs = dataConsulta.getTime() - agora.getTime();
              if (diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000) {
                type = 'lembrete';
                title = 'Lembrete de Consulta';
                message = `Não se esqueça da sua consulta com ${c.dentista?.nome} amanhã às ${c.horario}.`;
              }
            }
            
            return {
              id: c._id,
              type,
              title,
              message,
              date: dtLegivel,
              timestamp,
              isRead: readIds.has(c._id), // Verifica se o ID já foi lido
              appointmentData: c, 
            };
          }).sort((a, b) => b.timestamp - a.timestamp);
          
          setNotifications(itens);
        } catch (error) {
          console.error("Erro ao buscar notificações do cliente:", error);
          setNotifications([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchNotifications();
    }, [])
  );

  const handleMarkAsRead = async (id) => {
    // Atualização otimista da UI
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
    // Sincroniza com o backend
    try {
      await markNotificationsAsRead([id]);
    } catch (error) {
      console.error("Falha ao marcar notificação como lida no servidor:", error);
      // Opcional: reverter o estado se a chamada falhar
    }
  };
  
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;

    // Atualização otimista da UI
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    
    // Sincroniza com o backend
    try {
      await markNotificationsAsRead(unreadIds);
    } catch (error) {
      console.error("Falha ao marcar todas as notificações como lidas no servidor:", error);
    }
  };
  const handleViewDetails = (notif) => {
    if (notif.appointmentData) {
      navigation.navigate('DetalhesConsulta', { appointment: notif.appointmentData });
    } else {
      Alert.alert('Notificação', 'Mais detalhes não estão disponíveis.');
    }
  };

  const NotificationCard = ({ notif }) => {
    const typeInfo = NOTIFICATION_TYPES[notif.type] || { icon: 'info', color: '#6c757d' };
    
    const actionButtons = !notif.isRead ? (
      <TouchableOpacity onPress={() => handleMarkAsRead(notif.id)} style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Marcar como Lida</Text>
      </TouchableOpacity>
    ) : null;

    return (
      <View style={[styles.card, notif.isRead && styles.cardRead]}>
        <View style={styles.cardHeader}>
          <Feather name={typeInfo.icon} size={24} color={typeInfo.color} />
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{notif.title}</Text>
            <Text style={styles.cardDate}>{notif.date}</Text>
          </View>
          {!notif.isRead && <View style={styles.unreadIndicator} />}
        </View>
        <Text style={styles.cardMessage}>{notif.message}</Text>
        <View style={styles.cardActions}>
          {actionButtons}
          <TouchableOpacity style={styles.actionButton} onPress={() => handleViewDetails(notif)}>
            <Text style={styles.actionButtonText}>Ver Detalhes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1C74B4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Notificações</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllReadText}>Marcar todas como lidas</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.length > 0 ? (
          notifications.map(notif => <NotificationCard key={notif.id} notif={notif} />)
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome name="bell-o" size={50} color={isDarkMode ? '#555' : '#ccc'} />
            <Text style={styles.emptyStateText}>Nenhuma notificação por enquanto.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getDynamicStyles = (isDarkMode) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: isDarkMode ? '#121212' : '#f0f2f5' },
  container: { padding: 20 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: { fontSize: 28, fontWeight: 'bold', color: isDarkMode ? '#fff' : '#1a1a1a' },
  markAllReadText: {
    fontSize: 12,
    color: '#1C74B4',
    fontWeight: '600',
  },
  card: {
    backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.5 : 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardRead: {
    backgroundColor: isDarkMode ? '#222' : '#f8f9fa',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleContainer: {
    marginLeft: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDarkMode ? '#f5f5f5' : '#333',
  },
  cardDate: {
    fontSize: 12,
    color: isDarkMode ? '#aaa' : '#888',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d9534f',
    marginLeft: 'auto',
  },
  cardMessage: {
    fontSize: 14,
    color: isDarkMode ? '#ccc' : '#555',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: isDarkMode ? '#333' : '#e9ecef',
  },
  actionButtonText: {
    fontSize: 12,
    color: isDarkMode ? '#f5f5f5' : '#495057',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyStateText: {
    marginTop: 15,
    fontSize: 16,
    color: isDarkMode ? '#777' : '#888',
    textAlign: 'center',
  },
});

export default TelaNotificacoesCliente;
