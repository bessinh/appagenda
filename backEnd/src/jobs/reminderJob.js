// Forçando a recarga do arquivo
import cron from 'node-cron';
import Consulta from '../models/Consulta.js';
import notificationService from '../services/notificationService.js';

// Agenda a tarefa para rodar a cada hora
const start = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Verificando lembretes de consulta para enviar...');

    const agora = new Date();
    const limite = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // 24 horas a partir de agora

    try {
      const consultas = await Consulta.find({
        status: 'agendado',
        data: { $gte: agora.toISOString().split('T')[0] }, // A partir de hoje
        lembreteEnviado: false,
      }).populate('paciente dentista');

      for (const consulta of consultas) {
        const dataConsulta = new Date(`${consulta.data}T${consulta.horario}:00`);

        // Verifica se a consulta está dentro da janela de 24h
        if (dataConsulta >= agora && dataConsulta <= limite) {
          // Envia notificação para o paciente, se ele tiver token e a configuração ativada
          if (consulta.paciente?.expoPushToken && consulta.paciente.perfil?.configuracoes?.lembretesEnabled) {
            await notificationService.sendPushNotification(
              consulta.paciente.expoPushToken,
              'Lembrete de Consulta',
              `Sua consulta com ${consulta.dentista.nome} é amanhã às ${consulta.horario}!`,
              { consultaId: consulta._id }
            );
          }

          // Atualiza a consulta para marcar que o lembrete foi enviado
          await Consulta.updateOne({ _id: consulta._id }, { lembreteEnviado: true });
        }
      }
    } catch (error) {
      console.error('Erro no job de lembretes:', error);
    }
  });

  console.log('✅ Job de lembretes de consulta agendado.');
};

export default { start };