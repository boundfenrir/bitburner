export function sleeveAugBuy(ns,id,augment) {
	//Buy augments for sleeves.
	//Returning 1 = Sleeve has augment
	//Returning 0 = Sleeve doesn't have augment
	if(augment == null) augment = 'Neurotrainer I';
	let augs = ns.sleeve.getSleeveAugmentations(id);

	if(augs.includes(augment)) return 1;
	if(ns.sleeve.getSleevePurchasableAugs(id).includes(augment)) return 0;//We can't buy this aug yet.
	if(ns.getServerMoneyAvailable('home') < ns.sleeve.getSleeveAugmentationPrice(augment)) return 0;//we couldn't afford it
	return ns.sleeve.purchaseSleeveAug(id,augment) ? 1 : 0;//Return results of attempting to buy the augment.
}

export function sleeveAugNext(ns,id) {
	let augments = ['Neurotrainer I','ADR-V1 Pheromone Gene'];

	let augs = ns.sleeve.getSleeveAugmentations(id);
	for(let aug in augments) {
		if(augs.includes(aug)) continue;//Already have this one.
		return aug;
	}
	return 0;
}

/** @param {NS} ns */
export async function main(ns) {
	let id = ns.args[0];
	if(id == null) id = 0;

	let augment = sleeveAugNext(ns,id);
	if(augment != 0) sleeveAugBuy(ns,id,augment);
}
