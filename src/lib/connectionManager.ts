import ContactManager from "./contactManager";
import * as MessageTransmitter from "./messageTransmitter";
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
	connection.setOnMessage((msg) => { MessageTransmitter.onIncomingMessage({ origin: connection, msg }); });
	activeConnections.set(uid, connection);
	console.log("[Connection manager] got connection to", uid);
	MessageTransmitter.sendToConnection(connection);
}

function removeConnection(connection: Connection) {
	const uid = connection.getPeerId();
	const has = activeConnections.get(uid);
	if (has != connection) return;
	activeConnections.delete(uid);
	console.log(`[Connection manager] removed connection to ${uid}`);
}

function sendIfConnected(uid: string) {
	let connection = activeConnections.get(uid);
	if (connection)
		MessageTransmitter.sendToConnection(connection);
}

const connectionManager = {
	onNewConnection,
	removeConnection,
	sendIfConnected
};

export default connectionManager;