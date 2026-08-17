import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../repository/likeRepository.js", () => ({
  createLike: jest.fn(),
  getLike: jest.fn(),
  deleteLike: jest.fn(),
  countLikesByListing: jest.fn(),
}));

jest.unstable_mockModule("../../../repository/listingRepository.js", () => ({
  getListingById: jest.fn(),
}));

const { toggleLike, getLikesCount } =
  await import("../../../services/likeService.js");
const likeRepository = await import("../../../repository/likeRepository.js");
const listingRepository =
  await import("../../../repository/listingRepository.js");

const mockLike = {
  listing_id: "listing-1",
  user_id: "user-1",
  created_at: new Date(),
};

describe("Like Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("toggleLike", () => {
    it("likes a listing when the user has not liked it yet", async () => {
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      likeRepository.getLike.mockResolvedValue(null);
      likeRepository.createLike.mockResolvedValue(mockLike);
      likeRepository.countLikesByListing.mockResolvedValue(1);

      const result = await toggleLike({
        listing_id: "listing-1",
        user_id: "user-1",
      });

      expect(likeRepository.createLike).toHaveBeenCalledWith({
        listing_id: "listing-1",
        user_id: "user-1",
      });
      expect(result).toMatchObject({
        status: 201,
        message: "Listing liked successfully",
        liked: true,
        likesCount: 1,
      });
    });

    it("removes the like when the user already liked it", async () => {
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      likeRepository.getLike.mockResolvedValue(mockLike);
      likeRepository.deleteLike.mockResolvedValue(mockLike);
      likeRepository.countLikesByListing.mockResolvedValue(0);

      const result = await toggleLike({
        listing_id: "listing-1",
        user_id: "user-1",
      });

      expect(likeRepository.deleteLike).toHaveBeenCalledWith(
        "listing-1",
        "user-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Like removed successfully",
        liked: false,
        likesCount: 0,
      });
    });

    it("propagates NotFoundError when the listing does not exist", async () => {
      listingRepository.getListingById.mockRejectedValue(
        new Error("Listing not found"),
      );

      await expect(
        toggleLike({ listing_id: "missing", user_id: "user-1" }),
      ).rejects.toThrow("Listing not found");
      expect(likeRepository.createLike).not.toHaveBeenCalled();
    });
  });

  describe("getLikesCount", () => {
    it("returns the likes count of a listing", async () => {
      likeRepository.countLikesByListing.mockResolvedValue(7);

      const result = await getLikesCount("listing-1");

      expect(likeRepository.countLikesByListing).toHaveBeenCalledWith(
        "listing-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Likes count fetched successfully",
        likesCount: 7,
      });
    });
  });
});
