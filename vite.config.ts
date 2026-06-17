import { readFileSync } from "node:fs";
import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";

import {
  remarkPlugins as _remarkPlugins,
  rehypePlugins as _rehypePlugins,
} from "./mdx.config.mjs";

// Plugin types from mdx-js's `unified` (v6 vfile) clash with the inferred
// shape pulled in from peer deps (v5 vfile). The runtime objects are
// correct — cast at the boundary instead of pulling in a unified type dep.
type PluggableList = NonNullable<Parameters<typeof mdx>[0]>["remarkPlugins"];
const remarkPlugins = _remarkPlugins as PluggableList;
const rehypePlugins = _rehypePlugins as PluggableList;

// `@mdx-js/rollup` registers an `enforce: "pre"` load hook for `.mdx`, and
// `@rollup/pluginutils`' `createFilter` strips the query string before
// matching — so a `?raw` import (used by `loadMdx.server.ts` via
// `import.meta.glob(..., { query: '?raw' })`) still gets compiled to MDX
// instead of returning the source text. This pre-plugin runs FIRST and
// short-circuits `*.mdx?raw` loads by reading the file directly, leaving
// non-`?raw` MDX imports for the real MDX transform.
// Bundle MDX *source text* (for runtime frontmatter parsing) under a
// synthetic virtual id so the @mdx-js/rollup transform never sees a .mdx
// extension on the import and can't try to compile the result. The caller
// (loadMdx.server.ts) does `import.meta.glob('/src/content/**/*.mdx', {
// query: '?raw', import: 'default', eager: true })`. We resolve any
// `*.mdx?raw` to `\0virtualcoffee:mdx-raw:<absolute-mdx-path>` and `load`
// it as `export default <stringified raw text>`. The leading `\0` keeps
// Rollup/Vite from running other resolveId hooks on it.
const MDX_RAW_PREFIX = "\0virtualcoffee:mdx-raw:";
const mdxRawPlugin: Plugin = {
  name: "virtualcoffee:mdx-raw",
  enforce: "pre",
  async resolveId(source, importer) {
    if (!source.endsWith(".mdx?raw")) return null;
    const bare = source.slice(0, -4); // drop "?raw"
    const resolved = await this.resolve(bare, importer, { skipSelf: true });
    if (!resolved) return null;
    return MDX_RAW_PREFIX + resolved.id;
  },
  load(id) {
    if (!id.startsWith(MDX_RAW_PREFIX)) return null;
    const filename = id.slice(MDX_RAW_PREFIX.length);
    const raw = readFileSync(filename, "utf-8");
    return `export default ${JSON.stringify(raw)};`;
  },
};

export default defineConfig({
  plugins: [
    mdxRawPlugin,
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins,
        rehypePlugins,
      }),
    },
    vinext({
      cache: {
        // Persist ISR / unstable_cache / revalidate across Worker isolates.
        // Binding name must match `kv_namespaces[].binding` in wrangler.jsonc.
        data: kvDataAdapter(),
      },
    }),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
  },
  // The Cloudflare plugin only registers `cloudflare:workers` for the worker
  // (ssr/rsc) environments. Server-only data modules that import `env` from it
  // get crawled by the *client* dep scan too, which can't resolve the virtual
  // module and aborts the whole optimize -> empty route manifest -> blanket
  // 404. Excluding it externalizes the import in the scan instead of failing.
  optimizeDeps: {
    exclude: ["cloudflare:workers"],
  },
});
