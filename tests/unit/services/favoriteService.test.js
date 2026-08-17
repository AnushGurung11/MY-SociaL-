import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../repository/favoriteRepository.js", () => ({
  createFavorite: jest.fn(),
  getFavorite: jest.fn(),
  deleteFavorite: jest.fn(),
  getFavoritesByUser: jest.fn(),
}));

jest.unstable_mockModule("../../../repository/listingRepository.js", () => ({
  getListingById: jest.fn(),
}));

const { addFavorite, getUserFavorites, removeFavorite } =
  await import("../../../services/favoriteService.js");
const favoriteRepository =
  await import("../../../repository/favoriteRepository.js");
const listingRepository =
  await import("../../../repository/listingRepository.js");
const { ConflictError } = await import("../../../error/conflictError.js");

const mockFavorite = {
  user_id: "user-1",
  listing_id: "listing-1",
  created_at: new Date(),
};

describe("Favorite Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addFavorite", () => {
    it("adds a listing to favorites", async () => {
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      favoriteRepository.getFavorite.mockResolvedValue(null);
      favoriteRepository.createFavorite.mockResolvedValue(mockFavorite);

      const result = await addFavorite({
        user_id: "user-1",
        listing_id: "listing-1",
      });

      expect(favoriteRepository.createFavorite).toHaveBeenCalledWith({
        user_id: "user-1",
        listing_id: "listing-1",
      });
      expect(result).toMatchObject({
        status: 201,
        message: "Listing added to favorites successfully",
        favorite: mockFavorite,
      });
    });

    it("throws ConflictError when the listing is already a favorite", async () => {
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      favoriteRepository.getFavorite.mockResolvedValue(mockFavorite);

      await expect(
        addFavorite({ user_id: "user-1", listing_id: "listing-1" }),
      ).rejects.toThrow(ConflictError);
      expect(favoriteRepository.createFavorite).not.toHaveBeenCalled();
    });

    it("propagates NotFoundError when the listing does not exist", async () => {
      listingRepository.getListingById.mockRejectedValue(
        new Error("Listing not found"),
      );

      await expect(
        addFavorite({ user_id: "user-1", listing_id: "missing" }),
      ).rejects.toThrow("Listing not found");
    });
  });

  describe("getUserFavorites", () => {
    it("returns favorites with the listing relation", async () => {
      favoriteRepository.getFavoritesByUser.mockResolvedValue([mockFavorite]);

      const result = await getUserFavorites("user-1");

      expect(favoriteRepository.getFavoritesByUser).toHaveBeenCalledWith(
        "user-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Favorites fetched successfully",
        favorites: [mockFavorite],
      });
    });
  });

  describe("removeFavorite", () => {
    it("removes a listing from favorites", async () => {
      favoriteRepository.deleteFavorite.mockResolvedValue(mockFavorite);

      const result = await removeFavorite({
        user_id: "user-1",
        listing_id: "listing-1",
      });

      expect(favoriteRepository.deleteFavorite).toHaveBeenCalledWith(
        "user-1",
        "listing-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Listing removed from favorites successfully",
      });
    });
  });
});
