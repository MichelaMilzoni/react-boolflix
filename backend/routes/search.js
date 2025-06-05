
//* Importazioni necessarie
require('dotenv').config(); // Per accedere a process.env
const express = require('express');
const axios = require('axios'); // Per fare le chiamate HTTP esterne

//* Inizializzazione del router
const router = express.Router();

//* Definizione base URL per le richieste API
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
            media_type: 'movie' // Aggiungiamo un campo per distinguere il tipo
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
            media_type: 'tv' // Aggiungo un campo per distinguere il tipo
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

//* Esportazione del router
module.exports = router;
