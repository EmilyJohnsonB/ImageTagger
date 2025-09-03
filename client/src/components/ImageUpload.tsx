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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesUpload(Array.from(files));
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    setUploading(true);
    setError('');

    const formData = new FormData();
    files.forEach(file => {
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
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Images</h2>
      
      <div
        className={`upload-area ${uploading ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          className="file-input"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="loading">Uploading...</div>
        ) : (
          <div>
            <p>Click to select files or drag and drop images here</p>
            <button className="upload-btn">Choose Files</button>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {uploadedFiles.length > 0 && (
        <div>
          <h3>Recently Uploaded</h3>
          <div className="image-grid">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="image-card">
                <img
                  src={file.path}
                  alt={file.originalName}
                />
                <div className="image-info">
                  <p className="image-name">{file.originalName}</p>
                  <p className="image-size">{Math.round(file.size / 1024)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;