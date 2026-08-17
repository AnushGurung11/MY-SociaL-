import { prisma } from "../config/dbConfig.js";
import { NotFoundError } from "../error/notFoundError.js";

export const createMessage = async (data) => {
  const message = await prisma.message.create({ data });
  return message;
};

export const getMessagesByConversation = async (conversationId) => {
  const messages = await prisma.message.findMany({
    where: { conversation_id: conversationId },
    orderBy: { created_at: "asc" },
  });
  return messages;
};

export const getMessageById = async (id) => {
  const message = await prisma.message.findUnique({ where: { id } });

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  return message;
};

export const updateMessage = async (id, data) => {
  await getMessageById(id);

  const message = await prisma.message.update({ where: { id }, data });
  return message;
};

export const deleteMessage = async (id) => {
  await getMessageById(id);

  const message = await prisma.message.delete({ where: { id } });
  return message;
};
