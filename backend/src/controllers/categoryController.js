function createCategoryController({ categoryService }) {
  async function create(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.categoryInput.categoryName);
      return res.status(201).json({ category });
    } catch (error) {
      return next(error);
    }
  }

  async function list(req, res, next) {
    try {
      const { page, pageSize, offset } = req.pagination;
      const { categories, total } = await categoryService.listCategories({
        limit: pageSize,
        offset,
      });
      return res.json({
        categories,
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
      const category = await categoryService.getCategoryById(req.categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      return res.json({ category });
    } catch (error) {
      return next(error);
    }
  }

  async function update(req, res, next) {
    try {
      const category = await categoryService.updateCategory(
        req.categoryId,
        req.categoryInput.categoryName,
      );
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      return res.json({ category });
    } catch (error) {
      return next(error);
    }
  }

  async function remove(req, res, next) {
    try {
      const category = await categoryService.deleteCategory(req.categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }
      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }

  return { create, list, getById, update, remove };
}

module.exports = { createCategoryController };
