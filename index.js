// firstExample();
// secondExample();
// thirdExample();
// asyncExample();
// mapAsyncExample();
stepByStepExample();

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

// ATTENTION!
// Await pause only async function execution, not all program.
function mapAsyncExample() {
	// Every function with an async keyword returs Promise as a result.
	const getFruit = async (fruitName) => {
		const fruits = {
			"apple": "🍏",
			"pineapple": "🍍",
			"peach": "🍑",
			"strawberry": "🍓",
		};

		await new Promise(resolve => {
			setTimeout(resolve, Math.random() * 1000);
		});

		return fruits[fruitName];
	};

	const listFruits = ["apple", "pineapple", "peach", "strawberry"];

	// If we want to iterate through await there are few ways
	
	// 1. Resolve all awaits using Promise.all
	// All tasks are running in parallel.
	const parallelAsync = async () => {
		const fruitPromises = listFruits.map(v => getFruit(v));

		// Promise.all returns all results in the correct order,
		// but it doesn't guaranted that all promises was executed in the same order.
		const fruitsIcons = await Promise.all(fruitPromises);
		console.log("fi", fruitsIcons);
	}

	//parallelAsync();

	// 2. The same behaviour if we use forEach or map loop.
	// It is doen't really pause the function in this context.
	// All promises here will be running concurrently.
	// It DOES NOT save the order like Promise.all,
	// so the result will be in random order.
	listFruits.map(async v => {
		const emoji = await getFruit(v);
		//console.log(emoji);
		return emoji;
	});

	// 3. The only way to use await in the loop - is the for...of loop.
	// It is waits the previuos iteration end before start new await.
	const fruitLoop = async () => {
		console.time("forOfFruitLoop");
		for ( const c of listFruits ) {
			const emoji = await getFruit(c);
			console.log(emoji);
			console.timeLog("forOfFruitLoop");
		}
	};

	// fruitLoop();

	// 4. We can use await inside the for...of declaration
	const fruitPromises2 = listFruits.map(v => getFruit(v));
	const fruitLoop2 = async () => {
		console.time("forOfFruitLoop2");
		for await ( const emoji of fruitPromises2 ) {
			console.log(emoji);
			console.timeLog("forOfFruitLoop2");
		}
	};

	fruitLoop2();
}
function stepByStepExample() {
	// Basically, there are next struture of the event loop:
	// 1. Call Stack. It is a stack, so we can add a tasks one by one on the top of it
	// and it will execute them until they are exists.
	// 
	// 2. WebApis. Exept from the event loop we have a browser powers.
	// So, setTimeout, addEventListeners, Fetch, XMLHttpRequest and many others - are all WebApi.
	// When we call setStimeout, it goes to the Callback Stack, and goes to the WebApis.
	// WebApis executes setTimeout and after it is resolves push it's callback to the Callback Queue.
	// The same with Fetch, XHR and addEventListener - they all called from the Call Stack,
	// executes using browser WebApis, push they callbacks to the Callback Queue.
	//
	// 3. Callback Queue. It is a queue of tasks.
	// The tasks will go here from the WebApi.
	//
	// 4. Event Loop itself.
	// The only function of the Event Loop - is take the first task from the Callback Queue when Call Stack is empty.
	// So, it takes the first tasks and push it to the Call Stack, Cal Stack will start immediately to run the task.

	// Example.
	// Call Stack is empty.
	// We take the first task and push it to the Call Stack.
	// It runs it immediatelly, log the value and Call Stack is now empty.
	console.log("🍏 First step");

	// Call stack is empty.
	// We push an addEventListener to it.
	// As it is a Web API, it is goes to the Web Apis area.
	// Now Web Api is watching for the clicks, but now Call Stack is empty,
	// Callback Queue is empty.
	document.addEventListener("click", _ => console.log("🍍 Second step"));

	// Call stack is empty.
	// We push a setTimeout to it.
	// As it is a Web API, it is goes to the Web Apis area and waits 1000 second.
	setTimeout(_ => console.log("🍑 Third step"), 1000);

	// Call stack is empty.
	// We push the console.log to it, executes it immediately.
	// So the next line in the console will be the line below.
	console.log("🍓 Last step");

	// If there was no click until 1 sec is passed,
	// then timer is finished it is work and push it's callback to the Callback Queue.
	// Callback queue now has 1 task.
	// Event loop runs, looks to the Call Stack and see it is empty.
	// It takes the task from the Callback queue and pushes it to the Call Stack.
	// Call Stack runs the task and log Third step on the screen.

	// After 1 sec or earlier if there were clicks, addEventListener gets click and
	// pushes its callback to the Callback Queue.
	// Event loop get the first taks from this queue(becaues Call Stack is empty)
	// and pushes it to the Call Stack, where it executes.

	/*
		Result
		🍏 First step
		🍓 Last step
		🍑 Third step

		// Click
		🍍 Second step
		// Click
		🍍 Second step
	*/
}

function rAFExample() {
	// Except the all queues named before there are one more queue - Render Queue.
	// Browser calls repaint not on every iteration of the Event Loop.
	// It calls it with frequency mor or less equal to the display refresh rate(f.e 60Hz).
	// When it calls it - we repaint the value.
	// 
	// There are 5 steps
	// 1. Done the tasks in the Call Stack.
	// 2. Goes to the first of the repaint steps - requestAnimationFrame step
	//    At this step we calculate the callback of the requestAnimationFrame function.
	// 3. Style calculation step - calculating the styles for each element
	// 4. Layout calculation step - build the render tree and figure out where each element should be.
	// 5. Pixel painting step - create an actual pixel data, actual painting.
	
	document.addEventListener("click", function() {
		// These 3 lines will be calculated on the task execution step,
		// thats why the el will be moving only from 0 to 500px, not to 1000px
		//
		// el.style.transform = "translateX(1000px)";
		// el.style.transition = "transform 1s ease-in-out";
		// el.style.transform = "translateX(500px)";


		// We can think about doing the last transform in the rAf,
		// But it still will moving from 0 to 500px.
		// Reason is simple - we calculate the first 2 lines in the Call Stack,
		// but before the repaint we calculate a new value in the rAF.
		// And only then - repaint.
		//
		// el.style.transform = "translateX(1000px)";
		// el.style.transition = "transform 1s ease-in-out";

		// requestAnimationFrame(() => {
			// el.style.transform = "translateX(500px)";
		// })


		// Only solution - plan the next translate on the next rAF in the current rAF
		//
		// el.style.transform = "translateX(1000px)";
		// el.style.transition = "transform 1s ease-in-out";

		// requestAnimationFrame(() => {
			// requestAnimationFrame(() => {
				// el.style.transform = "translateX(500px)";
			// })
		// })
		
	});
}

function moreMicrotaskExamples() {
	document.addEventListener("click", function() {
		Promise.resolve().then(() => console.log("Microtask 1"));
		console.log("Listener 1");
	});

	document.addEventListener("click", function() {
		Promise.resolve().then(() => console.log("Microtask 2"));
		console.log("Listener 2");
	});

	// If we click using mouse:
	// Listener 1, Microtask 1, Listener 2, Microtask 2

	// If we click using document.click();
	// Listener 1, Listener 2, Microtask 1, Microtask 2
	// This happens because when we send an event from code,
	// the callbacks will be called immediatelly(syncronous) without planning in the event loop.
}