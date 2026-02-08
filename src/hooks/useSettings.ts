import { useState, useEffect } from 'react';

export const useSettings = () => {
    const [apiKey, setApiKey] = useState('');
    // Por defecto usamos el 2.0 Flash (estable)
    const [model, setModel] = useState('gemini-2.0-flash');

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        const storedModel = localStorage.getItem('gemini_model');
        if (storedKey) setApiKey(storedKey);
        if (storedModel) setModel(storedModel);
    }, []);

    const saveSettings = (key: string, newModel: string) => {
        localStorage.setItem('gemini_api_key', key);
        localStorage.setItem('gemini_model', newModel);
        setApiKey(key);
        setModel(newModel);
    };

    return { apiKey, model, saveSettings };
};
