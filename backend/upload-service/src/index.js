const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const multer = require('multer');

const { createServiceApp } = require('@yeahmusic/common/serviceApp');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4004;
const SERVICE = 'upload-service';
const MEDIA_DIR = process.env.MEDIA_DIR || '/var/lib/yeahmusic/uploads';
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 50 * 1024 * 1024);

fs.mkdirSync(MEDIA_DIR, { recursive: true });

const { app } = createServiceApp({ serviceName: SERVICE });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MEDIA_DIR),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase() || '.bin';
    cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (req, file, cb) => {
    if (!String(file.mimetype || '').startsWith('audio/')) {
      return cb(new Error('Only audio files are allowed.'));
    }
    return cb(null, true);
  }
});

let queueDepth = 0;

app.use('/media', expressStatic(MEDIA_DIR));

app.get('/queue', (req, res) => {
  res.json({ depth: queueDepth });
});

app.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'FILE_REQUIRED', message: 'Audio file is required.' });
    }

    queueDepth += 1;
    setTimeout(() => {
      queueDepth = Math.max(0, queueDepth - 1);
    }, 1000);

    const audioId = req.file.filename;
    res.status(201).json({
      accepted: true,
      audioId,
      audioUrl: `/api/uploads/media/${encodeURIComponent(audioId)}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
});

function expressStatic(directory) {
  const express = require('express');
  return express.static(directory, {
    fallthrough: false,
    immutable: true,
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  });
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`${SERVICE} listening on :${PORT}`);
});
