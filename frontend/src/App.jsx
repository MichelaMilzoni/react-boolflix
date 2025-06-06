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
        <div className="App">
            <h1>BoolFlix Search</h1>

            <div>
                <input
                    type="text"
                    placeholder="Cerca un film o una serie TV..."
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

            {error && <div>Errore: {error}</div>}

            <div>
                {loading && <p>Caricamento risultati...</p>} 

                {!loading && movies.length === 0 && searchQuery && !error && (
                    <p>Nessun risultato trovato per "{searchQuery}".</p>
                )}
                {!loading && movies.length === 0 && !searchQuery && !error && (
                    <p>Inizia a cercare un film o una serie TV!</p>
                )}
                
                {movies.length > 0 && (
                    <div>
                        <h2>Risultati della ricerca:</h2>
                        <div>
                            {movies.map((item) => { // Ho rinominato 'movie' in 'item' per chiarezza, dato che include anche serie TV
                                const flagSrc = getFlagRepresentation(item.original_language);
                                const isFlagUrl = flagSrc.startsWith('http'); 

                                return (
                                    <div key={item.id} style={{border: '1px solid #ccc', padding: '10px', marginBottom: '10px'}}> 

                                        { item.poster_path ? (
                                        <img 
                                            src={`${IMAGE_BASE_URL}${item.poster_path}`} 
                                            alt={item.title || item.name} 
                                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px'}}
                                        />
                                        ) : (
                                            <div style={{ width: '185px', height: '278px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', color: '#555', borderRadius: '4px' }}>
                                                Nessuna Immagine
                                            </div>
                                        )}
                                        <h3>{item.title} ({item.media_type === 'movie' ? 'Film' : 'Serie TV'})</h3>
                                        <p><strong>Titolo Originale:</strong> {item.original_title}</p>
                                        <p>
                                            <strong>Lingua:</strong> {' '}
                                            {isFlagUrl ? (
                                                <img 
                                                    src={flagSrc} 
                                                    alt={`Bandiera ${item.original_language}`} 
                                                    style={{ verticalAlign: 'middle', marginLeft: '5px', width: '20px', height: 'auto' }} 
                                                />
                                            ) : (
                                                <span>{flagSrc}</span> 
                                            )}
                                        </p>
                                        <p><strong>Voto:</strong> {getStarRatingIcons(item.vote_average)}</p>
                                        {/* Visualizziamo la data di uscita/prima trasmissione, ora è standardizzata */}
                                        {item.release_date && <p><strong>Data di Uscita:</strong> {item.release_date}</p>}
                                        <hr /> 
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;