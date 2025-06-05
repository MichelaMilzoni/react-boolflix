//* Mappatura dei codici lingua ISO 639-1 ai codici paese ISO 3166-1 alpha-2
//* Questa mappatura è una semplificazione, scegliendo un paese rappresentativo per l'emoji/bandiera.
const languageToCountryCode = {
    'en': 'US', // English -> United States
    'es': 'ES', // Spanish -> Spain
    'fr': 'FR', // French -> France
    'de': 'DE', // German -> Germany
    'it': 'IT', // Italian -> Italy
    'pt': 'PT', // Portuguese -> Portugal
    'ru': 'RU', // Russian -> Russia
    'zh': 'CN', // Chinese -> China
    'ja': 'JP', // Japanese -> Japan
    'ko': 'KR', // Korean -> South Korea
    'ar': 'SA', // Arabic -> Saudi Arabia
    'hi': 'IN', // Hindi -> India
    'tr': 'TR', // Turkish -> Turkey
    'nl': 'NL', // Dutch -> Netherlands
    'sv': 'SE', // Swedish -> Sweden
    'no': 'NO', // Norwegian -> Norway
    'da': 'DK', // Danish -> Denmark
    'fi': 'FI', // Finnish -> Finland
    'pl': 'PL', // Polish -> Poland
    'cs': 'CZ', // Czech -> Czech Republic
    'hu': 'HU', // Hungarian -> Hungary
    // Puoi aggiungere altre mappature se necessario
};

// Funzione per ottenere la rappresentazione della bandiera (URL immagine o testo di fallback)
export function getFlagRepresentation(languageCode) {
    const countryCode = languageToCountryCode[languageCode];

    if (countryCode) {
        // Restituisce l'URL di un'immagine di bandiera da un CDN
        // Usiamo un formato 'w20' per una piccola larghezza, e convertiamo il codice paese in minuscolo per l'URL.
        return `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;
    } else {
        // Fallback: se non c'è una mappatura, restituisci il codice lingua in maiuscolo
        return languageCode.toUpperCase();
    }
}