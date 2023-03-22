export function updateTasks(ns,id,task) {
	let tasks = ns.read('currentTasks.txt');//Get the current Task list
	let taskString = '';
	if(tasks == null) {//no list yet. Generate a fake one.
		let numSleeves = ns.getNumSleeves();
		for(let i; i< numSleeves; i++) {
			if(i==id){
				taskString += task+' ';
				continue;
			}
			taskString += i+' ';
		}
	} else {
		tasks = tasks.split(' ');
		tasks[id] = task;//replace the correct sleeve's task
		taskString = '';
		for(let word in tasks) {
			taskString += word+' ';//It's ok if there's a spare space
		}
	}
	ns.write('currentTasks.txt',taskString);
}

/** @param {NS} ns */
export async function main(ns) {
	//Automatically gets the sleeves generating XP if they are done shock-ing
	while(true) {
		await ns.sleep(2000);//Let other scripts run for a bit
		let max = ns.sleeve.getNumSleeves();

		for( let i=0;i<max;i++) {
			let mySleeve = ns.sleeve.getSleeve(i);


			if(mySleeve.shock > 0) {
				ns.sleeve.setToShockRecovery(i); 
				continue;
			}
			if(mySleeve.sync < 100) {
				ns.sleeve.setToSynchronize(i);
				continue;
			}
			
			//We only bother with augmentations if we're fully deshocked and synced.
			let currRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
			let needed = ns.getScriptRam('sleeveBuyAug.js');
			if(currRam > needed) ns.run('sleeveBuyAug.js',1,i);//This costs more ram than I'd like. Only use it up when we can afford it.

			//At this point, the sleeve is good to start helping. If we have ram available, find the next task and assign it.
			/* Can't run sleeveTask.js until we have Singularity apparently...
			currRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
			needed = ns.getScriptRam('sleeveTask.js');
			let task = [];
			if(currRam > needed) {
				ns.run('sleeveTask.js');
				await ns.sleep(1000); //give sleeveTask time to select a task
				task = ns.read('nextTask.txt').split(' ');
			} else task = ['crime','Homicide'];//If we can't run the task-finder due to insufficient ram, just go do crimes for money
			//*/
			let task = ['crime','Homicide'];

			switch(task[0]) {
				case 'faction':
					ns.sleeve.setToFactionWork(i,task[1],'hacking');
				case 'crime':
					ns.sleeve.setToCommitCrime(i,task[1]);
				default:
					updateTasks(ns,i,task[1]);
			}
		}
	}
}
