import React, { useState, useEffect } from 'react';

interface Image {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  description?: string;
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/upload/images');
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError('Failed to load images');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/upload/images/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      setError('Failed to delete image');
      console.error('Error deleting image:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="upload-container">
        <div className="loading">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="upload-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Image Gallery ({images.length} images)</h2>
        <button className="upload-btn" onClick={fetchImages}>
          Refresh
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#656d76' }}>
          <p>No images uploaded yet.</p>
          <p>Upload some images to get started!</p>
        </div>
      ) : (
        <div className="image-grid">
          {images.map((image) => (
            <div key={image.id} className="image-card">
              <img
                src={image.file_path}
                alt={image.original_name}
              />
              <div className="image-info">
                <p className="image-name">{image.original_name}</p>
                <p className="image-size">
                  {Math.round(image.file_size / 1024)} KB • {formatDate(image.upload_date)}
                </p>
                <div style={{ marginTop: '8px' }}>
                  <button 
                    onClick={() => deleteImage(image.id)}
                    style={{
                      background: 'none',
                      border: '1px solid #d0d7de',
                      color: '#cf222e',
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;