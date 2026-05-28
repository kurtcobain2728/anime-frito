import React, { useState, useEffect } from "react";
import AnimeCard from "../components/AnimeCard";
import { useNavigate } from "react-router-dom";

const GENRES = [
  "Acción", "Aventura", "Comedia", "Ciencia Ficción", "Deportes",
  "Drama", "Fantasía", "Isekai", "Magia", "Mecha",
  "Misterio", "Música", "Psicológico", "Romance", "Shounen",
  "Shoujo", "Seinen", "Recuentos de la vida", "Sobrenatural", "Terror"
];

const TRENDING_QUERIES = ["one piece", "jujutsu kaisen", "demon slayer", "solo leveling", "dragon ball daima", "dandadan", "blue lock", "mushoku tensei"];

const Home = ({ filter }) => {
  const [featuredAnime, setFeaturedAnime] = useState([]);
  const [recentAnime, setRecentAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreResults, setGenreResults] = useState([]);
  const [genreDisplayed, setGenreDisplayed] = useState([]);
  const [genrePage, setGenrePage] = useState(1);
  const [genreLoading, setGenreLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "/api/v1";
  const API_KEY = "dev-anime1v-key";
  const ITEMS_PER_PAGE = 24;

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true);
        if (!filter || filter === "featured") {
          const popularRes = await fetch(API_URL + "/anime/popular?apiKey=" + API_KEY).then(r => r.json()).catch(() => ({ success: false }));
          if (popularRes.success && popularRes.data) {
            setFeaturedAnime(popularRes.data.results.slice(0, 8));
          } else {
            // Fallback to old method if popular fails
            const shuffled = [...TRENDING_QUERIES].sort(() => 0.5 - Math.random()).slice(0, 4);
            const promises = shuffled.map(q =>
              fetch(API_URL + "/anime/search?q=" + encodeURIComponent(q) + "&apiKey=" + API_KEY).then(r => r.json()).catch(() => ({ success: false }))
            );
            const responses = await Promise.all(promises);
            let combined = [];
            const seenUrls = new Set();
            responses.forEach(data => {
              if (data.success && data.data && data.data.results) {
                data.data.results.forEach(anime => {
                  if (!seenUrls.has(anime.url)) { seenUrls.add(anime.url); combined.push(anime); }
                });
              }
            });
            setFeaturedAnime(combined.slice(0, 8));
          }
        }
        if (!filter) {
          const recentRes = await fetch(API_URL + "/anime/search?q=2025&apiKey=" + API_KEY).then(r => r.json()).catch(() => ({ success: false }));
          if (recentRes.success && recentRes.data) setRecentAnime(recentRes.data.results.slice(0, 8));
        }
        setLoading(false);
      } catch (error) { console.error(error); setLoading(false); }
    };
    fetchAnime();
  }, [filter]);

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    setGenreLoading(true);
    setGenrePage(1);
    try {
      const urls = [
        API_URL + "/anime/search?q=" + encodeURIComponent(genre) + "&apiKey=" + API_KEY,
        API_URL + "/anime/search?q=" + encodeURIComponent(genre + " anime") + "&apiKey=" + API_KEY,
        API_URL + "/anime/search?q=" + encodeURIComponent("mejor " + genre) + "&apiKey=" + API_KEY
      ];
      const responses = await Promise.all(urls.map(url => fetch(url).then(r => r.json()).catch(() => ({ success: false }))));
      let combined = [];
      const seenUrls = new Set();
      responses.forEach(data => {
        if (data.success && data.data && data.data.results) {
          data.data.results.forEach(anime => {
            if (!seenUrls.has(anime.url)) { seenUrls.add(anime.url); combined.push(anime); }
          });
        }
      });
      setGenreResults(combined);
      setGenreDisplayed(combined.slice(0, ITEMS_PER_PAGE));
    } catch (e) { console.error(e); }
    setGenreLoading(false);
  };

  const loadMoreGenre = () => {
    const nextPage = genrePage + 1;
    setGenrePage(nextPage);
    setGenreDisplayed(genreResults.slice(0, nextPage * ITEMS_PER_PAGE));
  };

  if (loading) return <div style={{ color: "white", textAlign: "center", marginTop: "5rem" }}>Cargando animes...</div>;

  return (
    <>
      {(!filter || filter === "featured") && (
        <>
          <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>🔥 Animes Destacados</h2>
          <div className="anime-grid" style={{ marginBottom: "3rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {featuredAnime.map((anime, index) => (
              <div key={"feat-" + index} onClick={() => navigate("/anime?url=" + encodeURIComponent(anime.url))}>
                <AnimeCard title={anime.title} image={anime.image} isFeatured={index < 4} />
              </div>
            ))}
          </div>
        </>
      )}

      {!filter && recentAnime.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>✨ Temporada Actual</h2>
          <div className="anime-grid" style={{ marginBottom: "3rem" }}>
            {recentAnime.map((anime, index) => (
              <div key={"rec-" + index} onClick={() => navigate("/anime?url=" + encodeURIComponent(anime.url))}>
                <AnimeCard title={anime.title} image={anime.image} isFeatured={false} />
              </div>
            ))}
          </div>
        </>
      )}

      {filter === "categories" && (
        <>
          <h2 className="section-title" style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>📂 Explorar Categorías</h2>
          <div className="anime-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            {GENRES.map((genre) => (
              <div
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className="glass"
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: selectedGenre === genre ? "#3a1b28" : "var(--text-light)",
                  background: selectedGenre === genre ? "var(--accent-pink, #fadddd)" : "rgba(255,255,255,0.05)",
                  transition: "all 0.3s ease",
                  border: selectedGenre === genre ? "2px solid var(--accent-pink, #fadddd)" : "1px solid rgba(255,255,255,0.08)"
                }}
              >
                {genre}
              </div>
            ))}
          </div>

          {genreLoading && <div style={{ color: "white", textAlign: "center", margin: "2rem 0" }}>Buscando animes de {selectedGenre}...</div>}

          {selectedGenre && !genreLoading && (
            <>
              <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>Resultados de "{selectedGenre}" ({genreResults.length})</h2>
              {genreResults.length === 0 ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No se encontraron animes para esta categoría.</p>
              ) : (
                <>
                  <div className="anime-grid">
                    {genreDisplayed.map((anime, index) => (
                      <div key={index} onClick={() => navigate("/anime?url=" + encodeURIComponent(anime.url))}>
                        <AnimeCard title={anime.title} image={anime.image} isFeatured={false} />
                      </div>
                    ))}
                  </div>
                  {genreDisplayed.length < genreResults.length && (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                      <button onClick={loadMoreGenre} className="auth-submit" style={{ padding: "0.8rem 2rem", borderRadius: "30px" }}>
                        Cargar Más ({genreResults.length - genreDisplayed.length} restantes)
                      </button>
                    </div>
                  )}
                  {genreDisplayed.length >= genreResults.length && genreResults.length > 0 && (
                    <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-muted)" }}>Fin de los resultados</div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default Home;
