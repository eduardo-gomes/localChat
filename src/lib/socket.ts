import { NetInfoStateType, useNetInfo } from "@react-native-community/netinfo";
import { Buffer } from "buffer";
import { EventEmitter } from "events";
import { useEffect, useState } from "react";
import TcpSocket from "react-native-tcp-socket";
import { getId } from "./id";
import { BannerMessage, NetMessage, MessageTypes, TextMessage, TextMessageAck, FileMessage, FileDataMessage, FileAckMessage } from "./netMessages";
import ConnectionManager from "./connectionManager";
import Zeroconf_App from "./zeroconf";

async function generateBanner() {
	let obj: BannerMessage = {
		type: MessageTypes.BANNER,
		id: await getId()
	};
	return obj;
}

class Connection {
	isConnected() {
		return this.peerId != undefined;
	}
	callback: ((msg: NetMessage) => void) | undefined;
	buffer;
	socket;
	peerId: string | undefined;
	emitter = new EventEmitter();
	static Events = { MESSAGE: "message", INITIALIZED: "init" };
	constructor(socket: TcpSocket.Socket) {
		this.socket = socket;
		this.buffer = "";
		socket.on('connect', () => {
			generateBanner().then((banner) => { this.send(banner); });
		})
		socket.on('data', (data) => { this.data(data); });
		socket.on('error', function (error) {
			console.log(error);
		});
		socket.on('close', () => { this.onClose(); });
	}
	send(msg: NetMessage) {
		let msgStr = JSON.stringify(msg) + '\n';
		this.socket.write(msgStr, "utf-8");
		// console.log("SENT:", msgStr);
	}
	getPeerId() {
		return this.peerId ?? "NOT_CONNECTED";
	}
	data(data: Buffer | string) {
		if (data instanceof Buffer)
			data = data.toString("utf-8");
		// console.log("[Connection]Data received:", data);
		// console.log("[Connection]buffer:", this.buffer);
		this.buffer = this.buffer.concat(data);
		let n = this.buffer.indexOf('\n');

		if (n != -1) {
			let lines: string[] = [];
			let split = this.buffer.split('\n');
			this.buffer = split.pop() ?? '';
			lines = lines.concat(split);
			lines.forEach((line) => {
				const msg = JSON.parse(line) as NetMessage;//TODO: handle errors
				// console.log("[Connection]Line:", msg);
				// console.log("[Connection]message:", msg.type);
				this.onMessage(msg);
			});
		}
	}
	private onMessage(msg: NetMessage) {
		if (msg.type == MessageTypes.BANNER) {
			this.peerId = (msg as BannerMessage).id;
			this.emitter.emit(Connection.Events.INITIALIZED);
			// console.log("[Connection]peer banner id:", this.peerId);
		} else if (
			msg.type == MessageTypes.TEXT_MESSAGE ||
			msg.type == MessageTypes.TEXT_MESSAGE_ACK ||
			msg.type == MessageTypes.FILE_MESSAGE ||
			msg.type == MessageTypes.FILE_MESSAGE_ACK ||
			msg.type == MessageTypes.FILE_MESSAGE_DATA ||
			msg.type == MessageTypes.FILE_DATA_ACK) {

			this.emitter.emit(Connection.Events.MESSAGE, msg);
		}
	}
	get address() {
		return this.socket.remoteAddress;
	}
	setOnMessage(cb: (msg: TextMessage | TextMessageAck | FileMessage | FileDataMessage | FileAckMessage) => void) {
		this.emitter.addListener(Connection.Events.MESSAGE, cb);
	}
	on(event: string, listener: (...args: any[]) => void) {
		this.emitter.on(event, listener);
	}
	once(event: string, listener: (...args: any[]) => void) {
		this.emitter.once(event, listener);
	}
	onClose() {
		ConnectionManager.removeConnection(this);
	}
	close() {
		this.socket.end();
	}
}

export function connectAndGetId(peer: { host: string, port: number })/*: Promise<BannerMessage>*/ {
	console.log("Creating probe socket");
	let promise = new Promise<string>(function (resolve, reject) {
		const client = TcpSocket.createConnection(peer);
		const connection = new Connection(client);
		connection.once(Connection.Events.INITIALIZED, () => {
			// connection.close(); //Maintain connected
			if (connection.peerId) {
				ConnectionManager.onNewConnection(connection);
				resolve(connection.peerId);
			} else
				reject("Something went wrong");
		})
	});
	return promise;
}

class Networking {
	server: TcpSocket.Server;
	listeningPort: number;
	listeningAddress: string;
	static counter: number = 0;
	static instance: Networking = new Networking(5000);
	isBound = false;
	zeroconf: Zeroconf_App;

	constructor(listeningPort: number, listeningAddress: string = "0.0.0.0") {
		this.server = TcpSocket.createServer((socket) => { this.incomingConnection(socket); });
		this.listeningAddress = listeningAddress;
		this.listeningPort = listeningPort;
		this.server.on('error', (e: any) => {
			let str = String(e);
			if (str.search("EADDRINUSE") != -1) {
				console.log('Address in use, retrying with port', ++this.listeningPort);
				setTimeout(() => {
					this.server.close();
					this.listen();
				}, 1000);
			}
		});
		this.zeroconf = new Zeroconf_App();
		this.server.on("listening", () => { this.onListen(); });
		this.listen();
		Networking.counter++;
		console.log("Instance:", Networking.counter, "Server port:", this.server.address());
	}
	private listen() {
		this.server.listen({ port: this.listeningPort, host: this.listeningAddress });
	}
	private onListen() {
		this.isBound = true;
		console.log("listen callback:", this.server.address());
		const port = this.server.address()?.port;
		if (port) {
			this.zeroconf.publish(port);
		}
	}
	private async incomingConnection(socket: TcpSocket.Socket) {
		// socket.on("data", (data) => {
		// 	if (data instanceof Buffer)
		// 		data = data.toString("utf-8");
		// 	console.log("[Server]server got:", data);
		// });

		socket.on("error", (error) => {
			console.log("[Server]An error ocurred with client socket ", error);
		});

		socket.on("close", (error) => {
			console.log("[Server]Closed connection with ", socket.address());
		});
		socket.write(JSON.stringify(await generateBanner()) + "\n");
		let connect = new Connection(socket);
		connect.once(Connection.Events.INITIALIZED, () => {
			ConnectionManager.onNewConnection(connect);
		});
	}
	getAddress() {
		return this.server.address();
	}
	connectAndGetId(host: string, port: number) {
		return connectAndGetId({ host, port });
	}
	close() {
		console.log("Closing server!");
		this.zeroconf.stop_unpublish();
		this.server.close(console.error);
	}
	log() {
		console.log("networking info:\n\taddress:", this.server.address());
	}
	useAddress() {
		let addr = networking.getAddress()?.address;
		const port = networking.getAddress()?.port;
		const netInfo = useNetInfo();
		if (netInfo.type == NetInfoStateType.wifi) {
			addr = netInfo.details.ipAddress ?? addr;
		}
		return { address: addr, port: port };
	}
	useServerStatus() {
		const [status, setStatus] = useState({ running: this.isBound });
		useEffect(() => {
			const handleStatusChange = () => {
				setStatus({ running: this.isBound });
			};
			this.server.on("listening", handleStatusChange);
			return () => { this.server.removeListener("listening", handleStatusChange); }
		})
		return status;
	}
}

const networking = Networking.instance;

export { networking, Connection };