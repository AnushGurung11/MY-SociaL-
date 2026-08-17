import { prisma } from "../config/dbConfig.js";
import { NotFoundError } from "../error/notFoundError.js";

export const createLike = async (data) => {
  const like = await prisma.like.create({ data });
  return like;
};

export const getLike = async (listingId, userId) => {
  const like = await prisma.like.findUnique({
    where: {
      listing_id_user_id: { listing_id: listingId, user_id: userId },
    },
  });
  return like;
};

export const deleteLike = async (listingId, userId) => {
  const like = await prisma.like.delete({
    where: {
      listing_id_user_id: { listing_id: listingId, user_id: userId },
    },
  });
  return like;
};

export const countLikesByListing = async (listingId) => {
  const count = await prisma.like.count({
    where: { listing_id: listingId },
  });
  return count;
};

export const getLikeOrFail = async (listingId, userId) => {
  const like = await getLike(listingId, userId);

  if (!like) {
    throw new NotFoundError("Like not found");
  }

  return like;
};
