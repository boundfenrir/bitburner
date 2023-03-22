/** @param {NS} ns **/
export async function main(ns) {
	let target = ns.args[0];
	if (target == undefined) target = ns.getHostname();

	//ns.tprint("Nuking " + target);

	let root = ns.hasRootAccess(target);
	let ports = 0;
	if (!root) {
		if (ns.fileExists('BruteSSH.exe')) {
			ns.brutessh(target);
			ports++;
		}
		if (ns.fileExists('FTPCrack.exe')) {
			ns.ftpcrack(target);
			ports++;
		}
		if (ns.fileExists('relaySMTP.exe')) {
			ns.relaysmtp(target);
			ports++;
		}
		if (ns.fileExists('HTTPWorm.exe')) {
			ns.httpworm(target);
			ports++;
		}
		if (ns.fileExists('SQLInject.exe')) {
			ns.sqlinject(target);
			ports++;
		}
		if (ns.getServerNumPortsRequired(target) <= ports) ns.nuke(target);
		//TODO: Backdoor once I have singularity
	}
}
