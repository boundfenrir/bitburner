/** @param {NS} ns **/
export async function main(ns) {
	let target = ns.args[0];
	if (target == undefined) target = 'n00dles';
	//ns.tprint("Targeting " + target);

	while (true) {
		await ns.weaken(target);
		await ns.grow(target);
		await ns.weaken(target);
		await ns.hack(target);
	}
}
