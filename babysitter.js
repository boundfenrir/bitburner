/** @param {NS} ns */
export async function main(ns) {
	let target = ns.args[0];
	if(target == null) target = 'n00dles';

	while(true) {
		await ns.grow(target);
	}
}
