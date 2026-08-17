import {
  createListing,
  getAllListings,
  getListingById,
  getListingsBySeller,
  updateListing,
  softDeleteListing,
} from "../repository/listingRepository.js";
import { getUserById } from "../repository/userRepository.js";
import { getCategoryById } from "../repository/categoryRepository.js";
import { NotFoundError } from "../error/notFoundError.js";

export const addListing = async (data) => {
  const { seller_id, category_id, original_price } = data;

  // The seller and the category must exist (relation check)
  const seller = await getUserById(seller_id);
  const category = await getCategoryById(category_id);

  if (!seller) {
    throw new NotFoundError("Seller not found");
  }

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  // A new listing starts with current price equal to the original price
  const listing = await createListing({
    ...data,
    current_price: original_price,
    status: "available",
  });

  return {
    status: 201,
    message: "Listing created successfully",
    listing,
  };
};

export const getListings = async () => {
  const listings = await getAllListings();

  return {
    status: 200,
    message: "Listings fetched successfully",
    listings,
  };
};

export const getListing = async (id) => {
  const listing = await getListingById(id);

  return {
    status: 200,
    message: "Listing fetched successfully",
    listing,
  };
};

export const getSellerListings = async (sellerId) => {
  const listings = await getListingsBySeller(sellerId);

  return {
    status: 200,
    message: "Listings fetched successfully",
    listings,
  };
};

export const editListing = async (id, data) => {
  await getListingById(id);

  const listing = await updateListing(id, data);

  return {
    status: 200,
    message: "Listing updated successfully",
    listing,
  };
};

export const removeListing = async (id) => {
  // Soft delete: the listing is hidden but the row is kept
  await softDeleteListing(id);

  return {
    status: 200,
    message: "Listing deleted successfully",
  };
};
