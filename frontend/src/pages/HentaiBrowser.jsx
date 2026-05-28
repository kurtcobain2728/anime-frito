import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';

const HentaiBrowser = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);
  const navigate = useNavigate();

  const API_URL = '/api/v1';
  const API_KEY = 'dev-anime1v-key';

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const url = `${API_URL}/anime/search?q=${encodeURIComponent(query)}&domain=hentaila&apiKey=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.data && data.data.results) {
          setResults(data.data.results);
        } else {
          setResults([]);
        }
      } catch (e) {
        console.error(e);
        setResults([]);
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  return (
    <div>
      <h2 className="section-title">Explorar Contenido +18</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <input
          type="search"
          className="auth-input"
          placeholder="Buscar en HentaiLA..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '600px', margin: '0 auto', display: 'block' }}
        />
      </form>

      {loading && <div style={{ color: 'white', textAlign: 'center', marginTop: '5rem' }}>Buscando "{query}"...</div>}

      {!loading && results.length === 0 && query && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No se encontraron resultados para "{query}".</p>
      )}

      <div className="anime-grid">
        {results.map((anime, index) => (
          <div key={index} onClick={() => navigate(`/anime?url=${encodeURIComponent(anime.url)}`)}>
            <AnimeCard title={anime.title} image={anime.image} isFeatured={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HentaiBrowser;
