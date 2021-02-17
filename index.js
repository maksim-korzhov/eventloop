// firstExample();
secondExample();

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