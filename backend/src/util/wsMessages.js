const MESSAGE_TYPES = {
    init: "ws_message_init",
    update_doc: "ws_message_update_doc"
};

const validateMessage = msg => {
    if (!msg) {
        return null;
    }
    if (
        (msg.type === MESSAGE_TYPES.init ||
            msg.type === MESSAGE_TYPES.update_doc) &&
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
