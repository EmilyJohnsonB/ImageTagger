const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ImageModel = require('../models/imageModel');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const imageData = {
        filename: file.filename,
        originalName: file.originalname,
        filePath: `/uploads/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype
      };

      const savedImage = await ImageModel.create(imageData);
      
      return {
        id: savedImage.id,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        path: `/uploads/${file.filename}`,
        uploadDate: new Date()
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({ 
      message: 'Files uploaded successfully',
      files: uploadedFiles 
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Get all images
router.get('/images', async (req, res) => {
  try {
    const images = await ImageModel.findAll();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images: ' + error.message });
  }
});

// Delete image
router.delete('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get image info first
    const image = await ImageModel.findById(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../uploads', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await ImageModel.deleteById(id);
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image: ' + error.message });
  }
});

module.exports = router;