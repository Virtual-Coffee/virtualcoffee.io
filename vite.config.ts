import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "@mdx-js/rollup";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { defineConfig } from "vite";
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

export default defineConfig({
  plugins: [
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
