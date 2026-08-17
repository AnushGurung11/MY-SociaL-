import {
  createMessage,
  getMessagesByConversation,
  updateMessage,
  deleteMessage,
} from "../repository/messageRepository.js";
import { getConversationById } from "../repository/conversationRepository.js";
import { getListingById } from "../repository/listingRepository.js";
import { UnauthenticatedError } from "../error/unauthenticatedError.js";

export const sendMessage = async (data) => {
  const { conversation_id, sender_id, listing_id } = data;

  // The conversation and listing must exist (relation checks)
  const conversation = await getConversationById(conversation_id);
  await getListingById(listing_id);

  // Only the two members of the conversation can send messages
  const isMember =
    conversation.user_a_id === sender_id ||
    conversation.user_b_id === sender_id;

  if (!isMember) {
    throw new UnauthenticatedError("Sender is not part of the conversation");
  }

  const message = await createMessage(data);

  return {
    status: 201,
    message: "Message sent successfully",
    data: message,
  };
};

export const getConversationMessages = async (conversationId) => {
  const messages = await getMessagesByConversation(conversationId);

  return {
    status: 200,
    message: "Messages fetched successfully",
    messages,
  };
};

export const markMessageAsRead = async (id) => {
  const message = await updateMessage(id, { read_at: new Date() });

  return {
    status: 200,
    message: "Message marked as read",
    data: message,
  };
};

export const removeMessage = async (id) => {
  await deleteMessage(id);

  return {
    status: 200,
    message: "Message deleted successfully",
  };
};
