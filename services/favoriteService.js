import {
  createFavorite,
  getFavorite,
  deleteFavorite,
  getFavoritesByUser,
} from "../repository/favoriteRepository.js";
import { getListingById } from "../repository/listingRepository.js";
import { ConflictError } from "../error/conflictError.js";

export const addFavorite = async ({ user_id, listing_id }) => {
  // The listing must exist (relation check)
  await getListingById(listing_id);

  const existing = await getFavorite(user_id, listing_id);

  if (existing) {
    throw new ConflictError("Listing is already in favorites");
  }

  const favorite = await createFavorite({ user_id, listing_id });

  return {
    status: 201,
    message: "Listing added to favorites successfully",
    favorite,
  };
};

export const getUserFavorites = async (userId) => {
  const favorites = await getFavoritesByUser(userId);

  return {
    status: 200,
    message: "Favorites fetched successfully",
    favorites,
  };
};

export const removeFavorite = async ({ user_id, listing_id }) => {
  await deleteFavorite(user_id, listing_id);

  return {
    status: 200,
    message: "Listing removed from favorites successfully",
  };
};
