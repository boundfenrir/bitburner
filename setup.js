/** @param {NS} ns **/
export async function main(ns) {
	let host = ns.args[0];
	if (host == undefined) host = ns.getHostname();
	let target = ns.args[1];
	if (target == undefined) target = 'n00dles';
	let protectedRam = ns.args[2];
	if (protectedRam == undefined) protectedRam = 32;//Save this much ram on home server

	//ns.tail();

	let ram = ns.getServerMaxRam(host)
	let script = ns.getScriptRam('target.js');
	let skill = ns.getHackingLevel();
	let difficulty = ns.getServerRequiredHackingLevel(target);
	let root = ns.hasRootAccess(host);
	if (!root) ns.tprint("Insufficient access: " + host);
	else if (script > ram) ns.tprint("Insufficient RAM: " + host);
	else if (skill < difficulty) ns.tprint("Insufficient Skill: " + target);
	else {
		let threads = Math.floor(ram / script);
		let targetMoney = ns.getServerMaxMoney(target) * 1;
		let maxThreads = Math.max(Math.ceil(ns.hackAnalyzeThreads(target,targetMoney)),1);
		ns.tprint("Targetting " + target + " from " + host);
		/*
		ns.tprint("Ram: " + script + "(" + (script * threads) + "/" + ram + ")");
		ns.tprint("Relative skill:" + skill + "/" + difficulty);
		ns.tprint("Threads:" + threads);
		//*/
		await ns.scp('target.js', host);

		//on non-home hosts free up as much space as possible
		//let processes = ns.ps(host);
		if (host != 'home') ns.killall(host);
		else threads = Math.floor((ns.getServerMaxRam(host) - protectedRam) / script);//on home only use what's available
		if (threads == 0) {
			ns.tprint("Insufficient RAM: " + host);
			return;
		}
		//ns.tprint("ns.exec('target.js'," + host + "," + threads + "," + target + ");");
		let numCopies = Math.max(Math.floor(threads/maxThreads),1); //We want at least 1 copy, but preferably as many as we can
		// /*
		ns.print("Target: "+target);
		ns.print("Target Money:"+targetMoney);
		ns.print("Max threads needed: "+maxThreads);
		ns.print("Threads available: "+threads);
		ns.print("Num Copies could be run: "+numCopies);
		//*/
		numCopies = Math.min(numCopies,100);//Sanity checker. While you could theoretically have more than this...this is enough.
		let i = 0;
		ns.disableLog('exec');
		ns.disableLog('sleep');
		while(i<numCopies) {
			let result = ns.exec('target.js', host, Math.min(threads,maxThreads), target,i);
			//ns.print("Creating copy "+i+" of setup.js on "+host);
			//ns.tprint("target pid: " + result);
			if (result == 0) {
				ns.tprint("FAILURE");
				ns.tprint("--HOST: " + host);
				ns.tprint("--TARGET: " + target);
				ns.tprint("--ram: " + ram);
				ns.tprint("--script: " + script);
				ns.tprint("--threads: " + threads);
				ns.tprint("--skill: " + skill);
				ns.tprint("--difficulty: " + difficulty)
				ns.tprint("--File exists?" + ns.fileExists('target.js', host));
			}
			i++;
			//ns.tprint("Running: " + ns.scriptRunning('target.js', host));
			if (i%10 == 0) await ns.sleep(1);//let other things happen for a second.
		}
	}
}
