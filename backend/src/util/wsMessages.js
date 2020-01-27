const MESSAGE_TYPES = {
    init: "ws_message_init",
    patch: "ws_message_patch"
};

const validateMessage = msg => {
    if (!msg) {
        return null;
    }
    if (
        (msg.type === MESSAGE_TYPES.init || msg.type === MESSAGE_TYPES.patch) &&
        msg.data !== undefined &&
        msg.data.id !== undefined
    ) {
        return msg;
    }
    return null;
};

module.exports = {
    validateMessage,
    MESSAGE_TYPES
};
