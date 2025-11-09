
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe, updateMe } from '../api/client';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            setIsLoading(true);
            try {
                const response = await getMe();
                const configuracoes = response.data?.perfil?.configuracoes;
                if (configuracoes) {
                    setIsDarkMode(configuracoes.temaEscuro || false);
                }
            } catch (error) {
                // Silencia o erro para casos onde o usuário não está logado ainda.
                // console.error("Falha ao carregar o tema do usuário.", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newIsDarkMode = !isDarkMode;
        setIsDarkMode(newIsDarkMode);
        try {
            await updateMe({ 'perfil.configuracoes.temaEscuro': newIsDarkMode });
        } catch (error) {
            console.error("Falha ao salvar a preferência de tema.", error);
            // Reverte em caso de erro
            setIsDarkMode(!newIsDarkMode);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isLoadingTheme: isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
