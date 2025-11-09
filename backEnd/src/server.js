import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rotasConsultas from './rotas/consultas.js';
import rotasAuth from './rotas/auth.js';
import rotasConfiguracao from './rotas/configuracao.js';
import clinicaLocalizacaoRoutes from './rotas/clinicaLocalizacao.js';
import reminderJob from './jobs/reminderJob.js';

const aplicativo = express();
const PORTA = process.env.PORTA || 3000;

// Configuração CORS dinâmica
const origensPermitidas = [
  'http://localhost:19006',
  'exp://192.168.0.102:19000',
  'http://192.168.0.102:19006',
  'http://localhost:8081'
];

aplicativo.use(cors({
  origin: (origin, callback) => {
    // Permite qualquer origem se não estiver em produção
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Em produção, só permite origens da lista
    if (!origin || origensPermitidas.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true
}));

aplicativo.use(express.json());
aplicativo.use(express.urlencoded({ extended: true }));

// Rotas
aplicativo.use('/api/auth', rotasAuth);
aplicativo.use('/api/consultas', rotasConsultas);
aplicativo.use('/api/configuracoes', rotasConfiguracao);
aplicativo.use('/api/clinica-localizacao', clinicaLocalizacaoRoutes);

// Verificação de Saúde
aplicativo.get('/saude', (req, res) => res.send('OK'));

// Tratamento de erros
aplicativo.use((erro, req, res, proximo) => {
  console.error(erro.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado ao MongoDB');
    aplicativo.listen(PORTA, () => {
      console.log(`Servidor rodando na porta ${PORTA}`);
      reminderJob.start(); // Inicia a tarefa agendada de lembretes
    });
  })
  .catch(erro => {
    console.error('Erro ao conectar ao MongoDB:', erro);
    process.exit(1);
  });