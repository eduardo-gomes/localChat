import { onConnect } from "./messageTransmitter";
import { Connection } from "./socket";

let activeConnections = new Map<string, Connection>();

function onNewConnection(connection: Connection) {
	if (!connection.isConnected()) return;
	connection.setOnMessage((msg) => { console.log("Got message:", msg); });
	activeConnections.set(connection.getPeerId(), connection);
	console.log(`[Connection manager] got connection to ${connection.getPeerId()}`);
	onConnect(connection);
}

function removeConnection(connection: Connection) {
	const uid = connection.getPeerId();
	const has = activeConnections.get(uid);
	if (has != connection) return;
	activeConnections.delete(uid);
	console.log(`[Connection manager] removed connection to ${uid}`);
}

const connectionManager = {
	onNewConnection,
	removeConnection
};

export default connectionManager;