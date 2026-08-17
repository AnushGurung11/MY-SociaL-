import { jest, expect, describe, beforeEach, it } from "@jest/globals";

jest.unstable_mockModule("../../../config/dbConfig.js", () => ({
  prisma: {
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const { prisma } = await import("../../../config/dbConfig.js");
const {
  createComment,
  getCommentsByListing,
  getCommentById,
  updateComment,
  softDeleteComment,
} = await import("../../../repository/commentRepository.js");
const { NotFoundError } = await import("../../../error/notFoundError.js");

const mockComment = {
  id: "comment-1",
  listing_id: "listing-1",
  user_id: "user-1",
  description: "Nice item!",
  status: "active",
  user: { id: "user-1", username: "johnny", avatar_key: null },
};

describe("Comment Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createComment", () => {
    it("creates and returns a comment", async () => {
      prisma.comment.create.mockResolvedValue(mockComment);

      const result = await createComment({
        listing_id: "listing-1",
        user_id: "user-1",
        description: "Nice item!",
      });

      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          listing_id: "listing-1",
          user_id: "user-1",
          description: "Nice item!",
        },
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe("getCommentsByListing", () => {
    it("returns active comments with the user relation", async () => {
      prisma.comment.findMany.mockResolvedValue([mockComment]);

      const result = await getCommentsByListing("listing-1");

      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { listing_id: "listing-1", status: "active" },
        include: {
          user: {
            select: { id: true, username: true, avatar_key: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
      expect(result).toEqual([mockComment]);
      expect(result[0].user.username).toBe("johnny");
    });
  });

  describe("getCommentById", () => {
    it("returns the comment when it exists", async () => {
      prisma.comment.findUnique.mockResolvedValue(mockComment);

      const result = await getCommentById("comment-1");

      expect(result).toEqual(mockComment);
    });

    it("throws NotFoundError when the comment does not exist", async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(getCommentById("missing")).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateComment", () => {
    it("updates an existing comment", async () => {
      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.update.mockResolvedValue({
        ...mockComment,
        description: "Updated!",
      });

      const result = await updateComment("comment-1", {
        description: "Updated!",
      });

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: "comment-1" },
        data: { description: "Updated!" },
      });
      expect(result.description).toBe("Updated!");
    });

    it("throws NotFoundError when updating a missing comment", async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(
        updateComment("missing", { description: "Updated!" }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("softDeleteComment", () => {
    it("marks an existing comment as deleted", async () => {
      prisma.comment.findUnique.mockResolvedValue(mockComment);
      prisma.comment.update.mockResolvedValue({
        ...mockComment,
        status: "deleted",
      });

      const result = await softDeleteComment("comment-1");

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: "comment-1" },
        data: { status: "deleted" },
      });
      expect(result.status).toBe("deleted");
    });

    it("throws NotFoundError when soft deleting a missing comment", async () => {
      prisma.comment.findUnique.mockResolvedValue(null);

      await expect(softDeleteComment("missing")).rejects.toThrow(NotFoundError);
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });
  });
});
