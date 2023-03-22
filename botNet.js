export async function minServer(ns,ramFlag = false) {
	let ram = 999999999;
	let minServer = 'default';
	let servers = ns.getPurchasedServers();
	for (let server of servers) {
		let serverRAM = ns.getServerMaxRam(server);
		if (serverRAM < ram) {
			minServer = server;
			ram = serverRAM;
		}
	}
	ns.print("New smallest server '"+minServer+"' found with "+ram+" ram");
	if(ramFlag) return ram;
	else return minServer;
}

export async function maxAffordable(ns,savings = 0.75) {
	ns.disableLog('getServerMoneyAvailable'); //No need to spam logs that call this, since we're looking at our own money
	let ram = 2048; //1048576 is the max possible, but my real-world PC can't handle that many copies.
	let spendingMoney = ns.getServerMoneyAvailable('home') * (1-savings);

	let affordable = false;
	let cost;
	while(!affordable) {
		cost = ns.getPurchasedServerCost(ram);
		if(cost > spendingMoney) {
			ram = ram/2;
			if (ram < 64) return 0;//We kick out of the loop at 32 GB, as even if we can't afford it, it's still the minimum we will look for.
		} else affordable = true;
	}
	ns.print("Affordable ram of "+ram+" will cost $"+cost);
	ns.enableLog('getServerMoneyAvailable');
	return ram;
}

/** @param {NS} ns */
export async function main(ns) {
	let savings = ns.args[0];
	if (savings == undefined) savings = 0.75;

	//Use this to handle bitnodes with unusual server count limits
	let serverCountMax = 15;
	
	ns.disableLog('disableLog');
	ns.disableLog('enableLog');
	//ns.tail();

	let loop = true;
	let sleepyTime = 1000;
	while(loop) {
		//if(sleepyTime >= 30000) break; //Temporary script-killer whie I'm debugging
		await ns.sleep(sleepyTime);
		sleepyTime = sleepyTime * 2; //keeps checks low when things are slow. Waste not processing time.

		let maxRAM = await maxAffordable(ns,savings);
		ns.print("Affordable Ram:",maxRAM);
		let id = ns.getPurchasedServers().length + 1;
		ns.print("Current Purchased Servers Count:"+id);
		if (maxRAM >= 32) {//don't buy tiny servers
			//First check if we need to delete a server
			ns.print("Buying a server...");
			if (id >= (serverCountMax+1)) { //remember id is current server count + 1
				//find and delete smallest server
				ns.print("Already at Max Servers");
				let smallServer = await minServer(ns);
				if (ns.getServerMaxRam(smallServer) >= maxRAM) continue; //If we can't afford more than the current smallest server, restart loop
				ns.print("Old server "+smallServer+ " is smaller than potential new server ram "+maxRAM);
				id = smallServer; //if we delete a server, use it's old name for the new name.
				ns.killall(smallServer);//Cleanup old server before we can kill it.
				ns.deleteServer(smallServer);
				ns.print("Deleted old server: "+smallServer);
			}
			ns.purchaseServer(id,maxRAM);
			//Now setup the new server to hack n00dles forever. TODO This will be replaced once a batching script is written.
			ns.print("Setting up new server "+id);
			while (ns.getServerMaxRam('home') - ns.getServerUsedRam('home') < ns.getScriptRam('fastfill.js')) await ns.sleep(100);
			//ns.scp('batch.js',id,'home');
			//await ns.scp('fastfill.js',id,'home'); //I don't think I need to do this; fastfill is running on home.
			await ns.exec('fastfill.js','home', 1, id);
			sleepyTime = 1000; //Reset sleepytime if we actually purchase a server.
		} else ns.print("Couldn't afford a new server");
	}
}
