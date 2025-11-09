import mongoose from 'mongoose';

const ClinicaLocalizacaoSchema = new mongoose.Schema({
    dentistaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    endereco: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});

export default mongoose.model('ClinicaLocalizacao', ClinicaLocalizacaoSchema);