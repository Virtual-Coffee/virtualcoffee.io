// Probe paths this site has never served: dotfiles, WordPress, PHP/ASP shells
// and Vite's RSC endpoints. `/__nextjs_*` is deliberately not listed.
const neverServed =
	/^\/(?:\.(?:env|git|aws|ssh|svn|ds_store)(?:\/|$|\.)|wp-|__vite_rsc)|\.(?:php\d?|asp|aspx|jsp|cgi)$/i;

export function isNeverServedPath(pathname: string): boolean {
	return neverServed.test(pathname);
}
