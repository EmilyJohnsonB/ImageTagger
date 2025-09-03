const db = require('./database');

class TagModel {
  static create(tagName) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT OR IGNORE INTO tags (name) VALUES (?)`;
      
      db.run(sql, [tagName.toLowerCase()], function(err) {
        if (err) {
          reject(err);
        } else {
          // Get the tag ID (either newly created or existing)
          TagModel.findByName(tagName.toLowerCase())
            .then(tag => resolve(tag))
            .catch(reject);
        }
      });
    });
  }

  static findByName(name) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tags WHERE name = ?`;
      
      db.get(sql, [name.toLowerCase()], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM tags ORDER BY name`;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static addToImage(imageId, tagId) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT OR IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)`;
      
      db.run(sql, [imageId, tagId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static removeFromImage(imageId, tagId) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM image_tags WHERE image_id = ? AND tag_id = ?`;
      
      db.run(sql, [imageId, tagId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static getImageTags(imageId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT t.id, t.name 
        FROM tags t 
        JOIN image_tags it ON t.id = it.tag_id 
        WHERE it.image_id = ?
        ORDER BY t.name
      `;
      
      db.all(sql, [imageId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static getImagesWithTags() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT i.*, 
               GROUP_CONCAT(t.name) as tags
        FROM images i
        LEFT JOIN image_tags it ON i.id = it.image_id
        LEFT JOIN tags t ON it.tag_id = t.id
        GROUP BY i.id
        ORDER BY i.upload_date DESC
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Convert comma-separated tags to array
          const images = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          }));
          resolve(images);
        }
      });
    });
  }

  static searchImagesByTag(tagName) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT DISTINCT i.*, 
               GROUP_CONCAT(t.name) as tags
        FROM images i
        JOIN image_tags it ON i.id = it.image_id
        JOIN tags t1 ON it.tag_id = t1.id
        LEFT JOIN image_tags it2 ON i.id = it2.image_id
        LEFT JOIN tags t ON it2.tag_id = t.id
        WHERE t1.name LIKE ?
        GROUP BY i.id
        ORDER BY i.upload_date DESC
      `;
      
      db.all(sql, [`%${tagName.toLowerCase()}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const images = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          }));
          resolve(images);
        }
      });
    });
  }
}

module.exports = TagModel;