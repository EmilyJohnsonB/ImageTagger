import React, { useState, useEffect } from 'react';

interface Image {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  description?: string;
  tags?: string[];
}

interface Tag {
  id: number;
  name: string;
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTag, setSearchTag] = useState<string>('');
  const [newTag, setNewTag] = useState<string>('');
  const [editingImage, setEditingImage] = useState<number | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags/images');
      
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

  const addTag = async (imageId: number, tagName: string) => {
    try {
      const response = await fetch(`/api/tags/image/${imageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tagName }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tag');
      }

      fetchImages(); // Refresh the images to show new tags
      setNewTag('');
      setEditingImage(null);
    } catch (err) {
      setError('Failed to add tag');
      console.error('Error adding tag:', err);
    }
  };

  const searchByTag = async () => {
    if (!searchTag.trim()) {
      fetchImages();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/tags/search/${encodeURIComponent(searchTag)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search images');
      }

      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError('Failed to search images');
      console.error('Error searching images:', err);
    } finally {
      setLoading(false);
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by tag..."
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchByTag()}
            style={{
              padding: '6px 12px',
              border: '1px solid #d0d7de',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button className="upload-btn" onClick={searchByTag}>
            Search
          </button>
          <button className="upload-btn" onClick={fetchImages}>
            Clear
          </button>
        </div>
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
                
                {/* Display existing tags */}
                {image.tags && image.tags.length > 0 && (
                  <div style={{ margin: '8px 0' }}>
                    {image.tags.map((tag, index) => (
                      <span 
                        key={index}
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          marginRight: '4px',
                          marginBottom: '2px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Add tag input */}
                {editingImage === image.id ? (
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newTag.trim()) {
                          addTag(image.id, newTag.trim());
                        }
                      }}
                      style={{
                        padding: '4px 6px',
                        border: '1px solid #d0d7de',
                        borderRadius: '4px',
                        fontSize: '12px',
                        width: '100%',
                        marginBottom: '4px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={() => newTag.trim() && addTag(image.id, newTag.trim())}
                        style={{
                          background: '#0969da',
                          border: 'none',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Add
                      </button>
                      <button 
                        onClick={() => {
                          setEditingImage(null);
                          setNewTag('');
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #d0d7de',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setEditingImage(image.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #d0d7de',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      + Tag
                    </button>
                    <button 
                      onClick={() => deleteImage(image.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #d0d7de',
                        color: '#cf222e',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;