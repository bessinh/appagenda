import express from 'express';
import Consulta from '../models/Consulta.js';
import autenticar from '../middlewares/autenticacao.js';
import notificationService from '../services/notificationService.js';

const router = express.Router();

// Dentista libera novo horário
router.post("/liberar", autenticar('prestador'), async (req, res) => {
  try {
    const { data, horario } = req.body;
    
    const horarioExistente = await Consulta.findOne({
      dentista: req.userId,
      data,
      horario
    });
    
    if (horarioExistente) {
      return res.status(400).json({ erro: "Horário já cadastrado" });
    }

    const novaConsulta = new Consulta({
      dentista: req.userId,
      data,
      horario,
      status: 'disponivel'
    });

    await novaConsulta.save();
    res.status(201).json(novaConsulta);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Listar horários disponíveis (público)
router.get("/disponiveis", async (req, res) => {
  try {
    const { dentista, data } = req.query;
    const filtro = { status: 'disponivel' };
    
    if (dentista) filtro.dentista = dentista;
    if (data) filtro.data = data;
    
    const horarios = await Consulta.find(filtro)
      .populate('dentista', 'nome perfil')
      .sort({ data: 1, horario: 1 });
      
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar horários" });
  }
});

// Paciente agenda horário
router.patch("/agendar/:id", autenticar('paciente'), async (req, res) => {
  try {
    const consulta = await Consulta.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'disponivel'
      },
      {
        paciente: req.userId,
        status: 'agendado'
      },
      { new: true }
    ).populate('dentista', 'nome perfil');
    
    if (!consulta) {
      return res.status(404).json({ erro: "Horário não disponível" });
    }
    
    res.json(consulta);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
});

// Listar consultas do usuário
router.get("/minhas", autenticar(), async (req, res) => {
  try {
    const filtro = req.userType === 'prestador' 
      ? { dentista: req.userId } 
      : { paciente: req.userId };
    
    const consultas = await Consulta.find(filtro)
      .populate(req.userType === 'prestador' ? 'paciente' : 'dentista', 'nome email perfil')
      .sort({ data: -1, horario: -1 });
      
    res.json(consultas);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar consultas" });
  }
});

// Cancelar consulta
router.patch("/cancelar/:id", autenticar(), async (req, res) => {
  try {
    const { motivo } = req.body;

    const consulta = await Consulta.findById(req.params.id)
      .populate('dentista', 'nome')
      .populate('paciente', 'expoPushToken nome');

    if (!consulta) {
      return res.status(404).json({ erro: "Consulta não encontrada" });
    }

    const isPaciente = consulta.paciente?._id.toString() === req.userId;
    const isDentista = consulta.dentista._id.toString() === req.userId;

    if (!isPaciente && !isDentista) {
      return res.status(403).json({ erro: "Você não tem permissão para cancelar esta consulta." });
    }

    if (consulta.status !== 'agendado') {
      return res.status(400).json({ erro: "Apenas consultas agendadas podem ser canceladas." });
    }

    // Lógica de cancelamento diferenciada
    if (isDentista) {
      // Dentista cancelando: notifica paciente e marca como 'cancelado'
      if (consulta.paciente?.expoPushToken) {
        const dataFormatada = new Date(consulta.data.split('T')[0]).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const mensagem = `Sua consulta com ${consulta.dentista.nome} em ${dataFormatada} às ${consulta.horario} foi cancelada pelo profissional.`;
        
        await notificationService.sendPushNotification(
          consulta.paciente.expoPushToken,
          'Consulta Cancelada',
          mensagem,
          { consultaId: consulta._id }
        );
      }
      consulta.status = 'cancelado';
      consulta.motivoCancelamento = motivo || 'Cancelado pelo dentista';

    } else if (isPaciente) {
      // Paciente cancelando: reseta o horário para 'disponível'
      consulta.status = 'disponivel';
      consulta.paciente = null;
      consulta.motivoCancelamento = motivo || 'Cancelado pelo paciente';
      consulta.lembreteEnviado = false;
    }

    await consulta.save();
    
    res.json({ mensagem: "Consulta cancelada com sucesso", consulta });
  } catch (error) {
    console.error("Erro ao cancelar consulta:", error);
    res.status(400).json({ erro: "Erro ao processar o cancelamento." });
  }
});

// Dentista remove horário disponível
router.delete("/disponivel/:id", autenticar('prestador'), async (req, res) => {
  try {
    const consulta = await Consulta.findOneAndDelete({
      _id: req.params.id,
      dentista: req.userId,
      status: 'disponivel'
    });

    if (!consulta) {
      return res.status(404).json({ erro: "Horário disponível não encontrado ou você não tem permissão para removê-lo." });
    }

    res.json({ mensagem: "Horário disponível removido com sucesso." });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao remover horário disponível." });
  }
});

export default router;