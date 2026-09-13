function createAuthorController({ authorService }) {
  async function create(req, res, next) {
    try {
      const author = await authorService.createAuthor(req.authorInput);
      return res.status(201).json({ author });
    } catch (error) {
      return next(error);
    }
  }

  async function list(req, res, next) {
    try {
      const { page, pageSize, offset } = req.pagination;
      const { authors, total } = await authorService.listAuthors({
        limit: pageSize,
        offset,
      });

      return res.json({
        authors,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async function getById(req, res, next) {
    try {
      const author = await authorService.getAuthorById(req.authorId);
      if (!author) {
        return res.status(404).json({ message: 'Author not found.' });
      }
      return res.json({ author });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      const author = await authorService.updateAuthor(req.authorId, req.authorInput);
      if (!author) {
        return res.status(404).json({ message: 'Author not found.' });
      }
      return res.json({ author });
    } catch (error) {
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      const author = await authorService.deleteAuthor(req.authorId);
      if (!author) {
        return res.status(404).json({ message: 'Author not found.' });
      }
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }

  return { create, list, getById, update, remove };
}

module.exports = { createAuthorController };
