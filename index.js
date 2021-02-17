// firstExample();
// secondExample();
// thirdExample();
asyncExample();

function firstExample() {
	console.log("Priority of the tasks with no time delay.");

	// L1
	// Will be executed right away, because it is in the main thread.
	console.log("🥪 Synchronous 1");

	// L2
	// Will be planned to be executed on the next iteration of the event loop.
	// setTimeout and setInterval is using the Microtasks queue.
	// Macrotasks queue has tasks that will be executer on the next iteration of the event loop(or on the next).
	// Even if the task will be added to the Macrotask queue in the current iteration, it still will be executed
	// in the future iterations of the Event loop.
	setTimeout(_ => console.log("🍅 Timeout 2"), 0);

	// L3
	// Will be planned to be executed in the end of the iteration.
	// Promises is using the Microtasks queue.
	// All microtasks will ALL be executed at the end of the current iteration.
	// Even if we add a new task in the microtasks queue, they still will be executed
	// in the end of the current iteration.
	Promise.resolve().then(_ => console.log("🥑 Promise 3"))

	// L4
	// Will be executed right away, because it is in the main thread.
	console.log("🥪 Synchronous 4");


	/*
	Response will be:
	🥪 Synchronous 1
	🥪 Synchronous 4
	🥑 Promise 3
	🍅 Timeout 2
	*/
}

function secondExample() {
	console.log("Blocking main event loop with promise")
	// L1
	// Will be executed right away, because it is in the main thread.
	console.time("s1");
	console.log("🥪 Synchronous 1");
	console.timeLog("s1");

	function codeBlocker() {
		// ONLY resolving the value happens in the microtask!
		// Thats why the loop inside will be executed in the main thread.
		return new Promise((resolve, reject) => {
			let i = 0;
			while(i < 1000000000) {i++;}
			resolve();
		});
	}

	codeBlocker().then(() => {
		console.log("🐷 Billion loops done");
		console.timeLog("s1");
	});

	// L3
	// SHOULD be executed right away, because it is in the main thread.
	// But even we wrap or codeBlocker in the Promise, it still will be in the main thread,
	// because creating of the Promise is still happenning in the current loop.
	console.log("🥪 Synchronous 3");
	console.timeLog("s1");
}

function thirdExample() {
	console.log("Not blocking main event loop with promise")
	// L1
	// Will be executed right away, because it is in the main thread.
	console.time("s1");
	console.log("🥪 Synchronous 1");
	console.timeLog("s1");

	function codeBlocker() {
		// When we add a resolve, we ensure that all the code below will be
		// running in the microtask.
		// ONLY resolving the value happens in the microtask!
		// Will be executed onl y when all the current macrotasks will be completed.
		return Promise.resolve().then((resolve) => {
			let i = 0;
			while(i < 1000000000) {i++;}
			console.log("🐷 Billion loops done");
			console.timeLog("s1");
		});
	}

	codeBlocker();

	// L3
	// SHOULD be executed right away, because it is in the main thread.
	// But even we wrap or codeBlocker in the Promise, it still will be in the main thread,
	// because creating of the Promise is still happenning in the current loop.
	console.log("🥪 Synchronous 3");
	console.timeLog("s1");
}

function asyncExample() {
	// Every function with an async keyword returs Promise as a result.
	const getFruit = async (fruitName) => {
		const fruits = {
			"apple": "🍏",
			"pineapple": "🍍",
			"peach": "🍑",
			"strawberry": "🍓",
		};

		await new Promise(resolve => {
			setTimeout(resolve, 1000);
		});

		return fruits[fruitName];
	};

	// Returns promise
	// console.log("getFruit", getFruit("peach"));

	// We should resolve the promise when we want to get a fruit
	// getFruit("peach").then(console.log);

	const makeSmoothySlow = async () => {
		// Await pause the execution of the function while it doesn't get a result
		// Wait until finish 1st request
		const pineapple = await getFruit("pineapple");
		// Wait until finish 2nd request
		const strawberry = await getFruit("strawberry");

		// This function is run the code not in the parallel
		return [pineapple, strawberry];
	};


	const makeSmoothy = async () => {
		// Await pause the execution of the function while it doesn't get a result
		const pineapple = getFruit("pineapple");
		const strawberry = getFruit("strawberry");

		// Here we run two async functions in parallel
		const smoothy = await Promise.all([pineapple, strawberry]);

		return smoothy;
	};

	console.time("s1");
	makeSmoothySlow().then(val => { console.log(val); console.timeLog("s1"); });

	console.time("s2");
	makeSmoothy().then(val => { console.log(val); console.timeLog("s2"); });
	
}