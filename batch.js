/** @param {NS} ns */
export async function main(ns) {
	let target = ns.args[0];
	if(target == undefined) target = 'n00dles';
	let host = ns.args[1];
	if(host == undefined) host = ns.getHostname();
	let seperator = ns.args[2];
	if(seperator == undefined) seperator = 0;

	ns.tprint("Running batcher for "+host);

	let money = ns.getServerMaxMoney(target) * 0.75; //By default, we want 3/4ths of the max money.

	//ns.tail();

	//Move scripts to the host for running.
	ns.scp('hack.js',host,'home');
	ns.scp('grow.js',host,'home');
	ns.scp('weaken.js',host,'home');

	//Calculate needed threads
	let weakenCost = ns.getScriptRam('weaken.js');
	let growCost = ns.getScriptRam('grow.js');
	let hackCost = ns.getScriptRam('hack.js');

	//Calculate sleep times (replace this with library function later)
	let weakTime = ns.getWeakenTime(target);
	let growthTime = ns.getGrowTime(target);
	let hackingTime = ns.getHackTime(target);
	let longest = Math.max(weakTime,growthTime,hackingTime);

	let loop = 0;
	while(true) {
		let ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
		if(host == 'home') ram = ram-32;
		if(ram <= 0) {
			await ns.sleep(1);
			continue;
		}
		//ns.print("Target:"+target);
		//ns.print("Money:$"+money);
		//ns.print("Threads needed: "+ns.hackAnalyzeThreads(target,money));

		let hackThreads = Math.max(Math.ceil(ns.hackAnalyzeThreads(target,money)),1);
		//ns.print("Hackthreads:"+hackThreads);
		let hackSecurity = ns.hackAnalyzeSecurity(hackThreads,target);
		//ns.print("hackSecurity:"+hackSecurity);
		let weaken1Threads = Math.max(Math.ceil(hackSecurity/ns.weakenAnalyze(1)),1);
		//ns.print("Weaken1Threads:"+weaken1Threads);
		let growthThreads = Math.max(Math.ceil(ns.growthAnalyze(target,2)),1);
		//ns.print("growthThreads:"+growthThreads);
		let growthSecurity = ns.growthAnalyzeSecurity(growthThreads,target,1);
		//ns.print("growthSecurity:"+growthSecurity);
		let weaken2Threads = Math.max(Math.ceil(growthSecurity/ns.weakenAnalyze(1)),1);
		ns.print("weaken2Threads:"+weaken2Threads);

		let neededRam = (hackThreads * hackCost) + (weaken1Threads * weakenCost) + (growthThreads * growCost) + (weaken2Threads * weakenCost);
		//ns.print("neededRam:"+neededRam);
		//if needed threads don't fit, use only what does
		if (neededRam > ram) {
			ns.print("Not enough ram: delaying...");
			ns.sleep(1);
			continue;
		}

		// /*
		ns.print("WGWH cycle:");
		ns.print(">RAM:    "+neededRam);
		ns.print(">Weaken: "+weaken1Threads+", "+(30+longest-weakTime));
		ns.print(">Grow:   "+growthThreads+", "+(20+longest-growthTime));
		ns.print(">Weaken: "+weaken2Threads+", "+(10+longest-weakTime));
		ns.print(">Hack:   "+hackThreads+", "+(longest-hackingTime));
		// */
		
		//Run the WGWH cycle
		let success = 1;
		success = ns.exec('weaken.js',host,weaken1Threads,target,(longest-weakTime)+30,seperator+loop);
		if(success != 0) success = ns.exec('grow.js',host,growthThreads,target,(longest-growthTime)+20,seperator+loop);
		if(success != 0) success = ns.exec('weaken.js',host,weaken2Threads,target,(longest-weakTime)+10,seperator+loop);
		if(success != 0) success = ns.exec('hack.js',host,hackThreads,target,(longest-hackingTime),seperator+loop);
		
		loop++;
		if(loop >= 100) loop = 0;//keeps this number from getting messy
		await ns.sleep(1);//Sleep for the minimal amount of time.
	}
}
