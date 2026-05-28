import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [allResults, setAllResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const API_URL = '/api/v1';
  const API_KEY = 'dev-anime1v-key';
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setPage(1);
      
      if (!query) {
        setAllResults([]);
        setDisplayedResults([]);
        setLoading(false);
        return;
      }

      try {
        // Hacemos 3 consultas paralelas para intentar extraer más animes del scraper
        const urls = [
          `${API_URL}/anime/search?q=${encodeURIComponent(query)}&apiKey=${API_KEY}`,
          `${API_URL}/anime/search?q=${encodeURIComponent(query + ' anime')}&apiKey=${API_KEY}`,
          `${API_URL}/anime/search?q=${encodeURIComponent('mejor ' + query)}&apiKey=${API_KEY}`
        ];

        const responses = await Promise.all(
          urls.map(url => fetch(url).then(r => r.json()).catch(() => ({ success: false })))
        );

        let combined = [];
        responses.forEach(data => {
          if (data.success && data.data && data.data.results) {
            combined = [...combined, ...data.data.results];
          }
        });

        // Eliminar duplicados basados en URL
        const uniqueAnimes = [];
        const seenUrls = new Set();
        combined.forEach(anime => {
          if (!seenUrls.has(anime.url)) {
            seenUrls.add(anime.url);
            uniqueAnimes.push(anime);
          }
        });

        setAllResults(uniqueAnimes);
        setDisplayedResults(uniqueAnimes.slice(0, ITEMS_PER_PAGE));
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, API_URL]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setDisplayedResults(allResults.slice(0, nextPage * ITEMS_PER_PAGE));
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '5rem' }}>Buscando "{query}"... (Esto puede tomar unos segundos)</div>;

  return (
    <div>
      <h2 className="section-title">Resultados para: "{query}" ({allResults.length} encontrados)</h2>
      
      {allResults.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No se encontraron animes para esta búsqueda.</p>
      ) : (
        <>
          <div className="anime-grid">
            {displayedResults.map((anime, index) => (
              <div key={index} onClick={() => navigate(`/anime?url=${encodeURIComponent(anime.url)}`)}>
                <AnimeCard title={anime.title} image={anime.image} isFeatured={false} />
              </div>
            ))}
          </div>
          
          {displayedResults.length < allResults.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
              <button 
                onClick={loadMore}
                className="auth-submit" 
                style={{ padding: '0.8rem 2rem', borderRadius: '30px' }}
              >
                Cargar Más
              </button>
            </div>
          )}
          
          {displayedResults.length === allResults.length && allResults.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
              Fin de los resultados
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
