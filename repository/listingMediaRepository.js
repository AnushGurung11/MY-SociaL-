import { prisma } from "../config/dbConfig.js";
import { NotFoundError } from "../error/notFoundError.js";

export const createListingMedia = async (data) => {
  const media = await prisma.listingMedia.create({ data });
  return media;
};

export const getMediaByListing = async (listingId) => {
  const media = await prisma.listingMedia.findMany({
    where: { listing_id: listingId },
    orderBy: { position: "asc" },
  });
  return media;
};

export const countMediaByListing = async (listingId) => {
  const count = await prisma.listingMedia.count({
    where: { listing_id: listingId },
  });
  return count;
};

export const getListingMediaById = async (id) => {
  const media = await prisma.listingMedia.findUnique({ where: { id } });

  if (!media) {
    throw new NotFoundError("Listing media not found");
  }

  return media;
};

export const updateListingMedia = async (id, data) => {
  await getListingMediaById(id);

  const media = await prisma.listingMedia.update({ where: { id }, data });
  return media;
};

export const deleteListingMedia = async (id) => {
  await getListingMediaById(id);

  const media = await prisma.listingMedia.delete({ where: { id } });
  return media;
};
