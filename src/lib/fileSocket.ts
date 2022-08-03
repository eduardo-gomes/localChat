import { Buffer } from "buffer";
import TcpSocket from "react-native-tcp-socket";
import RNFS from "react-native-fs";

class FileReceiver {
	server: TcpSocket.Server;
	listeningPort: number;
	listeningAddress: string;
	isBound = false;
	path: string
	promise: Promise<number>;
	promiseObj: { resolve: (value: number | PromiseLike<number>) => void, reject: (reason?: any) => void }
	addrPromise: Promise<{ address: string, port: number }>;

	constructor(path: string, listeningPort: number, listeningAddress: string = "0.0.0.0") {
		this.path = path;
		this.promiseObj = { resolve: function () { }, reject: function () { } };
		this.promise = new Promise(this.setPromiseCallback);
		this.server = TcpSocket.createServer((socket) => { this.incomingConnection(socket); });
		this.listeningAddress = listeningAddress;
		this.listeningPort = listeningPort;
		this.addrPromise = new Promise((resolve, reject) => {
			this.server.listen({ port: this.listeningPort, host: this.listeningAddress }, () => resolve(this.getAddress()));
			this.server.on("error", (e) => {
				reject(e);
				this.promiseObj.reject(e);
			})
		});
		this.server.on("listening", () => { this.onListen(); });
	}
	private setPromiseCallback(resolve: (value: number | PromiseLike<number>) => void, reject: (reason?: any) => void) {
		this.promiseObj = { resolve, reject };
	}
	private onListen() {
		this.isBound = true;
		console.log("File receiver listening:", this.server.address());
	}
	private async incomingConnection(socket: TcpSocket.Socket) {
		// this.close();//Close on first connection
		console.log("[File receiver] got connection");
		socket.on("data", (data) => {
			if (data instanceof Buffer)
				data = data.toString("binary");
			RNFS.write(this.path, data, -1, "ascii");
			console.log("[File]server got:", data.length);
		});

		socket.on("error", (error) => {
			console.log("[File]An error ocurred with client socket ", error);
			this.fail(error);
		});

		socket.on("close", (error) => {
			console.log("[File]Closed connection with ", socket.address());
			this.close();
		});
	}
	getAddress() {
		let addr = this.server.address();
		if (addr == null)
			throw "Addr on socket is null";
		return addr;
	}
	close() {
		console.log("Closing server!");
		this.end();
		this.server.close(console.error);
	}
	log() {
		console.log("networking info:\n\taddress:", this.server.address());
	}
	// useAddress() {
	// 	let addr = this.getAddress()?.address;
	// 	const port = this.getAddress()?.port;
	// 	const netInfo = useNetInfo();
	// 	if (netInfo.type == NetInfoStateType.wifi) {
	// 		addr = netInfo.details.ipAddress ?? addr;
	// 	}
	// 	return { address: addr, port: port };
	// }
	// useServerStatus() {
	// 	const [status, setStatus] = useState({ running: this.isBound });
	// 	useEffect(() => {
	// 		const handleStatusChange = () => {
	// 			setStatus({ running: this.isBound });
	// 		};
	// 		this.server.on("listening", handleStatusChange);
	// 		return () => { this.server.removeListener("listening", handleStatusChange); }
	// 	})
	// 	return status;
	// }
	private end() {//file successfully received
		this.promiseObj.resolve(0);
	}
	private fail(e?: any) {//file failed
		this.close();
		this.promiseObj.reject(e);
	}
	get getPromise() {
		return this.promise;
	}
}

function sendFile(path: string, size: number, { address, port }: { address: string, port: number }): Promise<void> {
	return new Promise((resolve, reject) => {
		const socket = TcpSocket.createConnection({ host: address, port });
		socket.on('connect', async () => {
			console.log("Send file connected, src:", address, port);
			const data = await RNFS.readFile(path, "ascii");//Should verify error
			socket.write(data, "binary", (err) => { if (err) reject(err); else resolve(); socket.end(); });
		})
		// socket.on('data', (data) => { this.data(data); });
		socket.on('error', function (error) {
			console.error(error);
			reject(error);
		});
		socket.on('close', () => { console.log("Send file onClose"); });
	});
}

export { FileReceiver, sendFile };