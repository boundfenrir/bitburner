import { getServers } from 'library.js';

/** @param {NS} ns **/
export async function main(ns) {
	let servers = await getServers(ns, 'home');
	let host = ns.args[0];
	if (host == undefined) host = 'home';
	let self = ns.args[1];
	if (self == undefined) self = false;

	//TODO: determine best target to hack
	let target = 'n00dles';//This is a placeholder

	//servers = [servers[3]];
	while (servers.length > 0) {
		let server = servers.pop();
		//ns.tprint("expanding to " + server);
		if (server == host) continue;

		let script = ns.getScriptRam('nuke.js');
		while (ns.getServerMaxRam(host) - ns.getServerUsedRam(host) < script) await ns.sleep(100);
		await ns.exec('nuke.js', host, 1, server);

		script = ns.getScriptRam('setup.js');
		while (ns.getServerMaxRam(host) - ns.getServerUsedRam(host) < script) await ns.sleep(100);
		await ns.exec('setup.js', host, 1, server, target);
	}

	ns.tprint("Finished Expanding...");
	if (self) ns.exec('setup.js', host, 1, host);//Setup on ourselves when we're done
}
