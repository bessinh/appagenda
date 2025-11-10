// src/components/BackgroundWrapper.js
import React from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // Importe seu contexto de tema

// Importa a imagem de fundo
const backgroundImage = require('../../../assets/papel.png'); 

const BackgroundWrapper = ({ children, style }) => {
    const { isDarkMode } = useTheme();

    // Estilos dinâmicos para se adaptar ao tema escuro
    const overlayColor = isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.5)'; // Overlay mais escuro no modo escuro, mais claro no modo claro

    return (
        <ImageBackground source={backgroundImage} style={[styles.background, style]}>
            {/* Um overlay para garantir que o texto seja legível em cima da imagem, 
                ajustando a intensidade conforme o tema */}
            <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
                {children}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // Garante que a imagem cubra toda a área
    },
    overlay: {
        flex: 1,
        // O backgroundColor será definido dinamicamente no componente
        // Ele ajuda a imagem de fundo a não competir com o conteúdo,
        // especialmente importante para acessibilidade do texto.
    },
});

export default BackgroundWrapper;