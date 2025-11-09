
import axios from 'axios';

// Função para enviar uma única notificação push via Expo
async function sendPushNotification(expoPushToken, title, body, data) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });
    console.log(`Notificação enviada para ${expoPushToken}`);
  } catch (error) {
    console.error(`Erro ao enviar notificação para ${expoPushToken}:`, error.response?.data || error.message);
  }
}

export default { sendPushNotification };
