import React from 'react';
import ImageUpload from './components/ImageUpload';

function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid #eee' }}>
        <h1>Image Tagger</h1>
        <p style={{ color: '#666' }}>Organize your images with tags</p>
      </header>
      
      <main>
        <ImageUpload />
      </main>
    </div>
  );
}

export default App;