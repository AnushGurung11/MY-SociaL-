import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    listingMedia: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const {
  createListingMedia,
  getMediaByListing,
  countMediaByListing,
  getListingMediaById,
  updateListingMedia,
  deleteListingMedia,
} = await import("../../../repository/listingMediaRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const mockMedia = {
  id: "media-1",
  listing_id: "listing-1",
  media_type: "image",
  position: 1,
};

describe("ListingMedia Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createListingMedia", () => {
    it("creates and returns media", async () => {
      prisma.listingMedia.create.mockResolvedValue(mockMedia);

      const result = await createListingMedia({
        listing_id: "listing-1",
        media_type: "image",
        position: 1,
      });

      expect(prisma.listingMedia.create).toHaveBeenCalledWith({
        data: { listing_id: "listing-1", media_type: "image", position: 1 },
      });
      expect(result).toEqual(mockMedia);
    });
  });

  describe("getMediaByListing", () => {
    it("returns media of a listing ordered by position", async () => {
      prisma.listingMedia.findMany.mockResolvedValue([mockMedia]);

      const result = await getMediaByListing("listing-1");

      expect(prisma.listingMedia.findMany).toHaveBeenCalledWith({
        where: { listing_id: "listing-1" },
        orderBy: { position: "asc" },
      });
      expect(result).toEqual([mockMedia]);
    });
  });

  describe("countMediaByListing", () => {
    it("returns the number of media of a listing", async () => {
      prisma.listingMedia.count.mockResolvedValue(3);

      const result = await countMediaByListing("listing-1");

      expect(prisma.listingMedia.count).toHaveBeenCalledWith({
        where: { listing_id: "listing-1" },
      });
      expect(result).toBe(3);
    });
  });

  describe("getListingMediaById", () => {
    it("returns media when it exists", async () => {
      prisma.listingMedia.findUnique.mockResolvedValue(mockMedia);

      const result = await getListingMediaById("media-1");

      expect(result).toEqual(mockMedia);
    });

    it("throws NotFoundError when media does not exist", async () => {
      prisma.listingMedia.findUnique.mockResolvedValue(null);

      await expect(getListingMediaById("missing")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("updateListingMedia", () => {
    it("updates existing media", async () => {
      prisma.listingMedia.findUnique.mockResolvedValue(mockMedia);
      prisma.listingMedia.update.mockResolvedValue({
        ...mockMedia,
        position: 2,
      });

      const result = await updateListingMedia("media-1", { position: 2 });

      expect(prisma.listingMedia.update).toHaveBeenCalledWith({
        where: { id: "media-1" },
        data: { position: 2 },
      });
      expect(result.position).toBe(2);
    });

    it("throws NotFoundError when updating missing media", async () => {
      prisma.listingMedia.findUnique.mockResolvedValue(null);

      await expect(
        updateListingMedia("missing", { position: 2 }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteListingMedia", () => {
    it("deletes existing media", async () => {
      prisma.listingMedia.findUnique.mockResolvedValue(mockMedia);
      prisma.listingMedia.delete.mockResolvedValue(mockMedia);

      const result = await deleteListingMedia("media-1");

      expect(prisma.listingMedia.delete).toHaveBeenCalledWith({
        where: { id: "media-1" },
      });
      expect(result).toEqual(mockMedia);
    });

    it("throws NotFoundError when deleting missing media", async () => {
      prisma.listingMedia.findUnique.mockResolvedValue(null);

      await expect(deleteListingMedia("missing")).rejects.toThrow(
        NotFoundError,
      );
      expect(prisma.listingMedia.delete).not.toHaveBeenCalled();
    });
  });
});
