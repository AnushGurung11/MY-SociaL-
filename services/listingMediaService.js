import {
  createListingMedia,
  getMediaByListing,
  countMediaByListing,
  updateListingMedia,
  deleteListingMedia,
} from "../repository/listingMediaRepository.js";
import { getListingById } from "../repository/listingRepository.js";
import { BadRequest } from "../error/badRequestError.js";

const MAX_MEDIA_PER_LISTING = 5;

export const addListingMedia = async (data) => {
  const { listing_id } = data;

  // The listing must exist (relation check)
  await getListingById(listing_id);

  // A listing can have at most 5 image/video posts
  const mediaCount = await countMediaByListing(listing_id);

  if (mediaCount >= MAX_MEDIA_PER_LISTING) {
    throw new BadRequest(
      `A listing can have at most ${MAX_MEDIA_PER_LISTING} media`,
    );
  }

  const media = await createListingMedia(data);

  return {
    status: 201,
    message: "Media added to listing successfully",
    media,
  };
};

export const getListingMedia = async (listingId) => {
  const media = await getMediaByListing(listingId);

  return {
    status: 200,
    message: "Media fetched successfully",
    media,
  };
};

export const editListingMedia = async (id, data) => {
  const media = await updateListingMedia(id, data);

  return {
    status: 200,
    message: "Media updated successfully",
    media,
  };
};

export const removeListingMedia = async (id) => {
  await deleteListingMedia(id);

  return {
    status: 200,
    message: "Media deleted successfully",
  };
};
