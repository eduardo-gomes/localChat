import { useEffect, useState } from "react";
import Zeroconf, { Service } from "react-native-zeroconf";
import { getContacts } from "./contactManager";
import { getId } from "./id";
import { networking } from "./socket";

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
	know_available.forEach((host) =>
		networking.connectAndGetId(host.address, host.port)
			.then((id) => console.log("[zeroconf] connected to:", id))
			.catch(() => console.log("[zeroconf] failed to", host)));
}

class Zeroconf_App {
	zeroconf: Zeroconf;
	is_waiting_timeout: boolean;
	timeout?: NodeJS.Timeout;
	scan_timeout?: NodeJS.Timeout;
	regular_scan_timeout: NodeJS.Timeout[];
	constructor() {
		this.regular_scan_timeout = [];
		this.is_waiting_timeout = false;
		this.zeroconf = new Zeroconf();
		this.zeroconf.on("update", () => {
			let got = this.getAvailable();
			if (!this.is_waiting_timeout) {
				this.is_waiting_timeout = true;
				auto_connect(got);
				setTimeout(() => { this.is_waiting_timeout = false; }, 3000);
			} else {
				if (this.timeout)
					clearTimeout(this.timeout);
				this.timeout = setTimeout(auto_connect, 3000, this.getAvailable());
			}
		})
		this.regular_scan();
	}
	private regular_scan() {
		//Scan for 15s, wait for 105s
		function interval(instance: Zeroconf_App) {
			console.log("[zeroconf] regular scan interval");
			instance.stop();
			instance.regular_scan_timeout[0] = setTimeout(regular, 120 * 1000, instance);

		}
		function regular(instance: Zeroconf_App) {
			console.log("[zeroconf] regular scan start");
			instance.start();
			instance.regular_scan_timeout[1] = setTimeout(interval, 15 * 1000, instance);
		};
		setTimeout(regular, 1500, this);
	}
	scan_until_timeout(milliseconds: number) {
		//stop regular scan:
		console.log("[zeroconf] stop regular scan");
		this.regular_scan_timeout.forEach(clearTimeout);

		if (this.scan_timeout)
			clearTimeout(this.scan_timeout);
		this.start();
		//Instead of stopping search, restart regular scan
		this.scan_timeout = setTimeout(() => this.regular_scan(), milliseconds);
	}
	start() {
		console.log("[zeroconf] start search");
		this.zeroconf.scan("local-chat", "tcp", "local.");
	}
	stop() {
		this.zeroconf.stop();
		console.log("[zeroconf] stop search");
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
	stop_unpublish() {
		getId().then((id) => {
			this.zeroconf.unpublishService(id)
		});
		this.regular_scan_timeout.forEach(clearTimeout);
	}
}

export default Zeroconf_App;
export type { Discovered_Host };