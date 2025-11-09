import mongoose from "mongoose";

const mongoURI = process.env.MONGO_URI;

export async function connectDatabase() {
    if (!mongoURI) {
        console.error("🔴 Variável de ambiente MONGO_URI não definida!");
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoURI);
        console.log("🟢 Banco de dados conectado!");
    } catch (err) {
        console.error("🔴 Erro ao conectar ao banco:", err);
        process.exit(1);
    }
}

export default mongoose;