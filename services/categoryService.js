import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "../repository/categoryRepository.js";
import { ConflictError } from "../error/conflictError.js";

export const addCategory = async (data) => {
  const { slug } = data;

  // Slug must be unique
  const existing = await getCategoryBySlug(slug);

  if (existing) {
    throw new ConflictError("Category slug already exists");
  }

  const category = await createCategory(data);

  return {
    status: 201,
    message: "Category created successfully",
    category,
  };
};

export const getCategories = async () => {
  const categories = await getAllCategories();

  return {
    status: 200,
    message: "Categories fetched successfully",
    categories,
  };
};

export const getCategory = async (id) => {
  const category = await getCategoryById(id);

  return {
    status: 200,
    message: "Category fetched successfully",
    category,
  };
};

export const editCategory = async (id, data) => {
  // Slug must stay unique when updated
  if (data.slug) {
    const existing = await getCategoryBySlug(data.slug);

    if (existing && existing.id !== id) {
      throw new ConflictError("Category slug already exists");
    }
  }

  const category = await updateCategory(id, data);

  return {
    status: 200,
    message: "Category updated successfully",
    category,
  };
};

export const removeCategory = async (id) => {
  await deleteCategory(id);

  return {
    status: 200,
    message: "Category deleted successfully",
  };
};
