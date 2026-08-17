import { sendMessage, markMessageAsRead } from "../services/messageService.js";
import { getConversationById } from "../repository/conversationRepository.js";
import { UnauthenticatedError } from "../error/unauthenticatedError.js";

export const roomFor = (conversationId) => `conversation:${conversationId}`;

// Verifies that the socket user is a member of the conversation
export const assertConversationMember = async (conversationId, userId) => {
  const conversation = await getConversationById(conversationId);

  const isMember =
    conversation.user_a_id === userId || conversation.user_b_id === userId;

  if (!isMember) {
    throw new UnauthenticatedError("User is not part of the conversation");
  }

  return conversation;
};

export const handleMessageSend = async ({ io, socket, payload, ack }) => {
  try {
    // sender_id always comes from the verified JWT, never from the client
    const { conversation_id } = payload;

    const result = await sendMessage({
      ...payload,
      sender_id: socket.user.id,
    });

    // Broadcast to everyone in the conversation room (including the sender)
    io.to(roomFor(conversation_id)).emit("message:new", result.data);

    if (typeof ack === "function") {
      ack({ success: true, data: result.data });
    }
  } catch (error) {
    if (typeof ack === "function") {
      ack({ success: false, error: error.message });
    }
  }
};

export const handleConversationJoin = async ({ socket, payload, ack }) => {
  try {
    const { conversation_id } = payload;

    await assertConversationMember(conversation_id, socket.user.id);

    socket.join(roomFor(conversation_id));

    if (typeof ack === "function") {
      ack({ success: true });
    }
  } catch (error) {
    if (typeof ack === "function") {
      ack({ success: false, error: error.message });
    }
  }
};

export const handleMessageRead = async ({ io, socket, payload, ack }) => {
  try {
    const { conversation_id, message_id } = payload;

    await assertConversationMember(conversation_id, socket.user.id);

    const result = await markMessageAsRead(message_id);

    io.to(roomFor(conversation_id)).emit("message:read", {
      message_id,
      conversation_id,
      read_at: result.data.read_at,
    });

    if (typeof ack === "function") {
      ack({ success: true });
    }
  } catch (error) {
    if (typeof ack === "function") {
      ack({ success: false, error: error.message });
    }
  }
};

export const handleTyping = ({ socket, payload, isTyping }) => {
  const { conversation_id } = payload;

  if (!conversation_id) {
    return;
  }

  const event = isTyping ? "typing:start" : "typing:stop";

  // Broadcast to everyone in the room EXCEPT the typing user
  socket.to(roomFor(conversation_id)).emit(event, {
    user_id: socket.user.id,
    conversation_id,
  });
};

export const registerChatHandlers = (io, socket) => {
  socket.on("message:send", (payload, ack) =>
    handleMessageSend({ io, socket, payload, ack }),
  );

  socket.on("conversation:join", (payload, ack) =>
    handleConversationJoin({ socket, payload, ack }),
  );

  socket.on("message:read", (payload, ack) =>
    handleMessageRead({ io, socket, payload, ack }),
  );

  socket.on("typing:start", (payload) =>
    handleTyping({ socket, payload, isTyping: true }),
  );

  socket.on("typing:stop", (payload) =>
    handleTyping({ socket, payload, isTyping: false }),
  );
};
