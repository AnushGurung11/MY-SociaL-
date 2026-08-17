import { prisma } from "../config/dbConfig.js";
import { NotFoundError } from "../error/notFoundError.js";

export const createCategory = async (data) => {
  const category = await prisma.category.create({ data });
  return category;
};

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return categories;
};

export const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};

export const getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findUnique({ where: { slug } });
  return category;
};

export const updateCategory = async (id, data) => {
  await getCategoryById(id);

  const category = await prisma.category.update({ where: { id }, data });
  return category;
};

export const deleteCategory = async (id) => {
  await getCategoryById(id);

  const category = await prisma.category.delete({ where: { id } });
  return category;
};
