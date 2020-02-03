import ReconnectingWebsocket from "reconnecting-websocket";

export const WS_MESSAGE_TYPES = {
    client_init: "ws_client_init",
    client_update_doc: "ws_client_update_doc",
    server_request_id: "ws_server_request_id",
    server_doc: "ws_server_doc",
    server_doc_changes: "ws_server_doc_changes"
};

class WebsocketClient {
    constructor() {
        console.log("WSCLIENT INIT");
        this.client = new ReconnectingWebsocket(process.env.REACT_APP_WS_HOST);
    }

    sendInitMessage(programId) {
        this.client.send(
            JSON.stringify({
                type: WS_MESSAGE_TYPES.client_init,
                data: {
                    id: programId
                }
            })
        );
    }

    sendProgramChanges(programId, data) {
        this.client.send(
            JSON.stringify({
                type: WS_MESSAGE_TYPES.client_update_doc,
                data: {
                    id: programId,
                    ...data
                }
            })
        );
    }

    onMessage(cb) {
        this.client.onmessage = cb;
    }

    close() {
        this.client.close();
    }
}

export default WebsocketClient;
