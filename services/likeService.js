import {
  createLike,
  getLike,
  deleteLike,
  countLikesByListing,
} from "../repository/likeRepository.js";
import { getListingById } from "../repository/listingRepository.js";

export const toggleLike = async ({ listing_id, user_id }) => {
  // The listing must exist (relation check)
  await getListingById(listing_id);

  const existing = await getLike(listing_id, user_id);

  if (existing) {
    await deleteLike(listing_id, user_id);
    const likesCount = await countLikesByListing(listing_id);

    return {
      status: 200,
      message: "Like removed successfully",
      liked: false,
      likesCount,
    };
  }

  await createLike({ listing_id, user_id });
  const likesCount = await countLikesByListing(listing_id);

  return {
    status: 201,
    message: "Listing liked successfully",
    liked: true,
    likesCount,
  };
};

export const getLikesCount = async (listingId) => {
  const likesCount = await countLikesByListing(listingId);

  return {
    status: 200,
    message: "Likes count fetched successfully",
    likesCount,
  };
};
