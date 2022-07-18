import TcpSocket from "react-native-tcp-socket";
import { getId } from "./id";
import type { BannerMessage } from "./netMessages";

const options = {
	port: 5000,
	host: "10.0.2.200"
};

async function generateBanner() {
	let obj: BannerMessage = {
		type: "Banner",
		id: await getId()
	};
	return obj;
}

export function sendHelloWorld() {
	console.log("Creating demo socket");

	// Create socket
	const client = TcpSocket.createConnection(options, () => {
		// Write on the socket
		client.write('Hello server!\n', "utf-8", () => { client.destroy() });

		console.log("Local address:", client.localAddress);
		console.log("remote address:", client.remoteAddress);

		// Close socket
		// client.destroy();
	});

	client.on('data', function (data) {
		console.log('message was received', data);
	});

	client.on('error', function (error) {
		console.log(error);
	});

	client.on('close', function () {
		console.log('Connection closed!');
	});
}

class Networking {
	server: TcpSocket.Server;
	listeningPort: number;
	listeningAddress: string;
	static counter: number = 0;
	counter: number = 0;

	constructor(listeningPort: number, listeningAddress: string = "0.0.0.0") {
		this.server = TcpSocket.createServer((socket) => { this.incomingConnection(socket); });
		this.listeningAddress = listeningAddress;
		this.listeningPort = listeningPort;
		this.server.on('error', (e: any) => {
			let str = String(e);
			if (str.search("EADDRINUSE") != -1) {
				this.counter++;
				console.log('Address in use, retrying...', this.counter);
				setTimeout(() => {
					this.server.close();
					this.listen();
				}, 1000);
			}});
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
		socket.on('data', (data) => {
			socket.write('Echo server ' + data);
		});

		socket.on('error', (error) => {
			console.log('An error ocurred with client socket ', error);
		});

		socket.on('close', (error) => {
			console.log('Closed connection with ', socket.address());
		});
		socket.write("Hello from server:\n");
		socket.write(JSON.stringify(await generateBanner()) + "\n");
	}
	getAddress() {
		return this.server.address();
	}
	sendHello() {
		sendHelloWorld();
	}

}

const networking = new Networking(5000);

export { networking };