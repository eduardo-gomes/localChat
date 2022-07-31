import ContactManager from "./contactManager";
import { onConnect } from "./messageTransmitter";
import { Connection } from "./socket";

let activeConnections = new Map<string, Connection>();

function onNewConnection(connection: Connection) {
	if (!connection.isConnected()) return;
	const uid = connection.getPeerId();
	if (!ContactManager.hasUser(uid)) {
		console.log("[Connection manager] got unknown user:", uid, "closing connection");
		connection.close();
		return;
	}
	connection.setOnMessage((msg) => { console.log("From", uid, "got message:", msg); });
	activeConnections.set(uid, connection);
	console.log("[Connection manager] got connection to", uid);
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