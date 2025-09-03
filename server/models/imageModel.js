const db = require('./database');

class ImageModel {
  static create(imageData) {
    return new Promise((resolve, reject) => {
      const { filename, originalName, filePath, fileSize, mimeType, description = '' } = imageData;
      
      const sql = `INSERT INTO images (filename, original_name, file_path, file_size, mime_type, description)
                   VALUES (?, ?, ?, ?, ?, ?)`;
      
      db.run(sql, [filename, originalName, filePath, fileSize, mimeType, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...imageData });
        }
      });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM images ORDER BY upload_date DESC`;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM images WHERE id = ?`;
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static deleteById(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM images WHERE id = ?`;
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static updateDescription(id, description) {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE images SET description = ? WHERE id = ?`;
      
      db.run(sql, [description, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
}

module.exports = ImageModel;