import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';

function App() {
  const [currentTab, setCurrentTab] = useState<'upload' | 'gallery'>('gallery');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid #eee' }}>
        <h1>Image Tagger</h1>
        <p style={{ color: '#666' }}>Organize your images with tags</p>
        
        <nav style={{ marginTop: '20px' }}>
          <button
            onClick={() => setCurrentTab('gallery')}
            style={{
              background: currentTab === 'gallery' ? '#0969da' : 'none',
              color: currentTab === 'gallery' ? 'white' : '#0969da',
              border: '1px solid #0969da',
              padding: '8px 16px',
              marginRight: '10px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Gallery
          </button>
          <button
            onClick={() => setCurrentTab('upload')}
            style={{
              background: currentTab === 'upload' ? '#0969da' : 'none',
              color: currentTab === 'upload' ? 'white' : '#0969da',
              border: '1px solid #0969da',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Upload
          </button>
        </nav>
      </header>
      
      <main>
        {currentTab === 'upload' ? <ImageUpload /> : <ImageGallery />}
      </main>
    </div>
  );
}

export default App;