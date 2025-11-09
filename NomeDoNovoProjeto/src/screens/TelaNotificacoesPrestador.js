import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listarMinhasConsultas } from '../api/client';

// Utilitário para formatar data legível
function formatarDataHora(dateStr, horaStr) {
  try {
    // data pode vir como ISO ou yyyy-mm-dd
    const base = dateStr.includes('T') ? new Date(dateStr) : new Date(`${dateStr}T${(horaStr||'00:00')}:00`);
    return base.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return `${dateStr} ${horaStr || ''}`.trim();
  }
}

const NOTIFICATION_TYPES = {
  agendamento: { icon: 'calendar', color: '#28a745' },
  cancelamento: { icon: 'x-circle', color: '#d9534f' },
  lembrete: { icon: 'bell', color: '#ffc107' },
  mensagem: { icon: 'message-circle', color: '#1C74B4' },
};

const TelaNotificacoesPrestador = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  useEffect(() => {
    navigation.setOptions({
      tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
    });
  }, [navigation, unreadCount]);

  // Buscar notificações reais a partir das consultas do usuário (dentista)
  useEffect(() => {
    (async () => {
      try {
        const resp = await listarMinhasConsultas();
        const itens = (resp.data || []).map(c => {
          const dtLegivel = formatarDataHora(c.data, c.horario || c.hora);
          const timestamp = c.data ? new Date(c.data) : new Date();
          // Tipo simplificado: 'agendamento' para consultas futuras, 'lembrete' para próximas 24h
          let type = 'agendamento';
          try {
            const agora = new Date();
            const alvo = c.data ? new Date(`${c.data}T${(c.horario||c.hora||'00:00')}:00`) : new Date();
            const diffMs = alvo.getTime() - agora.getTime();
            if (diffMs > 0 && diffMs <= 24*60*60*1000) type = 'lembrete';
          } catch {}
          return {
            id: c._id,
            type,
            title: type === 'lembrete' ? 'Lembrete de consulta' : 'Nova consulta agendada',
            message: `Data/Hora: ${dtLegivel}`,
            date: dtLegivel,
            timestamp,
            isRead: false,
          };
        }).sort((a,b) => b.timestamp - a.timestamp);
        setNotifications(itens);
      } catch {
        setNotifications([]);
      }
    })();
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };
  
  // MELHORIA: Função para marcar todas as notificações como lidas
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  // MELHORIA: Função para o botão "Ver Detalhes"
  const handleViewDetails = (notif) => {
    switch (notif.type) {
      case 'agendamento':
      case 'cancelamento':
      case 'lembrete':
        navigation.navigate('Minha Agenda');
        break;
      case 'mensagem':
        Alert.alert('Nova Mensagem', 'Navegando para a tela de chat...');
        // navigation.navigate('Chat', { chatId: notif.chatId });
        break;
      default:
        Alert.alert('Notificação', 'Mais detalhes não estão disponíveis.');
    }
  };

  const NotificationCard = ({ notif }) => {
    const typeInfo = NOTIFICATION_TYPES[notif.type] || { icon: 'info', color: '#6c757d' };
    
    // CORREÇÃO: A lógica condicional para os botões é feita aqui para maior clareza
    const actionButtons = notif.isRead ? null : (
      <TouchableOpacity onPress={() => handleMarkAsRead(notif.id)} style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Marcar como Lida</Text>
      </TouchableOpacity>
    );

    return (
      <View style={[styles.card, notif.isRead ? styles.cardRead : null]}>
        <View style={styles.cardHeader}>
          <Feather name={typeInfo.icon} size={24} color={typeInfo.color} />
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{notif.title}</Text>
            <Text style={styles.cardDate}>{notif.date}</Text>
          </View>
          {/* Usando ternário para ser explícito e evitar o erro */}
          {notif.isRead ? null : <View style={styles.unreadIndicator} />}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Notificações</Text>
          {/* MELHORIA: Botão para marcar todas como lidas */}
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
            <FontAwesome name="bell-o" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>Nenhuma notificação por enquanto.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  container: { padding: 20 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  markAllReadText: {
    fontSize: 12,
    color: '#1C74B4',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardRead: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
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
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
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
    color: '#555',
    marginBottom: 15,
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
    backgroundColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#495057',
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
    color: '#888',
    textAlign: 'center',
  },
});

export default TelaNotificacoesPrestador;