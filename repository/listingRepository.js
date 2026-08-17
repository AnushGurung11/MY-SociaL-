import { prisma } from "../config/dbConfig.js";
import { NotFoundError } from "../error/notFoundError.js";

const listingInclude = {
  seller: {
    select: {
      id: true,
      username: true,
      avatar_key: true,
      location: true,
    },
  },
  category: true,
  media: {
    orderBy: { position: "asc" },
  },
};

export const createListing = async (data) => {
  const listing = await prisma.listing.create({ data });
  return listing;
};

export const getAllListings = async () => {
  const listings = await prisma.listing.findMany({
    where: { deleted_at: null },
    include: listingInclude,
    orderBy: { created_at: "desc" },
  });
  return listings;
};

export const getListingById = async (id) => {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  });

  if (!listing || listing.deleted_at) {
    throw new NotFoundError("Listing not found");
  }

  return listing;
};

export const getListingsBySeller = async (sellerId) => {
  const listings = await prisma.listing.findMany({
    where: { seller_id: sellerId, deleted_at: null },
    include: listingInclude,
    orderBy: { created_at: "desc" },
  });
  return listings;
};

export const updateListing = async (id, data) => {
  await getListingById(id);

  const listing = await prisma.listing.update({ where: { id }, data });
  return listing;
};

export const softDeleteListing = async (id) => {
  await getListingById(id);

  const listing = await prisma.listing.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
  return listing;
};
