import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import ReactPlayer from "react-player";
import { Star, Calendar, PlayCircle, Download, Globe, Server } from "lucide-react";
import "./AnimeDetails.css";

const AnimeDetails = () => {
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get("url");
  const playerRef = useRef(null);

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoType, setVideoType] = useState("react-player");
  const [videoLoading, setVideoLoading] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [kitsuImage, setKitsuImage] = useState(null);
  const [kitsuBanner, setKitsuBanner] = useState(null);
  const [availableLangs, setAvailableLangs] = useState([]);
  const [selectedLang, setSelectedLang] = useState("SUB");
  const [allStreamLinks, setAllStreamLinks] = useState({});
  const [allDownloadLinks, setAllDownloadLinks] = useState({});
  const [availableServers, setAvailableServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(0);

  const API_URL = "/api/v1";
  const API_KEY = "dev-anime1v-key";
  const FALLBACK_DOMAINS = ["animeflv.net", "jkanime.net", "tioanime.com"];

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      if (!urlParam) { setLoading(false); return; }
      try {
        const res = await fetch(API_URL + "/anime/info?url=" + encodeURIComponent(urlParam) + "&apiKey=" + API_KEY);
        const data = await res.json();
        if (data.success && data.data) {
          setAnime(data.data);
          try {
            const kitsuRes = await fetch("https://kitsu.io/api/edge/anime?filter[text]=" + encodeURIComponent(data.data.title) + "&page[limit]=1");
            const kitsuData = await kitsuRes.json();
            if (kitsuData.data && kitsuData.data.length > 0) {
              const attrs = kitsuData.data[0].attributes;
              if (attrs.posterImage) setKitsuImage(attrs.posterImage.large || attrs.posterImage.original);
              if (attrs.coverImage) setKitsuBanner(attrs.coverImage.large || attrs.coverImage.original);
            }
          } catch (kErr) { console.error("Kitsu fallback error", kErr); }
        } else { setAnime(null); }
        setLoading(false);
      } catch (e) { console.error(e); setLoading(false); }
    };
    fetchInfo();
  }, [urlParam]);

  useEffect(() => {
    if (selectedEpisode && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedEpisode]);

  const tryFallbackProviders = async (episodeNumber) => {
    const animeTitle = anime?.title || "";
    for (const domain of FALLBACK_DOMAINS) {
      try {
        const searchRes = await fetch(API_URL + "/anime/search?q=" + encodeURIComponent(animeTitle) + "&domain=" + domain + "&apiKey=" + API_KEY);
        const searchData = await searchRes.json();
        if (searchData.success && searchData.data && searchData.data.results && searchData.data.results.length > 0) {
          const matchUrl = searchData.data.results[0].url;
          const infoRes = await fetch(API_URL + "/anime/info?url=" + encodeURIComponent(matchUrl) + "&apiKey=" + API_KEY);
          const infoData = await infoRes.json();
          if (infoData.success && infoData.data && infoData.data.episodes) {
            const matchEp = infoData.data.episodes.find(ep => ep.number == episodeNumber);
            if (matchEp) {
              const epRes = await fetch(API_URL + "/anime/episode?url=" + encodeURIComponent(matchEp.url) + "&apiKey=" + API_KEY);
              const epData = await epRes.json();
              if (epData.success && epData.data && epData.data.streamLinks) {
                const hasStreams = Object.values(epData.data.streamLinks).some(arr => arr && arr.length > 0);
                if (hasStreams) return { streamLinks: epData.data.streamLinks, downloadLinks: epData.data.downloadLinks || {}, source: domain };
              }
            }
          }
        }
      } catch (e) { console.error("Fallback " + domain + " failed:", e); }
    }
    return null;
  };

  const processStreamData = (streamLinks, downloadLinksData) => {
    setAllStreamLinks(streamLinks);
    setAllDownloadLinks(downloadLinksData || {});
    const langs = Object.keys(streamLinks).filter(k => streamLinks[k] && streamLinks[k].length > 0);
    setAvailableLangs(langs);
    const lang = langs.includes("SUB") ? "SUB" : (langs.includes("LAT") ? "LAT" : langs[0] || "SUB");
    setSelectedLang(lang);
    if (downloadLinksData && downloadLinksData[lang]) setDownloadLinks(downloadLinksData[lang]);
    else setDownloadLinks([]);
    const links = streamLinks[lang] || [];
    setAvailableServers(links);
    if (links.length > 0) { setSelectedServer(0); selectStream(links, 0); }
    else setVideoUrl("");
  };

  const selectStream = (links, index) => {
    const selectedLink = links[index];
    if (selectedLink) {
      setVideoUrl(selectedLink.url);
      setVideoType(!selectedLink.url.includes(".m3u8") && !selectedLink.url.includes(".mp4") ? "iframe" : "react-player");
    }
  };

  const handlePlayEpisode = async (ep) => {
    setSelectedEpisode(ep);
    setVideoLoading(true);
    setVideoUrl("");
    setAvailableLangs([]);
    setAvailableServers([]);
    try {
      const res = await fetch(API_URL + "/anime/episode?url=" + encodeURIComponent(ep.url) + "&apiKey=" + API_KEY);
      const data = await res.json();
      if (data.success && data.data && data.data.streamLinks) {
        const hasStreams = Object.values(data.data.streamLinks).some(arr => arr && arr.length > 0);
        if (hasStreams) { processStreamData(data.data.streamLinks, data.data.downloadLinks || {}); }
        else { const fb = await tryFallbackProviders(ep.number); if (fb) processStreamData(fb.streamLinks, fb.downloadLinks); }
      } else { const fb = await tryFallbackProviders(ep.number); if (fb) processStreamData(fb.streamLinks, fb.downloadLinks); }
    } catch (e) { console.error(e); const fb = await tryFallbackProviders(ep.number); if (fb) processStreamData(fb.streamLinks, fb.downloadLinks); }
    setVideoLoading(false);
  };

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    const links = allStreamLinks[lang] || [];
    setAvailableServers(links);
    setSelectedServer(0);
    if (links.length > 0) selectStream(links, 0);
    else setVideoUrl("");
    if (allDownloadLinks[lang]) setDownloadLinks(allDownloadLinks[lang]);
  };

  const handleServerChange = (index) => { setSelectedServer(index); selectStream(availableServers, index); };

  const handleDownload = () => {
    if (!selectedEpisode || downloadLinks.length === 0) { alert("No hay enlaces de descarga disponibles."); return; }
    window.open(downloadLinks[0].url, "_blank");
  };

  if (loading) return <div style={{ color: "white", textAlign: "center", marginTop: "5rem" }}>Cargando información del anime...</div>;
  if (!anime) return <div style={{ color: "white", textAlign: "center", marginTop: "5rem" }}>Anime no encontrado</div>;

  const displayImage = kitsuImage || anime.image || "https://via.placeholder.com/220x330/1a1a1a/e83e8c?text=" + encodeURIComponent(anime.title.substring(0,3));
  const displayBanner = kitsuBanner || anime.backdrop || "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-nUPQCGj3f69B.jpg";

  return (
    <div className="anime-details-page">
      <div className="anime-banner" style={{ backgroundImage: "url(" + displayBanner + ")" }}>
        <div className="banner-overlay"></div>
      </div>
      <div className="anime-content-wrapper">
        <div className="anime-header">
          <img src={displayImage} alt={anime.title} className="anime-poster" />
          <div className="anime-info">
            <h1 className="anime-title-main">{anime.title}</h1>
            <div className="anime-meta">
              {anime.score && <span className="meta-item"><Star size={16} color="gold" /> {anime.score}</span>}
              {anime.startDate && <span className="meta-item"><Calendar size={16} /> {new Date(anime.startDate).getFullYear()}</span>}
              {anime.type && <span className="meta-item tag-glass">{anime.type}</span>}
            </div>
            <div className="anime-genres">
              {anime.genres && anime.genres.map(g => <span key={g.name} className="genre-tag">{g.name}</span>)}
            </div>
            <p className="anime-synopsis">{anime.description || "Sin descripción disponible."}</p>
          </div>
        </div>

        {selectedEpisode && (
          <div className="player-section glass" ref={playerRef}>
            <div className="player-header">
              <h3>Estás viendo: {selectedEpisode.title}</h3>
              <button className="download-btn" onClick={handleDownload}><Download size={18} /> Descargar</button>
            </div>
            <div className="player-controls">
              {availableLangs.length > 1 && (
                <div className="control-group">
                  <Globe size={16} /><span className="control-label">Idioma:</span>
                  {availableLangs.map(lang => (
                    <button key={lang} className={"control-btn " + (selectedLang === lang ? "control-btn-active" : "")} onClick={() => handleLangChange(lang)}>
                      {lang === "SUB" ? "Subtitulado" : lang === "LAT" ? "Latino" : lang}
                    </button>
                  ))}
                </div>
              )}
              {availableServers.length > 1 && (
                <div className="control-group">
                  <Server size={16} /><span className="control-label">Servidor:</span>
                  {availableServers.map((srv, i) => (
                    <button key={i} className={"control-btn " + (selectedServer === i ? "control-btn-active" : "")} onClick={() => handleServerChange(i)}>
                      {srv.server || "Servidor " + (i + 1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="player-wrapper">
              {videoLoading ? (
                <div style={{color:"white", display:"flex", justifyContent:"center", alignItems:"center", height:"100%"}}>Cargando stream HD... (Buscando en múltiples servidores)</div>
              ) : videoUrl ? (
                videoType === "iframe" ? (
                  <iframe src={videoUrl} allowFullScreen width="100%" height="100%" frameBorder="0" style={{ position: "absolute", top: 0, left: 0 }} sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
                ) : (
                  <ReactPlayer url={videoUrl} controls width="100%" height="100%" playing className="react-player" />
                )
              ) : (
                <div style={{color:"white", display:"flex", justifyContent:"center", alignItems:"center", height:"100%", flexDirection:"column", gap:"0.5rem"}}>
                  <span>No se encontraron streams disponibles.</span>
                  <span style={{fontSize:"0.85rem", color:"#b9a9b2"}}>Intenta con otro servidor o episodio.</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="episodes-section">
          <h2 className="section-title">Lista de Episodios ({anime.episodes ? anime.episodes.length : 0})</h2>
          <div className="episodes-grid">
            {anime.episodes && anime.episodes.map((ep) => (
              <div key={ep.url} className={"episode-card glass " + (selectedEpisode?.url === ep.url ? "playing" : "")} onClick={() => handlePlayEpisode(ep)}>
                <div className="ep-thumbnail"><PlayCircle size={32} className="play-icon" /></div>
                <div className="ep-info"><span className="ep-num">Episodio {ep.number}</span><span className="ep-title">{ep.title}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
