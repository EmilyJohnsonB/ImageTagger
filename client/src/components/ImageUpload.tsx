import React, { useState } from 'react';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  path: string;
}

const ImageUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedFiles(prev => [...prev, ...result.files]);
    } catch (err) {
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Upload Images</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ marginBottom: '10px' }}
        />
        {uploading && <p>Uploading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {uploadedFiles.length > 0 && (
        <div>
          <h3>Uploaded Images</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {uploadedFiles.map((file) => (
              <div key={file.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                <img
                  src={file.path}
                  alt={file.originalName}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '8px' }}
                />
                <p style={{ fontSize: '12px', margin: '0' }}>{file.originalName}</p>
                <p style={{ fontSize: '10px', color: '#666', margin: '0' }}>
                  {Math.round(file.size / 1024)} KB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;