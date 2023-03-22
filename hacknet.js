/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('getServerMoneyAvailable');
	//ns.tail();

	// /*
	let savings = ns.args[0]; //Percentage of current money to save
	if (savings == undefined) savings = 0.95; //Only spend 5% of my cash on Hacknet upgrades.

	let loop = true; //Allows me to define killing the loop later on if needed
	let sleepytime = 2000;

	while(loop) {
		await ns.sleep(2000); //give other functions a chance to run.
		sleepytime = sleepytime*2;//slows down how often we check when things are slow

		let spendingMoney = ns.getServerMoneyAvailable('home') * (1-savings);

		if (ns.hacknet.getPurchaseNodeCost() <= spendingMoney) {
			ns.print("Buying a new Hacknet node...");
			ns.hacknet.purchaseNode();
			spendingMoney = ns.getServerMoneyAvailable('home') * (1-savings);
			sleepytime = 2000;
		}
		//*/

		let servers = ns.hacknet.numNodes();
		ns.print("Examining "+servers+" servers for potential upgrades...");
		for(let i = 0; i < servers; i++) {
			ns.print("Checking Hacknet server "+i+" for upgrades");
			if (ns.hacknet.getLevelUpgradeCost(i) <= spendingMoney) {
				ns.print("Upgrading Level");
				ns.hacknet.upgradeLevel(i);
				spendingMoney = ns.getServerMoneyAvailable('home') * (1-savings);
				sleepytime = 2000;
			}
			if (ns.hacknet.getRamUpgradeCost(i) <= spendingMoney) {
				ns.print("Upgrading RAM");
				ns.hacknet.upgradeRam(i);
				spendingMoney = ns.getServerMoneyAvailable('home') * (1-savings);
				sleepytime = 2000;
			}
			if (ns.hacknet.getCoreUpgradeCost(i) <= spendingMoney) {
				ns.print("Upgrading Cores");
				ns.hacknet.upgradeCore(i);
				spendingMoney = ns.getServerMoneyAvailable('home') * (1-savings);
				sleepytime = 2000;
			}
		}
	}
	//*/
}
