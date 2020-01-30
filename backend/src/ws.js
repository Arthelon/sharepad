const Program = require("./models/Program");
const WebSocket = require("ws");
const { validateMessage, MESSAGE_TYPES } = require("./util/wsMessages");
const DiffMatchPatch = require("diff-match-patch");

const dmp = new DiffMatchPatch();
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
        if (!validateMessage(parsedMsg)) {
            console.error("WSERR: Invalid WS message: " + msg);
            return;
        }
        const type = parsedMsg.type;
        if (type === MESSAGE_TYPES.init) {
            try {
                console.log(parsedMsg.data.id);
                const matchedProgram = await Program.findById(
                    parsedMsg.data.id
                );
                if (!socketBucket[matchedProgram._id]) {
                    socketBucket[matchedProgram._id] = [socket];
                } else {
                    socketBucket[matchedProgram._id].push(socket);
                }
                socket.programId = matchedProgram._id;
            } catch (err) {
                console.error("WSERR: Error finding program: " + err);
            }
        } else {
            try {
                const { patch, id } = parsedMsg.data;
                if (parsedMsg.data.patch == undefined) {
                    console.error("WSERR: Patch content not found");
                    return;
                }
                const matchedProgram = await Program.findById(id);
                const oldContent = matchedProgram.content;
                const patches = dmp.patch_fromText(patch);
                const results = dmp.patch_apply(patches, oldContent);
                if (!!socketBucket[id]) {
                    socketBucket[id].forEach(sock => {
                        if (sock !== socket) {
                            sock.send(results[0]);
                        }
                    });
                    matchedProgram.content = results[0];
                    await matchedProgram.save();
                }
            } catch (err) {
                console.error("WSERR: Error while applying patches: " + err);
            }
        }
    });

    socket.onclose = () => {
        closeSocket(socket);
    };
});

const closeSocket = ws => {
    console.log("Socket closed");
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
