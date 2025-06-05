import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  //* stati per gestire la query di ricerca, i film, lo stato di caricamento e gli errori 
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //* funzione per gestire la ricerca dei film
  const handleSearch = async () => {
    setLoading(true); // Imposta lo stato di caricamento a true
    setError(null);   // Resetta eventuali errori precedenti
    setMovies([]);    // Pulisce i film visualizzati prima di una nuova ricerca
    
    try {
      //* richiesta GET al backend
      // l'URL deve corrrispondere all'endpoint di server.js!!!
      const response = await axios.get(`http://localhost:4000/api/movies`, {
        params: {
          query: searchQuery // Il nome del parametro 'query' deve corrispondere a req.query.query nel backend
        }
      });

      //* aggiorno lo stato dei film con i dati ricevuti
      setMovies(response.data);
    } catch (err) {
      //* gestisco gli errori
      console.error('Errore durante la ricerca:', err);
      setError('Si è verificato un errore durante la ricerca del film.');
    } finally {
      //* imposta lo stato di caricamento a false dopo la richiesta
      setLoading(false);
    }
  };

      return (
        <div className="App">
            <h1>BoolFlix Search</h1>

            {/* Sezione della searchbar */}
            <div>
                <input
                    type="text"
                    placeholder="Cerca un film..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    // Opzionale: Permette di avviare la ricerca anche premendo 'Invio' nel campo input
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? 'Ricerca...' : 'Cerca'} {/* Cambia il testo del pulsante durante il caricamento */}
                </button>
            </div>

            {/* Visualizzazione dei messaggi di errore */}
            {error && <div>Errore: {error}</div>}

            {/* Sezione per visualizzare i risultati o i messaggi di stato */}
            <div>
                {loading && <p>Caricamento film...</p>} {/* Messaggio di caricamento */}

                {/* Messaggi quando non ci sono film da mostrare */}
                {!loading && movies.length === 0 && searchQuery && !error && (
                    <p>Nessun risultato trovato per "{searchQuery}".</p>
                )}
                {!loading && movies.length === 0 && !searchQuery && !error && (
                    <p>Inizia a cercare un film!</p>
                )}
                
                {/* Visualizzazione dei film trovati */}
                {movies.length > 0 && (
                    <div>
                        <h2>Risultati della ricerca:</h2>
                        {/* Ho rimosso il flexbox per una visualizzazione più semplice a lista */}
                        <div>
                            {movies.map((movie) => (
                                <div key={movie.id}> {/* Rimosso lo stile in linea del div singolo film */}
                                    <h3>{movie.title}</h3>
                                    <p><strong>Titolo Originale:</strong> {movie.original_title}</p>
                                    <p><strong>Lingua:</strong> {movie.original_language.toUpperCase()}</p>
                                    <p><strong>Voto:</strong> {movie.vote_average.toFixed(1)} / 10</p>
                                    {/* Ho rimosso l'immagine e il suo fallback per concentrarci solo sulla logica e i dati testuali */}
                                    <hr /> {/* Linea separatrice per chiarezza tra i film */}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
