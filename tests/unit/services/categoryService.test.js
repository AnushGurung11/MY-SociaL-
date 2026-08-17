import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../repository/categoryRepository.js", () => ({
  createCategory: jest.fn(),
  getAllCategories: jest.fn(),
  getCategoryById: jest.fn(),
  getCategoryBySlug: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
}));

const {
  addCategory,
  getCategories,
  getCategory,
  editCategory,
  removeCategory,
} = await import("../../../services/categoryService.js");
const categoryRepository =
  await import("../../../repository/categoryRepository.js");
const { ConflictError } = await import("../../../error/conflictError.js");

const mockCategory = { id: "cat-1", name: "Electronics", slug: "electronics" };

describe("Category Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addCategory", () => {
    it("creates a category when the slug is free", async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(null);
      categoryRepository.createCategory.mockResolvedValue(mockCategory);

      const result = await addCategory({
        name: "Electronics",
        slug: "electronics",
      });

      expect(categoryRepository.createCategory).toHaveBeenCalledWith({
        name: "Electronics",
        slug: "electronics",
      });
      expect(result).toMatchObject({
        status: 201,
        message: "Category created successfully",
        category: mockCategory,
      });
    });

    it("throws ConflictError when the slug already exists", async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(mockCategory);

      await expect(
        addCategory({ name: "Electronics", slug: "electronics" }),
      ).rejects.toThrow(ConflictError);
      expect(categoryRepository.createCategory).not.toHaveBeenCalled();
    });
  });

  describe("getCategories", () => {
    it("returns all categories", async () => {
      categoryRepository.getAllCategories.mockResolvedValue([mockCategory]);

      const result = await getCategories();

      expect(result).toMatchObject({
        status: 200,
        message: "Categories fetched successfully",
        categories: [mockCategory],
      });
    });
  });

  describe("getCategory", () => {
    it("returns the category by id", async () => {
      categoryRepository.getCategoryById.mockResolvedValue(mockCategory);

      const result = await getCategory("cat-1");

      expect(categoryRepository.getCategoryById).toHaveBeenCalledWith("cat-1");
      expect(result.category).toEqual(mockCategory);
    });

    it("propagates NotFoundError when the category is missing", async () => {
      categoryRepository.getCategoryById.mockRejectedValue(
        new Error("Category not found"),
      );

      await expect(getCategory("missing")).rejects.toThrow(
        "Category not found",
      );
    });
  });

  describe("editCategory", () => {
    it("updates the category", async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(null);
      categoryRepository.updateCategory.mockResolvedValue({
        ...mockCategory,
        name: "Gadgets",
      });

      const result = await editCategory("cat-1", { name: "Gadgets" });

      expect(categoryRepository.updateCategory).toHaveBeenCalledWith("cat-1", {
        name: "Gadgets",
      });
      expect(result).toMatchObject({
        status: 200,
        message: "Category updated successfully",
      });
    });

    it("throws ConflictError when updating to an existing slug", async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue({
        ...mockCategory,
        id: "cat-2",
      });

      await expect(
        editCategory("cat-1", { slug: "electronics" }),
      ).rejects.toThrow(ConflictError);
      expect(categoryRepository.updateCategory).not.toHaveBeenCalled();
    });

    it("allows keeping the same slug", async () => {
      categoryRepository.getCategoryBySlug.mockResolvedValue(mockCategory);
      categoryRepository.updateCategory.mockResolvedValue(mockCategory);

      const result = await editCategory("cat-1", { slug: "electronics" });

      expect(categoryRepository.updateCategory).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });
  });

  describe("removeCategory", () => {
    it("deletes the category", async () => {
      categoryRepository.deleteCategory.mockResolvedValue(mockCategory);

      const result = await removeCategory("cat-1");

      expect(categoryRepository.deleteCategory).toHaveBeenCalledWith("cat-1");
      expect(result).toMatchObject({
        status: 200,
        message: "Category deleted successfully",
      });
    });
  });
});
