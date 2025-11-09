import axios from 'axios';

// -----------------------------------------------------------------
// IMPORTANTE: Ajuste este IP para o endereço da máquina onde o 
// backend (servidor) está rodando na sua rede local.
// Para descobrir o IP no Windows, abra o CMD e digite `ipconfig`.
// Procure por "Endereço IPv4".
// -----------------------------------------------------------------
const BASE_URL = 'https://appagenda-0fat.onrender.com'; 

let authToken = null;

export function setToken(token) {
  authToken = token;
}

export function clearToken() {
  authToken = null;
}

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// --- NOVAS FUNÇÕES DE AUTH ---
export function login(credentials) { // credentials = { email, senha }
  return api.post('/api/auth/login', credentials);
}

export function register(userData) {
  return api.post('/api/auth/cadastro', userData);
}

export function listarPrestadores() {
  return api.get('/api/auth/prestadores');
}

export function listarHorariosDisponiveis(dentistaId) {
  return api.get(`/api/consultas/disponiveis?dentista=${dentistaId}`);
}

export function agendarConsulta(consultaId) {
  return api.patch(`/api/consultas/agendar/${consultaId}`);
}

export function cancelarConsulta(consultaId, motivo) {
  return api.patch(`/api/consultas/cancelar/${consultaId}`, { motivo });
}
// --- FIM DAS NOVAS FUNÇÕES ---

// Endpoints do prestador (dentista)
export function listarHorariosDentista() {
  return api.get('/api/consultas/minhas');
}

export function liberarHorario({ data, horario }) {
  return api.post('/api/consultas/liberar', { data, horario });
}

export function removerHorarioDisponivel(id) {
  return api.delete(`/api/consultas/disponivel/${id}`);
}

// Auth helpers
export function getMe() {
  return api.get('/api/auth/me');
}

export function updateMe(payload) {
  return api.put('/api/auth/me', payload);
}

// Consultas do usuário (dentista/paciente)
export function listarMinhasConsultas() {
  return api.get('/api/consultas/minhas');
}

export function getHelpContent() {
  return api.get('/api/configuracoes/ajuda');
}

// Funções de Recuperação de Senha
export function solicitarCodigoRecuperacao(email) {
  return api.post('/api/auth/recuperar-senha', { email });
}

export function verificarCodigoRecuperacao(email, code) {
  return api.post('/api/auth/verificar-codigo', { email, code });
}

export function redefinirSenha(token, novaSenha) {
  return api.post('/api/auth/redefinir-senha', { token, novaSenha });
}

// --- NOVAS FUNÇÕES ---

export function deleteMe() {
  return api.delete('/api/auth/me');
}

export function markNotificationsAsRead(ids) {
  return api.post('/api/auth/notifications/mark-read', { ids });
}




export default api;

