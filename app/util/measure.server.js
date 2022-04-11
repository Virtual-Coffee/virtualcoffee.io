export default async function measure(fn, name) {
	console.log(`fetching ${name}`);
	const start = performance.now();
	const result = await fn();
	const stop = performance.now();
	const inSeconds = (stop - start) / 1000;
	const rounded = Number(inSeconds).toFixed(3);
	console.log(`${name}: ${rounded}s`);

	return result;
}
