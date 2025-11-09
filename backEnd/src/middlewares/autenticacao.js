import jwt from 'jsonwebtoken';

const autenticar = (tipoRequerido) => (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
        }

        const SECRET_KEY = process.env.SECRET_KEY;
        if (!SECRET_KEY) {
            console.error("SECRET_KEY não definida no ambiente.");
            return res.status(500).json({ erro: 'Configuração inválida do servidor.' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id;
        req.userType = decoded.tipo;

        if (tipoRequerido && decoded.tipo !== tipoRequerido) {
            return res.status(403).json({ erro: 'Acesso restrito. Permissões insuficientes.' });
        }

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ erro: 'Token inválido ou expirado.' });
        }
        console.error("Erro inesperado na autenticação:", error);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};

export default autenticar;
