//* accesso a .env - importazione dotenv
require('dotenv').config();

//* importazione express
const express = require('express');
//* importazione axios per le richieste HTTP
const axios = require('axios');

//* inizializzazione router
const router = express.Router();

//* definizione base URL per le richieste API
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

//* definizione GET per la ricerca film
router.get('/', async (req, res) => {
    try {
        //* recupero chiave API della variabile d'ambiente
        const TMDB_API_KEY = process.env.TMDB_API_KEY;

        //* recupero query dalla richiesta
        const searchQuery = req.query.query; // suppunendo che il frontend invii il parametro come "query"
        
        //* verifica se la query è presente
        if (!searchQuery) {
            return res.status(400).json({ error: 'Parametro "query" mancante per la ricerca film.' });
        }

        //* costruzione parametri per la chiamata a TMDB
        const params = {
            api_key: TMDB_API_KEY,
            query: searchQuery,
            language: 'it-IT', // lingua italiana
        };

        //* effettuo chiamata HTTP a TMDb usando Axios
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, { params });
        //* restituisco i dati ottenuti al frontend
        res.json(response.data.results);
    } catch (error) {
        //* gestione errori
        console.error('Errore durante la ricerca dei film:', error);
        if (error.response) {
            // Se la risposta ha un errore specifico
            // L'API di TMDb ha risposto con un codice di stato di errore
            res.status(error.response.status).json({ 
                error: 'Errore dalla API di TMDb',
                details: error.response.data 
            });
        } else if (error.request) {
            // Se la richiesta è stata fatta ma non c'è risposta
            res.status(500).json({ 
                error: 'Nessuna risposta dalla API di TMDb',
                details: error.message
            });
        } else {
            // Qualsiasi altro errore
            res.status(500).json({ 
                error: 'Errore sconosciuto durante la ricerca dei film',
                details: error.message
            });
        }
    }
});

//* esportazione del router
module.exports = router;
