/** @param {NS} ns */
export async function main(ns) {
	let target = ns.args[0];
	if(target == null) target = 'home';
	let shareamount = ns.args[1];
	if(shareamount == null) shareamount = 1;

	let targetRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
	ns.print("targetRam: "+targetRam);

	//If we're targetting home, don't use up all available ram. If not, then make sure the script is on the target.
	if (target == 'home' && shareamount > 0.9) shareamount == Math.max((targetRam - 64)/targetRam,0);
	else ns.scp('share.js',target);

	let sram = ns.getScriptRam('share.js');
	ns.print("sram: "+sram);
	let threads = Math.floor((targetRam * shareamount)/sram);
	ns.print("threads: "+threads);

	ns.exec('share.js',target,threads);
}
