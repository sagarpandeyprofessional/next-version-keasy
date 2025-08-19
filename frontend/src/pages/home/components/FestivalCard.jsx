import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FestivalCard = ({ id, title, image, description, date, location, href }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Fallback placeholder image URL (you can customize this)
  const placeholderImage = `https://via.placeholder.com/400x300?text=Festival+${id}`;

  const imageUrl = imageError ? placeholderImage : image;

  return (
    <div className="festival-card" style={{
      width: '100%',
      maxWidth: '300px',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      margin: '1rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ position: 'relative', height: '180px', width: '100%' }}>
        <img
          src={imageUrl}
          alt={title}
          onError={handleImageError}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: 'black',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Upcoming
        </div>
      </div>

      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#111' }}>{title}</h3>
        <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.75rem' }}>
          <div><strong>Date:</strong> {date}</div>
          <div><strong>Location:</strong> {location}</div>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#444', marginBottom: '1rem', minHeight: '3rem' }}>{description}</p>
        <a
          href={href}
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
            textAlign: 'center'
          }}
        >
          View Details
        </a>
      </div>
    </div>
  );
};

FestivalCard.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default FestivalCard;
