const Program = require("./models/Program");
const WebSocket = require("ws");
const { validateClientMessage, MESSAGE_TYPES } = require("./util/wsMessages");
const automerge = require("automerge");

const socketBucket = {};

const wss = new WebSocket.Server({ port: 8080 });

const noop = () => {};
function heartbeat() {
    this.isAlive = true;
}

wss.on("connection", socket => {
    console.log("NEW SOCKET");
    // pong
    socket.isAlive = true;
    socket.on("pong", heartbeat);
    socket.send(
        JSON.stringify({
            type: MESSAGE_TYPES.server_request_id
        })
    );

    socket.on("message", async msg => {
        let parsedMsg;
        if (typeof msg !== "string") {
            console.log("WSERR: WS message must be a string: " + msg);
            return;
        }
        try {
            parsedMsg = JSON.parse(msg);
        } catch (err) {
            console.error(
                "WSERR: Error while parsing client WS message: " + msg
            );
            return;
        }
        if (!validateClientMessage(parsedMsg)) {
            console.error("WSERR: Invalid WS message: " + msg);
            return;
        }
        const type = parsedMsg.type;
        console.log("New Message: " + type);
        if (type === MESSAGE_TYPES.client_init) {
            try {
                const matchedProgram = await Program.findById(
                    parsedMsg.data.id
                );
                if (!socketBucket[matchedProgram._id]) {
                    socketBucket[matchedProgram._id] = [socket];
                } else {
                    socketBucket[matchedProgram._id].push(socket);
                }
                socket.programId = matchedProgram._id;
                socket.send(
                    JSON.stringify({
                        type: MESSAGE_TYPES.server_doc,
                        data: {
                            doc: matchedProgram.doc
                        }
                    })
                );
            } catch (err) {
                console.error("WSERR: Error finding program: " + err);
            }
        } else if (type === MESSAGE_TYPES.client_update_doc) {
            try {
                const { startIdx, changeLength, changes, id } = parsedMsg.data;
                if (changes == undefined) {
                    console.error("WSERR: Changes not found");
                    return;
                }
                const matchedProgram = await Program.findById(id);
                let storedDoc = automerge.load(matchedProgram.doc);
                const parsedChanges = JSON.parse(changes);
                storedDoc = automerge.applyChanges(storedDoc, parsedChanges);
                matchedProgram.doc = automerge.save(storedDoc);
                await matchedProgram.save();
                if (!!socketBucket[id]) {
                    const message = JSON.stringify({
                        type: MESSAGE_TYPES.server_doc_changes,
                        data: {
                            changes,
                            startIdx,
                            changeLength
                        }
                    });
                    socketBucket[id].forEach(sock => {
                        if (sock !== socket) {
                            sock.send(message);
                        }
                    });
                    console.log(
                        "New Doc Contents: " + storedDoc.content.toString()
                    );

                    // Adds socket to channel if it's not already in there
                    if (socketBucket[id].indexOf(socket) == -1) {
                        socketBucket[id].push(socket);
                    }
                } else {
                    // initialize new channel if it doesn't exist
                    socketBucket[id] = [socket];
                }
            } catch (err) {
                console.error("WSERR: Error while merging docs: " + err);
            }
        }
    });

    socket.onclose = () => {
        closeSocket(socket);
    };
});

const closeSocket = ws => {
    const sockets = socketBucket[ws.programId];
    if (!!sockets) {
        if (sockets.length == 1 && sockets[0] == ws) {
            delete socketBucket[ws.programId];
        } else {
            socketBucket[ws.programId] = sockets.filter(sock => sock !== ws);
            console.log(socketBucket[ws.programId].length);
        }
    }
};

// pings
const interval = setInterval(function ping() {
    console.log(wss.clients.size);
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            closeSocket(ws);
            ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(noop);
    });
}, 5000);
