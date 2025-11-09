import express from 'express';
import ClinicaLocalizacao from '../models/ClinicaLocalizacao.js';

const router = express.Router();

router.get('/proximas', async (req, res) => {
    const { latitude, longitude, distancia = 5 } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ erro: 'Latitude e longitude são obrigatórios.' });
    }

    const raio = distancia / 111;

    try {
        const clinicas = await ClinicaLocalizacao.find({
            latitude: { $gte: latitude - raio, $lte: latitude + raio },
            longitude: { $gte: longitude - raio, $lte: longitude + raio }
        });
        res.json(clinicas);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar clínicas próximas.' });
    }
});

export default router;