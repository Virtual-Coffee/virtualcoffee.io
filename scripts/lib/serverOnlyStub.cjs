// Preload for tsx scripts that import a `.server` module (`tsx --require`).
// `server-only` is no dependency: Next resolves it during a build, which a
// script never runs. Point it at the empty module Next uses for server code.
const Module = process.getBuiltinModule('node:module');

const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
	if (request === 'server-only') {
		return require.resolve('next/dist/compiled/server-only/empty');
	}
	return resolveFilename.call(this, request, ...rest);
};
