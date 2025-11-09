import express from 'express'; // Importa o express
import bcrypt from 'bcryptjs'; // Importa o bcrypt para criptografar senhas
import jwt from 'jsonwebtoken'; // Importa o JWT para autenticação
import User from '../models/User.js'; // Importa o modelo User
import Consulta from '../models/Consulta.js'; // Importa o modelo Consulta
import autenticar from '../middlewares/autenticacao.js'; // Importa o middleware de autenticação

const router = express.Router();

// 📌 Cadastro de usuário
router.post("/cadastro", async (req, res) => {
    try {
        const {
            nome,
            email,
            senha,
            tipoConta,
            documento,
            telefone,
            endereco // { cep, logradouro, numero, bairro, cidade, estado }
        } = req.body;

        // Verifica se o email já existe
        const existe = await User.findOne({ email });
        if (existe) {
            return res.status(400).json({ mensagem: "Email já cadastrado!" });
        }

        // Criptografa a senha antes de salvar
        const senhaHash = await bcrypt.hash(senha, 10);

        // Cria novo usuário com todos os dados
        const user = new User({
            nome,
            email,
            senha: senhaHash,
            tipoConta,
            documento,
            telefone,
            endereco
        });
        await user.save();

        res.json({ mensagem: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        console.log('Erro ao cadastrar:', err); // Adicione esta linha
        res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
});

// 📌 Login
router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body; // Recebe email e senha do corpo

        if (!email || !senha) {
            return res.status(400).json({ erro: "Email e senha são obrigatórios" });
        }

        const SECRET_KEY = process.env.SECRET_KEY;
        if (!SECRET_KEY) {
            return res.status(500).json({ erro: "Configuração inválida do servidor" });
        }

        // Busca usuário pelo email
        const user = await User.findOne({ email });
        // Verifica se usuário existe e se a senha está correta
        const senhaCorreta = user ? await bcrypt.compare(senha, user.senha) : false;
        if (!user || !senhaCorreta) {
            return res.status(401).json({ erro: "Email ou senha inválidos" });
        }

        // Gera token JWT com informações essenciais
        const token = jwt.sign({ id: user._id, tipo: user.tipoConta, nome: user.nome, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token }); // Retorna o token
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ erro: "Erro ao realizar login" });
    }
});

// 📌 Perfil do usuário autenticado
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
        if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

        const SECRET_KEY = process.env.SECRET_KEY;
        if (!SECRET_KEY) return res.status(500).json({ erro: 'Configuração inválida do servidor' });

        const decoded = jwt.verify(token, SECRET_KEY);
        const user = await User.findById(decoded.id).select('nome email tipoConta perfil telefone endereco');
        if (!user) return res.status(404).json({ erro: 'Usuário não encontrado' });

        res.json({ id: user._id, nome: user.nome, email: user.email, tipo: user.tipoConta, perfil: user.perfil, telefone: user.telefone, endereco: user.endereco });
    } catch (err) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
});

// Atualizar perfil do usuário autenticado
router.put('/me', async (req, res) => {
    try {
        console.log("Backend /me payload:", req.body);
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
        if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

        const SECRET_KEY = process.env.SECRET_KEY;
        if (!SECRET_KEY) return res.status(500).json({ erro: 'Configuração inválida do servidor' });

        const decoded = jwt.verify(token, SECRET_KEY);

        // Use $set para garantir que apenas os campos no corpo da requisição sejam atualizados
        const user = await User.findByIdAndUpdate(
            decoded.id,
            { $set: req.body },
            { new: true }
        ).select('nome email tipoConta perfil');

        if (!user) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        res.json({ id: user._id, nome: user.nome, email: user.email, tipo: user.tipoConta, perfil: user.perfil });
    } catch (err) {
        console.error("Erro ao atualizar perfil:", err);
        return res.status(400).json({ erro: 'Não foi possível atualizar o perfil' });
    }
});

// Rota para listar todos os prestadores
router.get("/prestadores", async (req, res) => {
    try {
                const prestadores = await User.find({ tipoConta: 'prestador' }).select('nome email perfil endereco');
        res.json(prestadores);
    } catch (err) {
        console.error('Erro ao buscar prestadores:', err);
        res.status(500).json({ mensagem: "Erro ao buscar prestadores." });
    }
});

// Rota para solicitar recuperação de senha
router.post("/recuperar-senha", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Gera código de 6 dígitos
        console.log(`Código de recuperação para ${email}: ${resetCode}`); // Simula o envio

        user.resetPasswordToken = await bcrypt.hash(resetCode, 10);
        user.resetPasswordExpires = Date.now() + 600000; // Expira em 10 minutos

        await user.save();

        res.json({ mensagem: `Código de recuperação enviado para ${email}` });
    } catch (err) {
        console.error('Erro ao solicitar recuperação de senha:', err);
        res.status(500).json({ mensagem: "Erro no servidor." });
    }
});

// Rota para verificar o código de recuperação
router.post("/verificar-codigo", async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user || !user.resetPasswordToken) {
            return res.status(400).json({ mensagem: "Código inválido ou expirado." });
        }

        const isMatch = await bcrypt.compare(code, user.resetPasswordToken);
        if (!isMatch) {
            return res.status(400).json({ mensagem: "Código incorreto." });
        }

        // Gera um token temporário para permitir a redefinição da senha
        const tempToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '5m' });

        res.json({ mensagem: "Código verificado com sucesso.", tempToken });

    } catch (err) {
        console.error('Erro ao verificar código:', err);
        res.status(500).json({ mensagem: "Erro no servidor." });
    }
});

// Rota para redefinir a senha
router.post("/redefinir-senha", async (req, res) => {
    try {
        const { token, novaSenha } = req.body;
        if (!token || !novaSenha) {
            return res.status(400).json({ mensagem: "Token e nova senha são obrigatórios." });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ mensagem: "Usuário não encontrado ou token inválido." });
        }

        user.senha = await bcrypt.hash(novaSenha, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ mensagem: "Senha redefinida com sucesso!" });

    } catch (err) {
        console.error('Erro ao redefinir senha:', err);
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ mensagem: "Token inválido ou expirado." });
        }
        res.status(500).json({ mensagem: "Erro no servidor." });
    }
});

// Rota para marcar notificações como lidas
router.post('/notifications/mark-read', autenticar(), async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ erro: 'O corpo da requisição deve conter um array de IDs.' });
        }

        await User.findByIdAndUpdate(
            req.userId,
            { $addToSet: { readNotificationIds: { $each: ids } } }
        );

        res.status(200).json({ mensagem: 'Notificações marcadas como lidas.' });
    } catch (error) {
        console.error('Erro ao marcar notificações como lidas:', error);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});

// Rota para deletar a conta do usuário
router.delete('/me', autenticar(), async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        if (user.tipoConta === 'prestador') {
            await Consulta.deleteMany({ dentista: userId });
        } else if (user.tipoConta === 'paciente') {
            await Consulta.updateMany(
                { paciente: userId, data: { $gte: new Date().toISOString().split('T')[0] } },
                { $set: { status: 'disponivel', paciente: null, lembreteEnviado: false } }
            );
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ mensagem: 'Conta deletada com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        res.status(500).json({ erro: 'Erro interno do servidor ao deletar a conta.' });
    }
});



export default router; // Exporta as rotas para uso no app principal