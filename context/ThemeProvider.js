import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState(systemScheme);

    useEffect(() => {
        const loadThemePreference = async () => {
            const savedTheme = await AsyncStorage.getItem('themePreference');
            if (savedTheme) {
                setTheme(savedTheme);
            }
        };
        loadThemePreference();
    }, []);

    const setAndSaveTheme = async (newTheme) => {
        setTheme(newTheme);
        await AsyncStorage.setItem('themePreference', newTheme);
    };

    const effectiveTheme = theme === 'auto' ? systemScheme : theme;

    return (
        <ThemeContext.Provider value={{ theme: effectiveTheme, setTheme: setAndSaveTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useThemeContext = () => useContext(ThemeContext);