import {
  createComment,
  getCommentsByListing,
  updateComment,
  softDeleteComment,
} from "../repository/commentRepository.js";
import { getListingById } from "../repository/listingRepository.js";
import { getUserById } from "../repository/userRepository.js";

export const addComment = async (data) => {
  const { listing_id, user_id } = data;

  // Both the listing and the user must exist (relation check)
  await getListingById(listing_id);
  await getUserById(user_id);

  const comment = await createComment({ ...data, status: "active" });

  return {
    status: 201,
    message: "Comment added successfully",
    comment,
  };
};

export const getListingComments = async (listingId) => {
  const comments = await getCommentsByListing(listingId);

  return {
    status: 200,
    message: "Comments fetched successfully",
    comments,
  };
};

export const editComment = async (id, data) => {
  const comment = await updateComment(id, data);

  return {
    status: 200,
    message: "Comment updated successfully",
    comment,
  };
};

export const removeComment = async (id) => {
  // Soft delete: the comment is hidden instead of removed
  const comment = await softDeleteComment(id);

  return {
    status: 200,
    message: "Comment deleted successfully",
    comment,
  };
};
