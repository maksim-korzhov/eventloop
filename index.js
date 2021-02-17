// Priority of the tasks with no time delay.
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