export function halfwiseThreadTargetting(ns,host,target) {
	let ramLeft = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);	
	let minRam = ns.getScriptRam('target.js');
	let id = 100;
	
	let threads = Math.max(Math.floor((ramLeft/minRam)/2),1);//use up half the available room

	let ram = minRam * threads;
	
	if (host == 'home') ramLeft = ramLeft - 32; //save some room
	while(ramLeft >= minRam) {//we we can have even 1 more copy
		if(ramLeft < ram) {//too many threads per copy
			threads = Math.max(Math.floor(threads/2),1);//try half that, min 1 thread (which we know fits)
			ram = minRam*threads;
			continue;//try again
		}
		//we can fit the current thread target, so create a copy, update ramLeft.
		ns.exec('target.js', host, threads, target,id);
		id++;
		ramLeft= ramLeft - ram;
	}
	return id-100;
}

export function dumbThreadTargetting(ns,host,target) {
	let ramLeft = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
	let minRam = ns.getScriptRam('target.js');
	let id = 100;

	let threads = 10;
	let ram = threads*minRam;

	if (host == 'home') ramLeft = ramLeft - 32; //save some room
	while(ramLeft >= minRam) {//we we can have even 1 more copy
		if(ramLeft < ram) {//too many threads per copy
			threads = Math.max(threads-1,1);//try one less threads, min 1 thread (which we know fits)
			ram = minRam*threads;
			continue;//try again
		}
		//we can fit the current thread target, so create a copy, update ramLeft.
		ns.exec('target.js', host, threads, target,id);
		id++;
		ramLeft= ramLeft - ram;
	}
	return id-100;
}

/** @param {NS} ns */
export async function main(ns) {
	let host = ns.args[0];
	if (host == undefined) host = ns.getHostname();
	let target = ns.args[1];
	if (target == undefined) target = 'n00dles';
	let protectedRam = ns.args[2];
	if (protectedRam == undefined) protectedRam = 32;//Save this much ram on home server

	ns.scp('target.js',host,'home');
	//id = halfwiseThreadTargetting(ns,host,target);
	let copies = dumbThreadTargetting(ns,host,target);
	ns.tprint("Filled "+host+" with "+copies+" copies of target.js");
}
