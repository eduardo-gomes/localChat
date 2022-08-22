import EventEmitter from "events";
import React from "react";
import ContactManager from "./contactManager";
import * as MessageTransmitter from "./messageTransmitter";
import { Connection } from "./socket";

let activeConnections = new Map<string, Connection>();

const connectionEmitter = new EventEmitter();

function onNewConnection(connection: Connection) {
	if (!connection.isConnected()) return;
	const uid = connection.getPeerId();
	console.log("[Connection manager] connection from", uid);
	if (!ContactManager.hasUser(uid)) {
		console.log("[Connection manager] got unknown user:", uid, "closing connection");
		connection.close();
		return;
	}
	connection.setOnMessage((msg) => { MessageTransmitter.onIncomingMessage({ origin: connection, msg }); });
	activeConnections.set(uid, connection);
	connectionEmitter.emit(uid);
	console.log("[Connection manager] got connection to", uid);
	MessageTransmitter.sendToConnection(connection);
}

function removeConnection(connection: Connection) {
	const uid = connection.getPeerId();
	const has = activeConnections.get(uid);
	if (has != connection) return;
	activeConnections.delete(uid);
	connectionEmitter.emit(uid);
	console.log(`[Connection manager] removed connection to ${uid}`);
}

function sendIfConnected(uid: string) {
	let connection = activeConnections.get(uid);
	if (connection)
		MessageTransmitter.sendToConnection(connection);
}

function useOnline(uid: string) {
	const [online, setOnline] = React.useState(activeConnections.has(uid));
	React.useEffect(() => {
		const handleStatusChange = () => {
			setOnline(activeConnections.has(uid));
		};
		connectionEmitter.on(uid, handleStatusChange);
		return () => { connectionEmitter.removeListener(uid, handleStatusChange); }
	})
	return online
}

const connectionManager = {
	onNewConnection,
	removeConnection,
	sendIfConnected,
	useOnline
};

export default connectionManager;