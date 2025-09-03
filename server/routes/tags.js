const express = require('express');
const TagModel = require('../models/tagModel');

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await TagModel.findAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags: ' + error.message });
  }
});

// Add tag to image
router.post('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { tagName } = req.body;

    if (!tagName || !tagName.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    // Create tag if it doesn't exist
    const tag = await TagModel.create(tagName.trim());
    
    // Associate tag with image
    await TagModel.addToImage(parseInt(imageId), tag.id);
    
    res.json({ message: 'Tag added successfully', tag });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add tag: ' + error.message });
  }
});

// Remove tag from image
router.delete('/image/:imageId/tag/:tagId', async (req, res) => {
  try {
    const { imageId, tagId } = req.params;
    
    await TagModel.removeFromImage(parseInt(imageId), parseInt(tagId));
    
    res.json({ message: 'Tag removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove tag: ' + error.message });
  }
});

// Get tags for specific image
router.get('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const tags = await TagModel.getImageTags(parseInt(imageId));
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch image tags: ' + error.message });
  }
});

// Get images with tags
router.get('/images', async (req, res) => {
  try {
    const images = await TagModel.getImagesWithTags();
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images with tags: ' + error.message });
  }
});

// Search images by tag
router.get('/search/:tagName', async (req, res) => {
  try {
    const { tagName } = req.params;
    const images = await TagModel.searchImagesByTag(tagName);
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search images: ' + error.message });
  }
});

module.exports = router;