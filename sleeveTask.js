/** @param {NS} ns */
export async function main(ns) {
	let factions = ns.getPlayer().factions;

	let worstRep = 999999999;
	let worstFac = 'Daedelus';

	let currTasks = ns.read('currentTasks.txt');
	let tasks = currTasks.split(' ');

	for(let faction in factions) {
		if(tasks.includes(faction)) continue;//Skip factions we're already working for.
		let rep = ns.getFactionRep(faction);
		if(rep < worstRep) {
			worstRep = rep;
			worstFac = faction;
		}
	}

	ns.write('nextTask.txt','faction '+worstFac);
	//Need to define a reason to crime vs faction.
}
