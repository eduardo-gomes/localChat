import { useEffect, useState } from "react";
import Zeroconf from "react-native-zeroconf";
import { getId } from "./id";

type Discovered_Host = { id: string, address: string, port: number };

class Zeroconf_App {
	zeroconf: Zeroconf;
	constructor() {
		this.zeroconf = new Zeroconf();
		this.zeroconf.scan("local-chat", "tcp", "local.");
		this.zeroconf.on("resolved", (service) => {
			console.log("[zeroconf] got: ", JSON.stringify(service, undefined, 4));
		})
	}
	publish(port: number) {
		getId().then((id) => {
			this.zeroconf.unpublishService(id);
			this.zeroconf.publishService("local-chat", "tcp", "local.", id, port);
			console.log("[zeroconf]: announce:", id, "at", port);
		});
	}
	addListener(service_listener: (discovered: Discovered_Host) => void) {
		this.zeroconf.on("resolved", (service) => { service_listener({ id: service.name, address: service.addresses[0], port: service.port }) });
	}
	getAvailable(): Discovered_Host[] {
		let available = Object.entries(this.zeroconf.getServices()).map<Discovered_Host>(([name, service]) => ({ id: name, address: service.addresses[0], port: service.port }));
		return available;
	}
	useAvailable() {
		const [status, setStatus] = useState(this.getAvailable());
		useEffect(() => {
			const onUpdate = () => {
				setStatus(this.getAvailable());
			};
			this.zeroconf.on("update", onUpdate);
			return () => { this.zeroconf.removeListener("update", onUpdate); }
		})
		return status;
	}
	stop() {
		getId().then((id) => {
			this.zeroconf.unpublishService(id)
			this.zeroconf.stop();
		});
	}
}

export default Zeroconf_App;
export type { Discovered_Host };