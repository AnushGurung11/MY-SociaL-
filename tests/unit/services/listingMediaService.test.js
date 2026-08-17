import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule(
  "../../../repository/listingMediaRepository.js",
  () => ({
    createListingMedia: jest.fn(),
    getMediaByListing: jest.fn(),
    countMediaByListing: jest.fn(),
    updateListingMedia: jest.fn(),
    deleteListingMedia: jest.fn(),
  }),
);

jest.unstable_mockModule("../../../repository/listingRepository.js", () => ({
  getListingById: jest.fn(),
}));

const {
  addListingMedia,
  getListingMedia,
  editListingMedia,
  removeListingMedia,
} = await import("../../../services/listingMediaService.js");
const listingMediaRepository =
  await import("../../../repository/listingMediaRepository.js");
const listingRepository =
  await import("../../../repository/listingRepository.js");
const { BadRequest } = await import("../../../error/badRequestError.js");

const mockMedia = {
  id: "media-1",
  listing_id: "listing-1",
  media_type: "image",
  position: 1,
};

describe("ListingMedia Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addListingMedia", () => {
    it("adds media when the listing exists and has fewer than 5", async () => {
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      listingMediaRepository.countMediaByListing.mockResolvedValue(2);
      listingMediaRepository.createListingMedia.mockResolvedValue(mockMedia);

      const result = await addListingMedia({
        listing_id: "listing-1",
        media_type: "image",
        position: 3,
      });

      expect(listingMediaRepository.createListingMedia).toHaveBeenCalledWith({
        listing_id: "listing-1",
        media_type: "image",
        position: 3,
      });
      expect(result).toMatchObject({
        status: 201,
        message: "Media added to listing successfully",
        media: mockMedia,
      });
    });

    it("throws BadRequest when the listing already has 5 media", async () => {
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      listingMediaRepository.countMediaByListing.mockResolvedValue(5);

      await expect(
        addListingMedia({
          listing_id: "listing-1",
          media_type: "image",
          position: 6,
        }),
      ).rejects.toThrow(BadRequest);
      expect(listingMediaRepository.createListingMedia).not.toHaveBeenCalled();
    });

    it("propagates NotFoundError when the listing does not exist", async () => {
      listingRepository.getListingById.mockRejectedValue(
        new Error("Listing not found"),
      );

      await expect(
        addListingMedia({
          listing_id: "missing",
          media_type: "image",
          position: 1,
        }),
      ).rejects.toThrow("Listing not found");
    });
  });

  describe("getListingMedia", () => {
    it("returns media of a listing", async () => {
      listingMediaRepository.getMediaByListing.mockResolvedValue([mockMedia]);

      const result = await getListingMedia("listing-1");

      expect(listingMediaRepository.getMediaByListing).toHaveBeenCalledWith(
        "listing-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Media fetched successfully",
        media: [mockMedia],
      });
    });
  });

  describe("editListingMedia", () => {
    it("updates media", async () => {
      listingMediaRepository.updateListingMedia.mockResolvedValue({
        ...mockMedia,
        position: 2,
      });

      const result = await editListingMedia("media-1", { position: 2 });

      expect(listingMediaRepository.updateListingMedia).toHaveBeenCalledWith(
        "media-1",
        { position: 2 },
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Media updated successfully",
      });
    });
  });

  describe("removeListingMedia", () => {
    it("deletes media", async () => {
      listingMediaRepository.deleteListingMedia.mockResolvedValue(mockMedia);

      const result = await removeListingMedia("media-1");

      expect(listingMediaRepository.deleteListingMedia).toHaveBeenCalledWith(
        "media-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Media deleted successfully",
      });
    });
  });
});
