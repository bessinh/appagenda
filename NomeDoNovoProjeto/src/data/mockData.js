// src/data/mockData.js

// Aqui ficarão todos os nossos dados simulados do aplicativo.
// Esta é nossa "fonte única da verdade".

export const DADOS_PROFISSIONAIS = {
  '1': {
    name: 'Dr. Lucas Costa',
    specialty: 'Clínico Geral',
    schedule: {
      '2025-09-22': ['09:00', '11:00', '14:00'],
      '2025-09-23': ['10:00', '12:00', '16:00'],
    }
  },
  '2': {
    name: 'Dra. Ana Lima',
    specialty: 'Ortodontista',
    schedule: {
      '2025-09-22': ['09:30', '11:30', '15:00'],
      '2025-09-24': ['10:30', '14:30'],
    }
  },
  '3': {
    name: 'Dr. Carlos Andrade',
    specialty: 'Cardiologista',
    schedule: {
      '2025-09-25': ['08:00', '10:00'],
      '2025-09-26': ['13:00', '15:00', '17:00'],
    }
  },
  '4': {
    name: 'Dra. Beatriz Ferraz',
    specialty: 'Dermatologista',
    schedule: {
      '2025-09-22': ['13:00', '13:30', '16:30'],
      '2025-09-25': ['09:00', '11:30'],
    }
  },
  '5': {
    name: 'Dr. Ricardo Mendes',
    specialty: 'Endodontista',
    schedule: {
      '2025-09-23': ['14:00', '16:00'],
      '2025-09-26': ['09:00', '11:00'],
    }
  },
  '6': {
    name: 'Dra. Juliana Ribeiro',
    specialty: 'Odontopediatra',
    schedule: {
      '2025-09-24': ['08:30', '10:30', '11:30'],
      '2025-09-25': ['14:00', '15:00', '16:00'],
    }
  }
};

export const AGENDAMENTOS_MARCADOS = {
  '1': [ // Agendamentos do Dr. Lucas Costa (ID 1)
    { date: '2025-09-22', time: '09:00', patientName: 'Maria Silva', service: 'Consulta de Rotina' },
    { date: '2025-09-23', time: '12:00', patientName: 'João Ferreira', service: 'Limpeza' },
  ],
  '2': [ // Agendamentos da Dra. Ana Lima (ID 2)
    { date: '2025-09-22', time: '11:30', patientName: 'Carla Souza', service: 'Aparelho' },
    { date: '2025-09-24', time: '14:30', patientName: 'Roberto Dias', service: 'Clareamento' },
  ],
}; // <-- CORREÇÃO: O objeto precisava ser fechado com '};' aqui.

// Criamos e exportamos a lista formatada para ser usada nas telas
export const LISTA_PROFISSIONAIS = Object.keys(DADOS_PROFISSIONAIS).map(id => ({
  id,
  ...DADOS_PROFISSIONAIS[id]
}));