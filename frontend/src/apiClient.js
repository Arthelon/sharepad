import axios from "axios";

const WS_MESSAGE_TYPES = {
    init: "ws_message_init",
    patch: "ws_message_patch"
};

const httpClient = axios.create({
    baseURL: process.env.REACT_APP_API_HOST + "/api"
});

export const getProgram = id => httpClient.get("/program/" + id);

export const wsClient = new WebSocket(process.env.REACT_APP_WS_HOST);

export const sendInitMessage = programId => {
    wsClient.send(
        JSON.stringify({
            type: WS_MESSAGE_TYPES.init,
            data: {
                id: programId
            }
        })
    );
};

export const sendPatches = (programId, patch) => {
    wsClient.send(
        JSON.stringify({
            type: WS_MESSAGE_TYPES.patch,
            data: {
                id: programId,
                patch
            }
        })
    );
};

export const closeWs = () => {
    wsClient.close();
};
