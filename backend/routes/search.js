
//* Importazioni necessarie
require('dotenv').config(); // Per accedere a process.env
const express = require('express');
const axios = require('axios'); // Per fare le chiamate HTTP esterne

//* Inizializzazione del router
const router = express.Router();

//* Definizione base URL per le richieste API
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

//* definizione variabili globali per i generi 
let movieGenresMap = new Map(); // Mappa per i generi dei film
let tvGenresMap = new Map(); // Mappa per i generi delle serie TV

//* Funzione per caricare i generi dei film e delle serie TV
async function loadGenres() {
    try {
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        // chiamo l'API per i generi dei film
        const moviesGenresResponse = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: { api_key: TMDB_API_KEY, language: 'it-IT' }
        });
        // riempio la mappa dei generi dei film
        // moviesGenresResponse.data.genres accedo ai dati
        // itero con il forEach per ogni genere attraverso l'id e il nome
        // e aggiungo alla mappa con set
        moviesGenresResponse.data.genres.forEach(genre => {
            movieGenresMap.set(genre.id, genre.name);
        });

        // chiamo l'API per i generi delle serie TV
        const tvGenresResponse = await axios.get(`${TMDB_BASE_URL}/genre/tv/list`, {
            params: { api_key: TMDB_API_KEY, language: 'it-IT' }
        });
        // riempio la mappa dei generi delle serie TV
        tvGenresResponse.data.genres.forEach(genre => {
            tvGenresMap.set(genre.id, genre.name);
        });

        console.log('Generi caricati con successo');
    } catch (error) {
        console.error('Errore durante il caricamento dei generi:', error.message);
        // non blocco l'applicazione, ma registro l'errore
    }
}
        

//* Definizione GET per la ricerca combinata di film e serie TV
router.get('/', async (req, res) => {
    try {
        //* Recupero chiave API dalla variabile d'ambiente
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        //* Recupero query dalla richiesta
        const searchQuery = req.query.query; // supponendo che il frontend invii il parametro come "query"

        //* Verifica se la query è presente
        if (!searchQuery) {
            return res.status(400).json({ error: 'Parametro "query" mancante per la ricerca.' });
        }

        //* Costruzione parametri comuni per le chiamate a TMDb
        const commonParams = { // Nota: la variabile è 'commonParams' per coerenza nell'uso con Promise.all
            api_key: TMDB_API_KEY,
            query: searchQuery,
            language: 'it-IT' // lingua italiana
        };

        //* Effettuo due chiamate Axios in parallelo (film + serie TV)
        const [moviesResponse, tvShowsResponse] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/search/movie`, { params: commonParams }),
            axios.get(`${TMDB_BASE_URL}/search/tv`, { params: commonParams })
        ]);

        //* Standardizzo i risultati dei film
        const movies = moviesResponse.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            original_language: movie.original_language,
            vote_average: movie.vote_average,
            poster_path: movie.poster_path,
            overview: movie.overview,
            release_date: movie.release_date, // Per coerenza con le serie TV
            media_type: 'movie', // Aggiungiamo un campo per distinguere il tipo
            genres: movie.genre_ids 
                ? 
                movie.genre_ids.map(id => 
                movieGenresMap.get(id))
                .filter(Boolean) // Rimuove i generi vuoti
                : []
                //! ? : ternario (versione compatta if..else) per gestire i casi in cui non ci sono generi
                //! CONDIZIONE: movie.genre_ids se esiste e non è NULL o undefined esegui il primo blocco (? ...)
                //! SE NO: esegui il secondo blocco (: [])
                //! .map applica una funzione a ogni elemento e restituisce un nuovo array
                //! .filter rimuove gli elementi che non soddisfano la condizione (in questo caso, rimuove i generi vuoti)
                //! Boolean (oppure name => name) ripulisce l'array rimuovendo elementi false
        }));

        //* Standardizzo i risultati delle serie TV
        const tvShows = tvShowsResponse.data.results.map(tvShow => ({
            id: tvShow.id,
            title: tvShow.name, // Le serie TV hanno 'name' invece di 'title'
            original_title: tvShow.original_name, // Le serie TV hanno 'original_name'
            original_language: tvShow.original_language,
            vote_average: tvShow.vote_average,
            poster_path: tvShow.poster_path,
            overview: tvShow.overview,
            release_date: tvShow.first_air_date, // Le serie TV hanno 'first_air_date'
            media_type: 'tv', // Aggiungo un campo per distinguere il tipo
            genres: tvShow.genre_ids 
                ? 
                tvShow.genre_ids.map(id => 
                tvGenresMap.get(id))
                .filter(Boolean) 
                : []
                //! vedi sopra per la spiegazione del ternario e del filter
        }));

        //* Combina tutti i risultati in un unico array
        const allResults = [...movies, ...tvShows];

        // Invia tutti i risultati combinati al frontend
        res.json(allResults);

    } catch (error) {
        //* Gestione errori
        console.error("Errore durante la ricerca combinata su TMDb:", error.message);
        if (error.response) {
            // L'API di TMDb ha risposto con un codice di stato di errore
            res.status(error.response.status).json({
                error: 'Errore dalla API di TMDb',
                details: error.response.data
            });
        } else if (error.request) {
            // La richiesta è stata fatta ma nessuna risposta è stata ricevuta (es. problemi di rete)
            res.status(500).json({
                error: 'Nessuna risposta dalla API di TMDb',
                details: error.message
            });
        } else {
            // Qualcos'altro è andato storto nella configurazione della richiesta
            res.status(500).json({
                error: 'Errore generico durante la richiesta',
                details: error.message
            });
        }
    }
});

//* aggiungo nuovo endpoint per l'anteprima sull'homepage di 8 film/serie tv di tendenza
// l'endpoint deve recuerare i contenuti di tendenza e formattarli come i risultati di ricerca, 
// includendo copertina titolo, genere
router.get('/trending', async (req, res) => {
    try {
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        // Chiamata all'API di TMDb per i contenuti di tendenza (film e serie TV) del giorno
        const trendingResponse = await axios.get(`${TMDB_BASE_URL}/trending/all/day`, {
            params: { api_key: TMDB_API_KEY, language: 'it-IT' }
        });

        // standardizzo i risultati
        const trendingItems = trendingResponse.data.results.map(item => {
            const mediaType = item.media_type;
            const genresMap = mediaType === 'movie' ? movieGenresMap : tvGenresMap;
            //! se mediaType è = 'movie' 
            //! allora (?) uso la mappa dei generi dei film
            //! altrimenti (:) uso quella delle serie TV

            return {
                id: item.id,
                title: item.title || item.name, // titolo per film o serie TV
                //! uso l'operatore logico OR (||) per gestire i casi in cui title è undefined
                original_title: item.original_title || item.original_name, // titolo originale per film o serie TV
                //! uso l'operatore logico OR (||) per gestire i casi in cui original_title è undefined
                original_language: item.original_language,
                vote_average: item.vote_average,
                poster_path: item.poster_path,
                overview: item.overview,
                release_date: item.release_date || item.first_air_date, // data di rilascio per film o serie TV
                //! uso l'operatore logico OR (||) per gestire i casi in cui release_date è undefined
                media_type: mediaType, // tipo di media (movie o tv)
                genres: item.genre_ids 
                    ? 
                    item.genre_ids.map(id => genresMap.get(id))
                    .filter(Boolean) 
                    : []
            };
        }).filter(item => item.poster_path); // Filtra solo gli elementi con poster_path
        //! filtro gli elementi che hanno poster_path per evitare di mostrare contenuti senza copertina

        //* Invia i primi 8 risultati al frontend
        res.json(trendingItems.slice(0, 8)); // Limito a 8 risultati per l'anteprima
    } catch (error) {
        console.error("Errore durante il recupero dei contenuti:", error.message);
        if (error.response) {
            res.status(error.response.status).json({
                error: 'Errore dalla API di TMDb (Trending)',
                details: error.response.data
            });
        } else if (error.request) {
            res.status(500).json({
                error: 'Nessuna risposta dalla API di TMDb (Trending)',
                details: error.message
            });
        } else {
            res.status(500).json({
                error: 'Errore generico durante la richiesta (Trending)',
                details: error.message
            });
        }
    }
});


//* Carico i generi all'avvio del server una sola volta
loadGenres()

//* Esportazione del router
module.exports = router;
