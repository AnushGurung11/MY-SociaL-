import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = await import("../../../repository/categoryRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const mockCategory = { id: "cat-1", name: "Electronics", slug: "electronics" };

describe("Category Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("creates and returns a category", async () => {
      prisma.category.create.mockResolvedValue(mockCategory);

      const result = await createCategory({
        name: "Electronics",
        slug: "electronics",
      });

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: "Electronics", slug: "electronics" },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe("getAllCategories", () => {
    it("returns categories sorted by name", async () => {
      prisma.category.findMany.mockResolvedValue([mockCategory]);

      const result = await getAllCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
      expect(result).toEqual([mockCategory]);
    });
  });

  describe("getCategoryById", () => {
    it("returns the category when it exists", async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await getCategoryById("cat-1");

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: "cat-1" },
      });
      expect(result).toEqual(mockCategory);
    });

    it("throws NotFoundError when the category does not exist", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(getCategoryById("missing")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getCategoryBySlug", () => {
    it("returns the category or null for a slug", async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await getCategoryBySlug("electronics");

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { slug: "electronics" },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe("updateCategory", () => {
    it("updates an existing category", async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.update.mockResolvedValue({
        ...mockCategory,
        name: "Gadgets",
      });

      const result = await updateCategory("cat-1", { name: "Gadgets" });

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: "cat-1" },
        data: { name: "Gadgets" },
      });
      expect(result.name).toBe("Gadgets");
    });

    it("throws NotFoundError when updating a missing category", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(
        updateCategory("missing", { name: "Gadgets" }),
      ).rejects.toThrow(NotFoundError);
      expect(prisma.category.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteCategory", () => {
    it("deletes an existing category", async () => {
      prisma.category.findUnique.mockResolvedValue(mockCategory);
      prisma.category.delete.mockResolvedValue(mockCategory);

      const result = await deleteCategory("cat-1");

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: "cat-1" },
      });
      expect(result).toEqual(mockCategory);
    });

    it("throws NotFoundError when deleting a missing category", async () => {
      prisma.category.findUnique.mockResolvedValue(null);

      await expect(deleteCategory("missing")).rejects.toThrow(NotFoundError);
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });
  });
});
