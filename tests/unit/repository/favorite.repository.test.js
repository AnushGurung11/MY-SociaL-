import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    favorite: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const {
  createFavorite,
  getFavorite,
  deleteFavorite,
  getFavoritesByUser,
  getFavoriteOrFail,
} = await import("../../../repository/favoriteRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const compositeKey = {
  user_id_listing_id: { user_id: "user-1", listing_id: "listing-1" },
};

const mockFavorite = {
  user_id: "user-1",
  listing_id: "listing-1",
  created_at: new Date(),
  listing: { id: "listing-1", title: "Used iPhone 14" },
};

describe("Favorite Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createFavorite", () => {
    it("creates and returns a favorite", async () => {
      prisma.favorite.create.mockResolvedValue(mockFavorite);

      const result = await createFavorite({
        user_id: "user-1",
        listing_id: "listing-1",
      });

      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: { user_id: "user-1", listing_id: "listing-1" },
      });
      expect(result).toEqual(mockFavorite);
    });
  });

  describe("getFavorite", () => {
    it("returns the favorite for the composite key", async () => {
      prisma.favorite.findUnique.mockResolvedValue(mockFavorite);

      const result = await getFavorite("user-1", "listing-1");

      expect(prisma.favorite.findUnique).toHaveBeenCalledWith({
        where: compositeKey,
      });
      expect(result).toEqual(mockFavorite);
    });

    it("returns null when the favorite does not exist", async () => {
      prisma.favorite.findUnique.mockResolvedValue(null);

      const result = await getFavorite("user-1", "listing-1");

      expect(result).toBeNull();
    });
  });

  describe("deleteFavorite", () => {
    it("deletes the favorite for the composite key", async () => {
      prisma.favorite.delete.mockResolvedValue(mockFavorite);

      const result = await deleteFavorite("user-1", "listing-1");

      expect(prisma.favorite.delete).toHaveBeenCalledWith({
        where: compositeKey,
      });
      expect(result).toEqual(mockFavorite);
    });
  });

  describe("getFavoritesByUser", () => {
    it("returns favorites of a user with the listing relation", async () => {
      prisma.favorite.findMany.mockResolvedValue([mockFavorite]);

      const result = await getFavoritesByUser("user-1");

      expect(prisma.favorite.findMany).toHaveBeenCalledWith({
        where: { user_id: "user-1" },
        include: { listing: true },
        orderBy: { created_at: "desc" },
      });
      expect(result).toEqual([mockFavorite]);
      expect(result[0].listing.title).toBe("Used iPhone 14");
    });
  });

  describe("getFavoriteOrFail", () => {
    it("returns the favorite when it exists", async () => {
      prisma.favorite.findUnique.mockResolvedValue(mockFavorite);

      const result = await getFavoriteOrFail("user-1", "listing-1");

      expect(result).toEqual(mockFavorite);
    });

    it("throws NotFoundError when the favorite does not exist", async () => {
      prisma.favorite.findUnique.mockResolvedValue(null);

      await expect(getFavoriteOrFail("user-1", "listing-1")).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
