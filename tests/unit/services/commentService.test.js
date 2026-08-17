import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../repository/commentRepository.js", () => ({
  createComment: jest.fn(),
  getCommentsByListing: jest.fn(),
  updateComment: jest.fn(),
  softDeleteComment: jest.fn(),
}));

jest.unstable_mockModule("../../../repository/listingRepository.js", () => ({
  getListingById: jest.fn(),
}));

jest.unstable_mockModule("../../../repository/userRepository.js", () => ({
  getUserById: jest.fn(),
}));

const { addComment, getListingComments, editComment, removeComment } =
  await import("../../../services/commentService.js");
const commentRepository =
  await import("../../../repository/commentRepository.js");
const listingRepository =
  await import("../../../repository/listingRepository.js");
const userRepository = await import("../../../repository/userRepository.js");

const mockComment = {
  id: "comment-1",
  listing_id: "listing-1",
  user_id: "user-1",
  description: "Nice item!",
  status: "active",
};

describe("Comment Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addComment", () => {
    it("creates a comment when listing and user exist", async () => {
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      userRepository.getUserById.mockResolvedValue({ id: "user-1" });
      commentRepository.createComment.mockResolvedValue(mockComment);

      const result = await addComment({
        listing_id: "listing-1",
        user_id: "user-1",
        description: "Nice item!",
      });

      expect(commentRepository.createComment).toHaveBeenCalledWith({
        listing_id: "listing-1",
        user_id: "user-1",
        description: "Nice item!",
        status: "active",
      });
      expect(result).toMatchObject({
        status: 201,
        message: "Comment added successfully",
        comment: mockComment,
      });
    });

    it("propagates NotFoundError when the listing does not exist", async () => {
      listingRepository.getListingById.mockRejectedValue(
        new Error("Listing not found"),
      );

      await expect(
        addComment({
          listing_id: "missing",
          user_id: "user-1",
          description: "Nice item!",
        }),
      ).rejects.toThrow("Listing not found");
      expect(commentRepository.createComment).not.toHaveBeenCalled();
    });

    it("propagates NotFoundError when the user does not exist", async () => {
      listingRepository.getListingById.mockResolvedValue({ id: "listing-1" });
      userRepository.getUserById.mockRejectedValue(new Error("User not found"));

      await expect(
        addComment({
          listing_id: "listing-1",
          user_id: "missing",
          description: "Nice item!",
        }),
      ).rejects.toThrow("User not found");
      expect(commentRepository.createComment).not.toHaveBeenCalled();
    });
  });

  describe("getListingComments", () => {
    it("returns comments of a listing", async () => {
      commentRepository.getCommentsByListing.mockResolvedValue([mockComment]);

      const result = await getListingComments("listing-1");

      expect(commentRepository.getCommentsByListing).toHaveBeenCalledWith(
        "listing-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Comments fetched successfully",
        comments: [mockComment],
      });
    });
  });

  describe("editComment", () => {
    it("updates a comment", async () => {
      commentRepository.updateComment.mockResolvedValue({
        ...mockComment,
        description: "Updated!",
      });

      const result = await editComment("comment-1", {
        description: "Updated!",
      });

      expect(commentRepository.updateComment).toHaveBeenCalledWith(
        "comment-1",
        { description: "Updated!" },
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Comment updated successfully",
      });
    });
  });

  describe("removeComment", () => {
    it("soft deletes a comment", async () => {
      commentRepository.softDeleteComment.mockResolvedValue({
        ...mockComment,
        status: "deleted",
      });

      const result = await removeComment("comment-1");

      expect(commentRepository.softDeleteComment).toHaveBeenCalledWith(
        "comment-1",
      );
      expect(result).toMatchObject({
        status: 200,
        message: "Comment deleted successfully",
        comment: { ...mockComment, status: "deleted" },
      });
    });
  });
});
