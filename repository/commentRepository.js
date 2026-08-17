import { prisma } from "../config/dbConfig.js";
import { NotFoundError } from "../error/notFoundError.js";

const commentInclude = {
  user: {
    select: {
      id: true,
      username: true,
      avatar_key: true,
    },
  },
};

export const createComment = async (data) => {
  const comment = await prisma.comment.create({ data });
  return comment;
};

export const getCommentsByListing = async (listingId) => {
  const comments = await prisma.comment.findMany({
    where: { listing_id: listingId, status: "active" },
    include: commentInclude,
    orderBy: { created_at: "desc" },
  });
  return comments;
};

export const getCommentById = async (id) => {
  const comment = await prisma.comment.findUnique({ where: { id } });

  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  return comment;
};

export const updateComment = async (id, data) => {
  await getCommentById(id);

  const comment = await prisma.comment.update({ where: { id }, data });
  return comment;
};

export const softDeleteComment = async (id) => {
  await getCommentById(id);

  const comment = await prisma.comment.update({
    where: { id },
    data: { status: "deleted" },
  });
  return comment;
};
