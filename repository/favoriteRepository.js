import { prisma } from "../config/dbConfig.js";
import { NotFoundError } from "../error/notFoundError.js";

export const createFavorite = async (data) => {
  const favorite = await prisma.favorite.create({ data });
  return favorite;
};

export const getFavorite = async (userId, listingId) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      user_id_listing_id: { user_id: userId, listing_id: listingId },
    },
  });
  return favorite;
};

export const deleteFavorite = async (userId, listingId) => {
  const favorite = await prisma.favorite.delete({
    where: {
      user_id_listing_id: { user_id: userId, listing_id: listingId },
    },
  });
  return favorite;
};

export const getFavoritesByUser = async (userId) => {
  const favorites = await prisma.favorite.findMany({
    where: { user_id: userId },
    include: { listing: true },
    orderBy: { created_at: "desc" },
  });
  return favorites;
};

export const getFavoriteOrFail = async (userId, listingId) => {
  const favorite = await getFavorite(userId, listingId);

  if (!favorite) {
    throw new NotFoundError("Favorite not found");
  }

  return favorite;
};
