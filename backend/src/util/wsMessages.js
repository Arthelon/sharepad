const MESSAGE_TYPES = {
    client_init: "ws_client_init",
    client_update_doc: "ws_client_update_doc",
    server_request_id: "ws_server_request_id",
    server_doc: "ws_server_doc",
    server_doc_changes: "ws_server_doc_changes"
};

const validateClientMessage = msg => {
    if (!msg) {
        return null;
    }
    if (
        (msg.type === MESSAGE_TYPES.client_init ||
            msg.type === MESSAGE_TYPES.client_update_doc) &&
        msg.data !== undefined &&
        msg.data.id !== undefined
    ) {
        return msg;
    }
    return null;
};

module.exports = {
    validateClientMessage,
    MESSAGE_TYPES
};
