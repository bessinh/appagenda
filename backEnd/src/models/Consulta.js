import mongoose from 'mongoose';

const ConsultaSchema = new mongoose.Schema({
    dentista: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia o modelo User, já que dentistas são usuários
        required: true,
    },
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Pode ser nulo quando o horário está apenas disponível
    },
    data: {
        type: String, // O app parece usar strings 'YYYY-MM-DD'
        required: true,
    },
    horario: {
        type: String, // Ex: "09:00"
        required: true,
    },
    status: {
        type: String,
        enum: ['disponivel', 'agendado', 'cancelado'],
        default: 'disponivel',
    },
    lembreteEnviado: {
        type: Boolean,
        default: false,
    },
    motivoCancelamento: {
        type: String,
        default: null,
    }
}, { timestamps: true }); // Adiciona campos createdAt e updatedAt automaticamente

export default mongoose.model('Consulta', ConsultaSchema);
