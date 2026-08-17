import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    like: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const { createLike, getLike, deleteLike, countLikesByListing, getLikeOrFail } =
  await import("../../../repository/likeRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const compositeKey = {
  listing_id_user_id: { listing_id: "listing-1", user_id: "user-1" },
};

const mockLike = {
  listing_id: "listing-1",
  user_id: "user-1",
  created_at: new Date(),
};

describe("Like Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLike", () => {
    it("creates and returns a like", async () => {
      prisma.like.create.mockResolvedValue(mockLike);

      const result = await createLike({
        listing_id: "listing-1",
        user_id: "user-1",
      });

      expect(prisma.like.create).toHaveBeenCalledWith({
        data: { listing_id: "listing-1", user_id: "user-1" },
      });
      expect(result).toEqual(mockLike);
    });
  });

  describe("getLike", () => {
    it("returns the like for the composite key", async () => {
      prisma.like.findUnique.mockResolvedValue(mockLike);

      const result = await getLike("listing-1", "user-1");

      expect(prisma.like.findUnique).toHaveBeenCalledWith({
        where: compositeKey,
      });
      expect(result).toEqual(mockLike);
    });

    it("returns null when the like does not exist", async () => {
      prisma.like.findUnique.mockResolvedValue(null);

      const result = await getLike("listing-1", "user-1");

      expect(result).toBeNull();
    });
  });

  describe("deleteLike", () => {
    it("deletes the like for the composite key", async () => {
      prisma.like.delete.mockResolvedValue(mockLike);

      const result = await deleteLike("listing-1", "user-1");

      expect(prisma.like.delete).toHaveBeenCalledWith({ where: compositeKey });
      expect(result).toEqual(mockLike);
    });
  });

  describe("countLikesByListing", () => {
    it("returns the like count of a listing", async () => {
      prisma.like.count.mockResolvedValue(5);

      const result = await countLikesByListing("listing-1");

      expect(prisma.like.count).toHaveBeenCalledWith({
        where: { listing_id: "listing-1" },
      });
      expect(result).toBe(5);
    });
  });

  describe("getLikeOrFail", () => {
    it("returns the like when it exists", async () => {
      prisma.like.findUnique.mockResolvedValue(mockLike);

      const result = await getLikeOrFail("listing-1", "user-1");

      expect(result).toEqual(mockLike);
    });

    it("throws NotFoundError when the like does not exist", async () => {
      prisma.like.findUnique.mockResolvedValue(null);

      await expect(getLikeOrFail("listing-1", "user-1")).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
