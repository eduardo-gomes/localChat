//Separate file to avoid import cycle

import connectionManager from "./connectionManager";

function sendIfConnected(uid: string) {
	connectionManager.sendIfConnected(uid);
}

export { sendIfConnected };