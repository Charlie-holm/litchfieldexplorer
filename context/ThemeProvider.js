import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const systemScheme = useColorScheme();
    const [rawTheme, setRawTheme] = useState('auto');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadThemePreference = async () => {
            const savedTheme = await AsyncStorage.getItem('themePreference');
            if (savedTheme) {
                setRawTheme(savedTheme);
            }
            setIsLoaded(true);
        };
        loadThemePreference();
    }, []);

    const setAndSaveTheme = async (newTheme) => {
        setRawTheme(newTheme);
        await AsyncStorage.setItem('themePreference', newTheme);
    };

    const effectiveTheme = rawTheme === 'auto' ? systemScheme : rawTheme;

    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{
            theme: effectiveTheme,
            setTheme: setAndSaveTheme,
            savedTheme: rawTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useThemeContext = () => useContext(ThemeContext);