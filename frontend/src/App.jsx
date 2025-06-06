import { useState, useEffect } from 'react'; // Importa useEffect
import axios from 'axios';
import './App.css'; 

//* Importa la funzione aggiornata dal file di utilities per le bandiere
import { getFlagRepresentation } from './utils/flags'; 
// Importa la funzione per il calcolo delle stelle
import { getStarRatingIcons } from './utils/starRating.jsx'; // Nota l'estensione .jsx

//* Dichiarazione costante che contiene la parte fissa dell'URL delle immagini di TMDB
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185'; 

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [movies, setMovies] = useState([]); // Stato per i risultati della ricerca
    const [trendingItems, setTrendingItems] = useState([]); // Stato per i contenuti di tendenza (anteprima)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Correzione: rimosso il '= useState' in eccesso che causava il warning
    const [hasSearched, setHasSearched] = useState(false); // Nuovo stato per tracciare se una ricerca è stata avviata

    //* Aggiungo useEffect per caricare gli elementi in tendenza all'avvio dell'app
    // Questo effetto si esegue una volta al montaggio del componente per caricare i contenuti di tendenza
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/trending`);
                setTrendingItems(response.data);
            } catch (err) {
                console.error('Errore durante il recupero dei contenuti di tendenza:', err);
                // Puoi impostare un messaggio di errore specifico per l'anteprima se necessario
                setError('Impossibile caricare i contenuti di tendenza.'); // Imposta un errore per l'anteprima
            }
        };

        // Carica i contenuti di tendenza solo se non c'è stata una ricerca precedente
        // E se non ci sono già contenuti di tendenza (per evitare ricarichi inutili)
        if (!hasSearched && trendingItems.length === 0) { 
            fetchTrending();
        }
    }, [hasSearched, trendingItems.length]); // Dipendenza da hasSearched e trendingItems.length

    // Funzione asincrona per gestire la ricerca di film e serie TV
    const handleSearch = async () => {
        setLoading(true); 
        setError(null);   
        setMovies([]);    
        setTrendingItems([]); // Nascondi l'anteprima quando si inizia una ricerca
        setHasSearched(true); // Indica che una ricerca è stata avviata 

    // NUOVO: Se la query di ricerca è vuota o solo spazi bianchi, non fare nulla.
    if (searchQuery.trim() === '') {
        setLoading(false); // Assicurati che lo stato di caricamento sia disattivato
        setMovies([]);     // Assicurati che i risultati siano vuoti
        setTrendingItems([]); // Assicurati che l'anteprima sia nascosta
        setError(null);    // Rimuovi eventuali errori precedenti
        setHasSearched(false); // Reinizializza per mostrare l'anteprima di nuovo
    return; // Esci dalla funzione
}

        try {
            // L'URL è aggiornato al nuovo endpoint del backend per la ricerca combinata
            const response = await axios.get(`http://localhost:4000/api`, {
                params: {
                    query: searchQuery 
                }
            });

            // Aggiorna lo stato 'movies' con i risultati combinati
            setMovies(response.data);
        } catch (err) {
            console.error('Errore durante la ricerca:', err);
            if (err.response) {
                if (err.response.data && err.response.data.error) {
                    setError(err.response.data.error);
                } else {
                    setError(`Errore ${err.response.status}: ${err.response.statusText || 'Errore sconosciuto dal server.'}`);
                }
            } else if (err.request) {
                setError('Nessuna risposta dal server. Controlla che il backend sia in esecuzione.');
            } else {
                setError(`Errore nella configurazione della richiesta: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Componente Card riutilizzabile (logica di visualizzazione della singola card)
    // Ho incluso i generi qui per mostrare tutte le informazioni al passaggio del mouse
    const MediaCard = ({ item }) => {
        const flagSrc = getFlagRepresentation(item.original_language);
        const isFlagUrl = flagSrc.startsWith('http'); 

        return (
            <div key={item.id} className="media-card"> 
                {/* Visualizziamo l'immagine del poster o un placeholder */}
                {/* Utilizziamo l'URL base per le immagini e il percorso del poster */}
                {item.poster_path ? (
                    <img 
                        src={`${IMAGE_BASE_URL}${item.poster_path}`} 
                        alt={item.title} 
                        className="poster-image"
                    />
                ) : (
                    <div className="poster-placeholder">
                        Nessuna Immagine
                    </div>
                )}
                
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
                    {/* Visualizzazione dei generi, se presenti */}
                    {item.genres && item.genres.length > 0 && (
                        <p className="genres"><strong>Generi:</strong> {item.genres.join(', ')}</p>
                    )}
                    {item.overview && <p className="overview"><strong>Trama:</strong> {item.overview}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="App">
            <header>
                <h1>BoolFlix</h1>

                <div className="search-bar-container">
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

                {/* Messaggi di stato: Caricamento */}
                {loading && <p className="loading-message">Caricamento risultati...</p>} 

                {/* Visualizzazione dei risultati della ricerca (se movies.length > 0) */}
                {!loading && !error && movies.length > 0 && (
                    <section className="results-section">
                        <h2>Risultati della ricerca:</h2>
                        <div className="results-grid"> 
                            {movies.map((item) => (
                                <MediaCard key={item.id} item={item} /> // Usa il componente MediaCard riutilizzabile
                            ))}
                        </div>
                    </section>
                )}

                {/* Blocco per l'anteprima, messaggio di nessun risultato, o messaggio iniziale */}
                {!loading && !error && movies.length === 0 && (
                    <>
                        {/* Messaggio di nessun risultato se la ricerca è stata avviata e la query non è vuota */}
                        {hasSearched && searchQuery && (
                            <p className="no-results-message">Nessun risultato trovato per "{searchQuery}".</p>
                        )}
                        {/* Anteprima dei contenuti di tendenza se non c'è stata una ricerca e ci sono trendingItems */}
                        {!hasSearched && trendingItems.length > 0 && (
                            <section className="preview-section">
                                <h2>In tendenza oggi:</h2>
                                <div className="results-grid"> 
                                    {trendingItems.map((item) => (
                                        <MediaCard key={item.id} item={item} /> // Usa il componente MediaCard riutilizzabile
                                    ))}
                                </div>
                            </section>
                        )}
                        {/* Messaggio iniziale di caricamento dei contenuti di tendenza se non sono ancora arrivati */}
                        {!hasSearched && trendingItems.length === 0 && (
                            <p className="initial-message">Caricamento contenuti di tendenza...</p>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;