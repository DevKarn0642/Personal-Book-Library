function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Uploaded files must not exceed 50 MB.' });
  }
  if (err.expose && err.status === 400) {
    return res.status(400).json({ message: err.message });
  }
  console.error('Request failed:', err.message);
  res.status(500).json({ message: 'Internal server error.' });
}

module.exports = { errorHandler };
