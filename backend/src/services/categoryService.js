 
function createCategoryService({ categoryModel }) {
  async function createCategory(categoryName) {
    return categoryModel.create(categoryName);
  }

  async function listCategories({ limit, offset }) {
    const [categories, total] = await Promise.all([
      categoryModel.findPage({ limit, offset }),
      categoryModel.countAll(),
    ]);

    return { categories, total: Number(total) };
  }

  async function getCategoryById(categoryId) {
    return categoryModel.findById(categoryId);
  }

  async function updateCategory(categoryId, categoryName) {
    return categoryModel.update(categoryId, categoryName);
  }

  async function deleteCategory(categoryId) {
    return categoryModel.remove(categoryId);
  }

  return {
    createCategory,
    listCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
  };
}

module.exports = { createCategoryService };
