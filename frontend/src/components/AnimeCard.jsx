import React, { useState, useEffect } from 'react';
import './AnimeCard.css';

const AnimeCard = ({ title, image, isFeatured }) => {
  const [imgSrc, setImgSrc] = useState(image);

  useEffect(() => {
    // Si la imagen ya existe y no es nula, la usamos.
    if (image) {
      setImgSrc(image);
      return;
    }

    // Si la imagen es nula, hacemos un fallback a Kitsu API 
    // para obtener una caratula oficial basada en el título (tiene limites mucho mas altos).
    let isMounted = true;
    const fetchImage = async () => {
      try {
        const res = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(title)}&page[limit]=1`);
        const data = await res.json();
        if (isMounted && data.data && data.data.length > 0 && data.data[0].attributes && data.data[0].attributes.posterImage) {
          setImgSrc(data.data[0].attributes.posterImage.large || data.data[0].attributes.posterImage.original);
        } else if (isMounted) {
          setImgSrc('https://via.placeholder.com/220x330/1a1a1a/e83e8c?text=' + encodeURIComponent(title.substring(0, 3).toUpperCase()));
        }
      } catch (e) {
        console.error("Error fetching image fallback:", e);
        if (isMounted) {
          setImgSrc('https://via.placeholder.com/220x330/1a1a1a/e83e8c?text=' + encodeURIComponent(title.substring(0, 3).toUpperCase()));
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [title, image]);

  return (
    <div className={`anime-card ${isFeatured ? 'featured' : ''}`}>
      <div className="card-image-wrapper">
        <img src={imgSrc} alt={title} className="card-image" />
        {isFeatured && (
          <div className="card-overlay">
            <h3 className="card-title-overlay">{title}</h3>
            <button className="watch-btn">Ver ahora</button>
          </div>
        )}
      </div>
      {!isFeatured && <h4 className="card-title-bottom">{title}</h4>}
    </div>
  );
};

export default AnimeCard;
