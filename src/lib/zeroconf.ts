import { useEffect, useState } from "react";
import Zeroconf, { Service } from "react-native-zeroconf";
import { getContacts } from "./contactManager";
import { getId } from "./id";

type Discovered_Host = { id: string, address: string, port: number, alt?: string[] };

function service_to_host(service: Service): Discovered_Host {
	let alt = service.addresses.length > 1 ? service.addresses.slice(1) : undefined;
	return ({ id: service.name, address: service.addresses[0], port: service.port, alt })
}

function auto_connect(hosts: Discovered_Host[]) {
	const know_hosts = getContacts();
	const know_available = hosts.filter((host) => know_hosts.hasOwnProperty(host.id));
	console.log("[zeroconf] update: ", JSON.stringify(hosts));
	console.log("[zeroconf] known: ", JSON.stringify(know_available));
}

class Zeroconf_App {
	zeroconf: Zeroconf;
	timeout?: NodeJS.Timeout;
	constructor() {
		this.zeroconf = new Zeroconf();
		this.zeroconf.scan("local-chat", "tcp", "local.");
		this.zeroconf.on("update", () => {
			let got = this.getAvailable();
			if (this.timeout) {
				clearTimeout(this.timeout);
			}
			this.timeout = setTimeout(auto_connect, 3000, got);
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
		this.zeroconf.on("resolved", (service) => { service_listener(service_to_host(service)) });
	}
	getAvailable(): Discovered_Host[] {
		let available = Object.entries(this.zeroconf.getServices()).filter((e) => e[1].addresses != undefined).map<Discovered_Host>(([name, service]) => service_to_host(service));
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