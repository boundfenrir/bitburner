export async function getServers(ns, target) {
	if (target == undefined) target = ns.getHostname();

	//ns.tprint("DEBUG file exists: " + ns.fileExists('serverList.txt'));

	if (ns.fileExists('serverList.txt')) {
		//ns.tprint("I'm gonna just stop you right there.");
		return getArray(ns, 'serverList.txt');
		//ns.tprint("I'm still here");
	} else {//we'll need to create the serverList.txt
		//ns.tprint("Gotta do it the hard way");
		let allServers = [];
		allServers.push(target);
		let checkList = ns.scan(target);

		while (checkList.length > 0) {
			let name = checkList.pop();
			if (!allServers.includes(name)) allServers.push(name);
			let temps = ns.scan(name);
			while (temps.length > 1) {//the last child is the parent
				let kid = temps.pop();
				if (kid != name) {//this was dumb, you'll never connect to yourself :P
					checkList.push(kid);
				}
			}
			await ns.sleep(1);//to let the game run while this function tallies it all up
		}

		//Now create serverList.txt
		await ns.write('serverList.txt', "", "w");//Make a clean file
		for (var id of allServers) {
			//ns.tprint("DEBUG id of server: " + id);
			await ns.write('serverList.txt', id + "\n", "a");
		}

		return allServers;
	}
}

export async function getArray(ns, file) {
	if (!ns.fileExists(file)) {
		//ns.print("File doens't exist!");
		return [];//Return an empty array.
	} else {
		let data = await ns.read(file);
		let array = data.split('\n');
		//ns.tprint("DEBUG array value: " + array);
		let i = array.length;
		if (array[i] == "" | array[i] == undefined) array.pop();//if the array ends in a newline, then we might get an empty ending. get rid of it for arrays
		return array;
	}
}

//This function doesn't seem to work right? Might be fine, haven't done thorough testing.
export async function terminalInsert(text) {
	// Acquire a reference to the terminal text field
	const terminalInput = document.getElementById("terminal-input");

	// Set the value to the command you want to run.
	terminalInput.value=text;

	// Get a reference to the React event handler.
	const handler = Object.keys(terminalInput)[1];

	// Perform an onChange event to set some internal values.
	terminalInput[handler].onChange({target:terminalInput});

	// Simulate an enter press
	terminalInput[handler].onKeyDown({key:'Enter',preventDefault:()=>null});
}

export async function sumii(ns,target, array,curSet) {
	if(curSet == undefined) curSet = '';
	let sets = 0;
	ns.disableLog('disableLog');
	ns.disableLog('sleep');

	let i = 0;//Used to track which array to cut off when searching deeper.
	for (let num of array) {//for every number in the array
		let newSet = curSet+','+num;
		//ns.print('Current Set:'+newSet);
		let localTarget = target-num;//subtract from our target
		//ns.print("Remainder:"+localTarget);
		if(localTarget == 0) {
			sets++;//if we have zeroed out the target, we found a possible set
			ns.print("Found solution:"+newSet);
			break; //Since every entry in the array is unique, there are no other numbers in the loop that will generate a 0
		}
		else if (localTarget > 0) {
			let newArray = array.slice(i);//we cut off anything earlier than the current entry, because we want distinct sets only, no going backwards.
			let deepSets = await sumii(ns,localTarget,newArray,newSet); //If we have a positive value left, we could potentially find sets another layer down. Recurse with new lower target.
			sets += deepSets;
		} else break;//Since the array is sorted, there is no point in checking the larger numbers; we've already capped out.
		i++;
		await ns.sleep(1);
	}

	return sets;
}

/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint("No, that is not how you play the game.");
	//let servers = await getServers(ns, 'home');
	//ns.tprint(servers);
}
