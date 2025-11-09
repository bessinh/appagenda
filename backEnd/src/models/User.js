import mongoose from "mongoose";

// Define o schema do usuário, agora com todos os campos do cadastro
const UserSchema = new mongoose.Schema({
    nome: String, // Nome do usuário
    email: {
        type: String,
        unique: true, // Garante que o email seja único no banco
        required: true // Torna o campo obrigatório
    }, // Email único do usuário
    senha: {
        type: String,
        required: true // Torna o campo obrigatório
    }, // Senha do usuário (deve ser salva criptografada)
    tipoConta: {
        type: String,
        enum: ['paciente', 'prestador'], // Define os valores possíveis para o tipo de conta
        required: true // Torna o campo obrigatório
    }, // Tipo de conta do usuário (paciente ou prestador)
    documento: String, // CPF ou CNPJ
    telefone: String, // Telefone de contato
    endereco: {
        cep: String, // CEP
        logradouro: String, // Logradouro
        numero: String, // Número
        bairro: String, // Bairro
        cidade: String, // Cidade
        estado: String // Estado
    },
    perfil: {
        especialidades: { type: [String], default: [] },
        servicos: {
            type: [
                new mongoose.Schema({
                    nome: String,
                    tempoEstimado: String,
                    descricao: String
                }, { _id: false })
            ],
            default: []
        },
        destaque: {
            type: [
                new mongoose.Schema({
                    titulo: String,
                    descricao: String,
                    link: String
                }, { _id: false })
            ],
            default: []
        },
        configuracoes: {
            lembretesEnabled: { type: Boolean, default: true },
            promocoesEnabled: { type: Boolean, default: true },
            temaEscuro: { type: Boolean, default: false }
        }
    },
    expoPushToken: { type: String },
    readNotificationIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

// Exporta o modelo User para ser usado em outros arquivos
export default mongoose.model("User", UserSchema);