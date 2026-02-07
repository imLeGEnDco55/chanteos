/**
 * Cuenta las sílabas en español de un texto
 * Usa reglas básicas de silabeo español
 */
export function countSyllables(text: string): number {
  if (!text || text.trim() === '') return 0;
  
  // Limpiar el texto: solo letras y espacios
  const cleanText = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos para procesamiento
    .replace(/[^a-z\s]/g, '')
    .trim();
  
  if (!cleanText) return 0;
  
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  let totalSyllables = 0;
  
  for (const word of words) {
    totalSyllables += countWordSyllables(word);
  }
  
  return totalSyllables;
}

function countWordSyllables(word: string): number {
  if (!word) return 0;
  
  // Vocales en español
  const vowels = 'aeiou';
  const strongVowels = 'aeo';
  const weakVowels = 'iu';
  
  let syllables = 0;
  let prevWasVowel = false;
  let i = 0;
  
  while (i < word.length) {
    const char = word[i];
    const isVowel = vowels.includes(char);
    
    if (isVowel) {
      if (!prevWasVowel) {
        // Nueva sílaba comienza con vocal
        syllables++;
      } else {
        // Hay dos vocales juntas - verificar si forman diptongo o hiato
        const prevChar = word[i - 1];
        const isHiatus = 
          (strongVowels.includes(prevChar) && strongVowels.includes(char)) ||
          (prevChar === char);
        
        if (isHiatus) {
          syllables++;
        }
        // Si es diptongo, no incrementamos (misma sílaba)
      }
      prevWasVowel = true;
    } else {
      prevWasVowel = false;
    }
    
    i++;
  }
  
  return Math.max(1, syllables);
}

/**
 * Formatea segundos a formato timestamp "M:SS"
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parsea un timestamp "M:SS" a segundos
 */
export function parseTime(timestamp: string): number {
  const parts = timestamp.split(':');
  if (parts.length !== 2) return 0;
  
  const mins = parseInt(parts[0], 10) || 0;
  const secs = parseInt(parts[1], 10) || 0;
  
  return mins * 60 + secs;
}
