/** @param {NS} ns */
export async function main(ns) {
	let target = ns.args[0];
	if (target == undefined) target = 'n00dles';
	let sleepytime = ns.args[1];
	if(sleepytime == undefined) sleepytime = 0;
	
	await ns.sleep(sleepytime);
	await ns.weaken(target);
}
