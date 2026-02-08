export interface RhymeSuggestions {
    rhymes: string[];
    related: string[];
}

export const generateRhymes = async (word: string, apiKey: string): Promise<RhymeSuggestions> => {
    if (!apiKey) {
        throw new Error('API Key no configurada');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `
    Generate a JSON object with Spanish rhymes and related words for the word "${word}".
    The output must receive this schema:
    {
      "rhymes": ["string"], // 10-15 rhyming words in Spanish
      "related": ["string"] // 5-10 synonyms, related concepts or contextually relevant words
    }
    Strictly return JSON only. No markdown formatting.
  `;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API Error:', errorData);
        throw new Error(errorData.error?.message || 'Error al conectar con Gemini');
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
        throw new Error('Respuesta inválida de Gemini');
    }

    try {
        // Clean markdown code blocks if present
        const jsonStr = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error parsing Gemini response:', textResponse);
        throw new Error('Error al procesar la respuesta de la IA');
    }
};
