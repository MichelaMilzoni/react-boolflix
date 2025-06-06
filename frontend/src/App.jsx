import { useState } from 'react';
import axios from 'axios';
import './App.css'; 

//* Importa la funzione aggiornata dal file di utilities
import { getFlagRepresentation } from './utils/flags'; 
import { getStarRatingIcons } from './utils/starRating';

//* dichiarazione costante che contiene la parte fissa dell'URL delle immagini
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';


function App() {
    // Stati per gestire la query di ricerca, i film, lo stato di caricamento e gli errori
    const [searchQuery, setSearchQuery] = useState('');
    // Ora 'movies' conterrà sia film che serie TV
    const [movies, setMovies] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Funzione asincrona per gestire la ricerca dei film e serie TV
    const handleSearch = async () => {
        setLoading(true); 
        setError(null);   
        setMovies([]);    

        try {
            // *** MODIFICA QUI: URL AGGIORNATO AL NUOVO ENDPOINT DEL BACKEND ***
            // L'URL ora è http://localhost:4000/api perché abbiamo cambiato 'app.use' nel backend
            const response = await axios.get(`http://localhost:4000/api`, {
                params: {
                    query: searchQuery 
                }
            });

            // Aggiorna lo stato 'movies' con i risultati combinati
            setMovies(response.data);
        } catch (err) {
            console.error('Errore durante la ricerca:', err);
            setError('Si è verificato un errore durante la ricerca dei film o delle serie TV.');
            
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // L'intero componente deve restituire un singolo elemento radice.
        // Il div.App racchiude header e main.
        <div className="App">
            <header>
                {/* Logo BoolFlix */}
                <h1>BoolFlix</h1>

                {/* Contenitore della searchbar */}
                <div className="search-bar-container"> {/* Aggiunto una classe per stile futuro se necessario */}
                    <input
                        type="text"
                        placeholder="Cerca film o serie TV..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                    <button onClick={handleSearch} disabled={loading}>
                        {loading ? 'Ricerca...' : 'Cerca'}
                    </button>
                </div>
            </header>

            <main>
                {/* Messaggi di errore */}
                {error && <div className="error-message">Errore: {error}</div>}

                {/* Messaggi di stato */}
                {loading && <p className="loading-message">Caricamento risultati...</p>} 

                {/* Messaggi quando non ci sono risultati o la ricerca non è ancora iniziata */}
                {!loading && movies.length === 0 && searchQuery && !error && (
                    <p className="no-results-message">Nessun risultato trovato per "{searchQuery}".</p>
                )}
                {!loading && movies.length === 0 && !searchQuery && !error && (
                    <p className="initial-message">Inizia a cercare un film o una serie TV!</p>
                )}
                
                {/* Visualizzazione dei film/serie TV trovati */}
                {movies.length > 0 && (
                    <section className="results-section">
                        <h2>Risultati della ricerca:</h2>
                        {/* Questo div conterrà le card dei risultati, userà flexbox */}
                        <div className="results-grid"> 
                            {movies.map((item) => { 
                                const flagSrc = getFlagRepresentation(item.original_language);
                                const isFlagUrl = flagSrc.startsWith('http'); 

                                return (
                                    <div key={item.id} className="media-card"> 
                                        {/* Copertina o fallback */}
                                        {item.poster_path ? (
                                            <img 
                                                src={`${IMAGE_BASE_URL}${item.poster_path}`} 
                                                alt={item.title} // Usiamo solo item.title qui
                                                className="poster-image"
                                            />
                                        ) : (
                                            <div className="poster-placeholder">
                                                Nessuna Immagine
                                            </div>
                                        )}
                                        
                                        {/* Dettagli della card (visibili solo on hover nella prossima fase) */}
                                        <div className="card-info">
                                            <h3>{item.title} ({item.media_type === 'movie' ? 'Film' : 'Serie TV'})</h3>
                                            <p><strong>Titolo Originale:</strong> {item.original_title}</p>
                                            <p>
                                                <strong>Lingua:</strong> {' '}
                                                {isFlagUrl ? (
                                                    <img 
                                                        src={flagSrc} 
                                                        alt={`Bandiera ${item.original_language}`} 
                                                        className="flag-icon"
                                                    />
                                                ) : (
                                                    <span>{flagSrc}</span> 
                                                )}
                                            </p>
                                            <p><strong>Voto:</strong> {getStarRatingIcons(item.vote_average)}</p>
                                            {item.release_date && <p><strong>Data di Uscita:</strong> {item.release_date}</p>}
                                            {/* Overview - visibile solo on hover nella prossima fase */}
                                            {item.overview && <p className="overview"><strong>Trama:</strong> {item.overview}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;
