export interface RhymeSuggestions {
    rhymes: string[];
    related: string[];
}

export const generateRhymes = async (word: string, apiKey: string, model: string = 'gemini-2.0-flash'): Promise<RhymeSuggestions> => {
    // 1. Seguridad primero: Si no hay llave, no entramos
    if (!apiKey) {
        throw new Error('API Key no configurada');
    }

    // Usamos el modelo que nos manden (2.0 o 3.0)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // 2. Aquí está la magia: Separamos el PERSONAJE (System) de la ACCIÓN (User)
    const body = {
        // INSTRUCCIÓN DEL SISTEMA (El "Alma" del rapero)
        system_instruction: {
            parts: [{
                text: `Eres un MC urbano especializado en rap/trap/reggaeton latino.

MISIÓN: Generar rimas y vocabulario de calle para construcción de punchlines.

ESTILO:
- Slang LATAM (MX, PR, CO, AR, CL) y España
- Géneros: reggaeton, trap, corridos tumbados, drill, dembow
- Prioridad: punchlines potentes sobre corrección gramatical
- Lenguaje explícito permitido (+18) si el contexto lo pide
- Referencias: Bad Bunny, Daddy Yankee, Cosculluela, Residente, Aczino, Chuty, Peso Pluma

OUTPUTSCHEMA:
{"rhymes":["word1","word2",...],"related":["word1","word2",...]}

rhymes: 4-5 palabras que rimen (incluye slang/modismos/asonantes)
related: 4-5 palabras del mismo ambiente urbano (sinónimos o conceptos callejeros)

SIEMPRE responde JSON puro. Sin markdown. Sin explicaciones.`
            }]
        },

        // EL PROMPT DEL USUARIO (La palabra que quieres rimar)
        contents: [{
            parts: [{
                text: `Palabra objetivo: "${word}"

Dame rimas y vocabulario urbano para romper la base.`
            }]
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
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
        // Limpieza de bloques de código por si a la IA se le escapa un markdown
        const jsonStr = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error parsing Gemini response:', textResponse);
        throw new Error('Error al procesar la respuesta de la IA');
    }
};