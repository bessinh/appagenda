import mongoose from "mongoose"; // Importa o mongoose

// Define o schema para horários disponíveis do dentista
const HorarioDisponivelSchema = new mongoose.Schema({
    dentistaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Referência ao model User
        required: true
    },
    data: {
        type: String,
        required: true
    }, // Data do horário disponível (string)
    hora: {
        type: String,
        required: true
    } // Hora do horário disponível (string)
});

// Exporta o modelo HorarioDisponivel para ser usado em outros arquivos
export default mongoose.model("HorarioDisponivel", HorarioDisponivelSchema);