import { Buffer } from "buffer";
import { EventEmitter } from "events";
import TcpSocket from "react-native-tcp-socket";
import { getId } from "./id";
import { BannerMessage, Message, MessageTypes } from "./netMessages";

async function generateBanner() {
	let obj: BannerMessage = {
		type: MessageTypes.BANNER,
		id: await getId()
	};
	return obj;
}

class Connection {
	callback: ((msg: Message) => void) | undefined;
	buffer;
	socket;
	peerId: string | undefined;
	emitter = new EventEmitter();
	static Events = { MESSAGE: "message", INITIALIZED: "init" };
	constructor(socket: TcpSocket.Socket) {
		this.socket = socket;
		this.buffer = "";
		socket.on('connect', () => {
			generateBanner().then((banner) => {
				let bannerStr = JSON.stringify(banner) + '\n';
				socket.write(bannerStr, "utf-8");
			});
		})
		socket.on('data', (data) => { this.data(data); });
		socket.on('error', function (error) {
			console.log(error);
		});
		socket.on('close', function () {
			console.log("[Connection]Connection closed with:", socket.remoteAddress, socket.remotePort);
		});

	}
	getPeerId() {
		return this.peerId;
	}
	data(data: Buffer | string) {
		if (data instanceof Buffer)
			data = data.toString("utf-8");
		// console.log("[Connection]Data received:", data);
		this.buffer = this.buffer.concat(data);
		let n = this.buffer.indexOf('\n');

		if (n != -1) {
			let lines: string[] = [];
			let split = this.buffer.split('\n');
			this.buffer = split.pop() ?? '';
			lines = lines.concat(split);
			lines.forEach((line) => {
				const msg = JSON.parse(line) as Message;//TODO: handle errors
				// console.log("[Connection]Line:", msg);
				// console.log("[Connection]message:", msg.type);
				this.onMessage(msg);
			});
		}
	}
	private onMessage(msg: Message) {
		if (msg.type == MessageTypes.BANNER) {
			this.peerId = (msg as BannerMessage).id;
			this.emitter.emit(Connection.Events.INITIALIZED);
			console.log("[Connection]peer banner id:", this.peerId);
		}
		this.emitter.emit(Connection.Events.MESSAGE, msg);
	}
	setOnMessage(cb: (msg: Message) => void) {
		this.emitter.addListener(Connection.Events.MESSAGE, cb);
	}
	on(event: string, listener: (...args: any[]) => void) {
		this.emitter.on(event, listener);
	}
	once(event: string, listener: (...args: any[]) => void) {
		this.emitter.once(event, listener);
	}
	close() {
		this.socket.end();
	}
}

export function probeId(peer: { host: string, port: number })/*: Promise<BannerMessage>*/ {
	console.log("Creating probe socket");
	let promise = new Promise<string>(function (resolve, reject) {
		const client = TcpSocket.createConnection(peer);
		const connection = new Connection(client);
		connection.once(Connection.Events.INITIALIZED, () => {
			connection.close();
			if (connection.peerId)
				resolve(connection.peerId);
			else
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
	counter: number = 0;

	constructor(listeningPort: number, listeningAddress: string = "0.0.0.0") {
		this.server = TcpSocket.createServer((socket) => { this.incomingConnection(socket); });
		this.listeningAddress = listeningAddress;
		this.listeningPort = listeningPort;
		this.server.on('error', (e: any) => {
			let str = String(e);
			if (str.search("EADDRINUSE") != -1) {
				this.counter++;
				if (this.counter % 10 == 0)
					console.log('Address in use, retrying...', this.counter);
				setTimeout(() => {
					this.server.close();
					this.listen();
				}, 1000);
			}
		});
		this.listen();
		Networking.counter++;
		console.log("Instance:", Networking.counter, "Server port:", this.server.address());
	}
	private listen() {
		this.server.listen({ port: this.listeningPort, host: this.listeningAddress }, () => { this.callback(); });
	}
	private callback() {
		console.log("listen callback:", this.server.address());
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
		connect.once(Connection.Events.INITIALIZED, () => { console.log("Server got id:", connect.peerId); });
	}
	getAddress() {
		return this.server.address();
	}
	probeId(host: string, port: number) {
		return probeId({ host, port });
	}
	close() {
		console.log("Closing server!");
		this.server.close(console.error);
	}
	log() {
		console.log("networking info:\n\taddress:", this.server.address());
	}
}

const networking = Networking.instance;

export { networking };