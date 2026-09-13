function createAuthorService({ authorModel }) {
  async function createAuthor(authorInput) {
    return authorModel.create(authorInput);
  }

  async function listAuthors({ limit, offset }) {
    const [authors, total] = await Promise.all([
      authorModel.findPage({ limit, offset }),
      authorModel.countAll(),
    ]);

    return { authors, total: Number(total) };
  }

  async function getAuthorById(authorId) {
    return authorModel.findById(authorId);
  }

  async function updateAuthor(authorId, authorInput) {
    return authorModel.update(authorId, authorInput);
  }

  async function deleteAuthor(authorId) {
    return authorModel.remove(authorId);
  }

  return {
    createAuthor,
    listAuthors,
    getAuthorById,
    updateAuthor,
    deleteAuthor,
  };
}

module.exports = { createAuthorService };
