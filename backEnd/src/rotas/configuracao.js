import express from 'express';

const router = express.Router();

const DADOS_AJUDA = {
  contato: {
    telefone: '+5511999999999',
    email: 'suporte@suaclinica.com',
    whatsapp: '5511988888888',
  },
  faq: [
    {
      question: 'Como eu agendo uma nova consulta?',
      answer: 'Você pode agendar de duas formas: clicando no botão "Agendar Agora" na tela inicial para ver todos os profissionais, ou usando a aba "Buscar" para encontrar um profissional por localização e depois agendar.'
    },
    {
      question: 'Como posso cancelar ou reagendar um agendamento?',
      answer: 'Na tela inicial, clique na sua próxima consulta para ver os detalhes. Lá você encontrará a opção para cancelar. Para reagendar, recomendamos cancelar a consulta atual e realizar um novo agendamento.'
    },
    {
      question: 'Meus dados pessoais estão seguros?',
      answer: 'Sim. Seus dados são armazenados de forma segura e criptografada. Nós respeitamos sua privacidade e não compartilhamos suas informações com terceiros.'
    },
  ],
  motivosCancelamento: [
    'Conflito de agenda',
    'Não preciso mais da consulta',
    'Encontrei outro profissional/horário',
    'Motivos pessoais',
    'Outro',
  ],
};

// Rota para buscar todas as configurações de ajuda
router.get('/ajuda', (req, res) => {
  res.json(DADOS_AJUDA);
});

export default router;
