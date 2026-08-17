import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    listing: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const {
  createListing,
  getAllListings,
  getListingById,
  getListingsBySeller,
  updateListing,
  softDeleteListing,
} = await import("../../../repository/listingRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const mockListing = {
  id: "listing-1",
  seller_id: "user-1",
  title: "Used iPhone 14",
  category_id: "cat-1",
  original_price: 800,
  current_price: 750,
  status: "available",
  deleted_at: null,
  seller: { id: "user-1", username: "johnny" },
  category: { id: "cat-1", name: "Electronics" },
  media: [],
};

describe("Listing Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createListing", () => {
    it("creates and returns a listing", async () => {
      prisma.listing.create.mockResolvedValue(mockListing);

      const result = await createListing({ title: "Used iPhone 14" });

      expect(prisma.listing.create).toHaveBeenCalledWith({
        data: { title: "Used iPhone 14" },
      });
      expect(result).toEqual(mockListing);
    });
  });

  describe("getAllListings", () => {
    it("returns active listings with seller, category and media relations", async () => {
      prisma.listing.findMany.mockResolvedValue([mockListing]);

      const result = await getAllListings();

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: { deleted_at: null },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              avatar_key: true,
              location: true,
            },
          },
          category: true,
          media: { orderBy: { position: "asc" } },
        },
        orderBy: { created_at: "desc" },
      });
      expect(result).toEqual([mockListing]);
      expect(result[0].seller.username).toBe("johnny");
    });
  });

  describe("getListingById", () => {
    it("returns the listing with its relations", async () => {
      prisma.listing.findUnique.mockResolvedValue(mockListing);

      const result = await getListingById("listing-1");

      expect(prisma.listing.findUnique).toHaveBeenCalledWith({
        where: { id: "listing-1" },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockListing);
    });

    it("throws NotFoundError when the listing does not exist", async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(getListingById("missing")).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when the listing is soft deleted", async () => {
      prisma.listing.findUnique.mockResolvedValue({
        ...mockListing,
        deleted_at: new Date(),
      });

      await expect(getListingById("listing-1")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getListingsBySeller", () => {
    it("returns active listings of a seller with relations", async () => {
      prisma.listing.findMany.mockResolvedValue([mockListing]);

      const result = await getListingsBySeller("user-1");

      expect(prisma.listing.findMany).toHaveBeenCalledWith({
        where: { seller_id: "user-1", deleted_at: null },
        include: expect.any(Object),
        orderBy: { created_at: "desc" },
      });
      expect(result).toEqual([mockListing]);
    });
  });

  describe("updateListing", () => {
    it("updates an existing listing", async () => {
      prisma.listing.findUnique.mockResolvedValue(mockListing);
      prisma.listing.update.mockResolvedValue({
        ...mockListing,
        current_price: 700,
      });

      const result = await updateListing("listing-1", {
        current_price: 700,
      });

      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: "listing-1" },
        data: { current_price: 700 },
      });
      expect(result.current_price).toBe(700);
    });

    it("throws NotFoundError when updating a missing listing", async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(
        updateListing("missing", { current_price: 700 }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("softDeleteListing", () => {
    it("sets deleted_at on an existing listing", async () => {
      prisma.listing.findUnique.mockResolvedValue(mockListing);
      prisma.listing.update.mockResolvedValue({
        ...mockListing,
        deleted_at: new Date(),
      });

      const result = await softDeleteListing("listing-1");

      expect(prisma.listing.update).toHaveBeenCalledWith({
        where: { id: "listing-1" },
        data: { deleted_at: expect.any(Date) },
      });
      expect(result.deleted_at).toBeDefined();
    });

    it("throws NotFoundError when soft deleting a missing listing", async () => {
      prisma.listing.findUnique.mockResolvedValue(null);

      await expect(softDeleteListing("missing")).rejects.toThrow(NotFoundError);
      expect(prisma.listing.update).not.toHaveBeenCalled();
    });
  });
});
