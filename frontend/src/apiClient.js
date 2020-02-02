import axios from "axios";
import ReconnectingWebsocket from "reconnecting-websocket";

export const WS_MESSAGE_TYPES = {
    client_init: "ws_client_init",
    client_update_doc: "ws_client_update_doc",
    server_request_id: "ws_server_request_id",
    server_doc: "ws_server_doc",
    server_doc_changes: "ws_server_doc_changes"
};

const httpClient = axios.create({
    baseURL: process.env.REACT_APP_API_HOST + "/api"
});

export const getProgram = id => httpClient.get("/program/" + id);

export const wsClient = new ReconnectingWebsocket(
    process.env.REACT_APP_WS_HOST
);

export const sendInitMessage = programId => {
    wsClient.send(
        JSON.stringify({
            type: WS_MESSAGE_TYPES.client_init,
            data: {
                id: programId
            }
        })
    );
};

export const sendProgramChanges = (programId, data) => {
    wsClient.send(
        JSON.stringify({
            type: WS_MESSAGE_TYPES.client_update_doc,
            data: {
                id: programId,
                ...data
            }
        })
    );
};

export const closeWs = () => {
    wsClient.close();
};
