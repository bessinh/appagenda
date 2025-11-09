import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

        if (!token) {
            return res.status(403).json({ 
                success: false,
                message: 'Acesso negado. Token não fornecido.' 
            });
        }

        const SECRET_KEY = process.env.SECRET_KEY;
        if (!SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message: 'Configuração inválida do servidor'
            });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id;
        req.userType = decoded.tipo;

        // Se a rota exigir dentista, verifique tipo
        if (req.path.includes('/dentista') && decoded.tipo !== 'prestador') {
            return res.status(403).json({
                success: false,
                message: 'Acesso restrito a dentistas'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido ou expirado'
        });
    }
};