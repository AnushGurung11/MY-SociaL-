import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../repository/listingRepository.js", () => ({
  createListing: jest.fn(),
  getAllListings: jest.fn(),
  getListingById: jest.fn(),
  getListingsBySeller: jest.fn(),
  updateListing: jest.fn(),
  softDeleteListing: jest.fn(),
}));

jest.unstable_mockModule("../../../repository/userRepository.js", () => ({
  getUserById: jest.fn(),
}));

jest.unstable_mockModule("../../../repository/categoryRepository.js", () => ({
  getCategoryById: jest.fn(),
}));

const {
  addListing,
  getListings,
  getListing,
  getSellerListings,
  editListing,
  removeListing,
} = await import("../../../services/listingService.js");
const listingRepository =
  await import("../../../repository/listingRepository.js");
const userRepository = await import("../../../repository/userRepository.js");
const categoryRepository =
  await import("../../../repository/categoryRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const mockListing = {
  id: "listing-1",
  seller_id: "user-1",
  title: "Used iPhone 14",
  category_id: "cat-1",
  original_price: 800,
  current_price: 800,
  status: "available",
};

describe("Listing Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addListing", () => {
    it("creates a listing with current price equal to the original", async () => {
      userRepository.getUserById.mockResolvedValue({ id: "user-1" });
      categoryRepository.getCategoryById.mockResolvedValue({
        id: "cat-1",
      });
      listingRepository.createListing.mockResolvedValue(mockListing);

      const result = await addListing({
        seller_id: "user-1",
        category_id: "cat-1",
        title: "Used iPhone 14",
        original_price: 800,
      });

      expect(listingRepository.createListing).toHaveBeenCalledWith({
        seller_id: "user-1",
        category_id: "cat-1",
        title: "Used iPhone 14",
        original_price: 800,
        current_price: 800,
        status: "available",
      });
      expect(result).toMatchObject({
        status: 201,
        message: "Listing created successfully",
        listing: mockListing,
      });
    });

    it("throws NotFoundError when the seller does not exist", async () => {
      userRepository.getUserById.mockRejectedValue(
        new NotFoundError("User not found"),
      );

      await expect(
        addListing({
          seller_id: "missing",
          category_id: "cat-1",
          original_price: 800,
        }),
      ).rejects.toThrow(NotFoundError);
      expect(listingRepository.createListing).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when the category does not exist", async () => {
      userRepository.getUserById.mockResolvedValue({ id: "user-1" });
      categoryRepository.getCategoryById.mockRejectedValue(
        new NotFoundError("Category not found"),
      );

      await expect(
        addListing({
          seller_id: "user-1",
          category_id: "missing",
          original_price: 800,
        }),
      ).rejects.toThrow(NotFoundError);
      expect(listingRepository.createListing).not.toHaveBeenCalled();
    });
  });

  describe("getListings", () => {
    it("returns all active listings", async () => {
      listingRepository.getAllListings.mockResolvedValue([mockListing]);

      const result = await getListings();

      expect(result).toMatchObject({
        status: 200,
        message: "Listings fetched successfully",
        listings: [mockListing],
      });
    });
  });

  describe("getListing", () => {
    it("returns the listing by id", async () => {
      listingRepository.getListingById.mockResolvedValue(mockListing);

      const result = await getListing("listing-1");

      expect(listingRepository.getListingById).toHaveBeenCalledWith(
        "listing-1",
      );
      expect(result.listing).toEqual(mockListing);
    });
  });

  describe("getSellerListings", () => {
    it("returns listings of the seller", async () => {
      listingRepository.getListingsBySeller.mockResolvedValue([mockListing]);

      const result = await getSellerListings("user-1");

      expect(listingRepository.getListingsBySeller).toHaveBeenCalledWith(
        "user-1",
      );
      expect(result.listings).toEqual([mockListing]);
    });
  });

  describe("editListing", () => {
    it("updates an existing listing", async () => {
      listingRepository.getListingById.mockResolvedValue(mockListing);
      listingRepository.updateListing.mockResolvedValue({
        ...mockListing,
        current_price: 750,
      });

      const result = await editListing("listing-1", { current_price: 750 });

      expect(listingRepository.updateListing).toHaveBeenCalledWith(
        "listing-1",
        { current_price: 750 },
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Listing updated successfully",
      });
    });

    it("propagates NotFoundError for a missing listing", async () => {
      listingRepository.getListingById.mockRejectedValue(
        new NotFoundError("Listing not found"),
      );

      await expect(
        editListing("missing", { current_price: 750 }),
      ).rejects.toThrow(NotFoundError);
      expect(listingRepository.updateListing).not.toHaveBeenCalled();
    });
  });

  describe("removeListing", () => {
    it("soft deletes the listing", async () => {
      listingRepository.softDeleteListing.mockResolvedValue({
        ...mockListing,
        deleted_at: new Date(),
      });

      const result = await removeListing("listing-1");

      expect(listingRepository.softDeleteListing).toHaveBeenCalledWith(
        "listing-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Listing deleted successfully",
      });
    });
  });
});
