<!-- markdownlint-disable MD036 -->
# Netlify Bandwidth & Serverless Function Optimization Plan

**Version:** 1.0
**Date:** November 10, 2025
**Last Updated:** November 10, 2025
**Next Review:** After Phase 1 implementation
**Issue:** Bandwidth and serverless function spike starting October 11, 2025
**Status:** Root cause identified, immediate fixes applied, long-term optimizations needed

---

## Table of Contents

1. [Executive Summary](#executive-summary)
   - [Impact Timeline](#impact-timeline)
   - [Current State](#current-state)
2. [Root Cause Analysis](#root-cause-analysis)
   - [The Critical Commits](#the-critical-commits)
   - [Why This Caused Massive Bandwidth Usage](#why-this-caused-massive-bandwidth-usage)
3. [Immediate Recommendations (Quick Wins)](#immediate-recommendations-quick-wins)
   - [Priority 1: Add Serverless Function Caching](#priority-1-add-serverless-function-caching)
   - [Priority 2: Lazy Load the Member Map](#priority-2-lazy-load-the-member-map)
   - [Priority 3: Fix Broken Resource Paths](#priority-3-fix-broken-resource-paths)
4. [Long-term Solutions](#long-term-solutions)
   - [Solution 1: Use a Tile CDN Proxy](#solution-1-use-a-tile-cdn-proxy)
   - [Solution 2: Cache GitHub Avatars Locally](#solution-2-cache-github-avatars-locally)
   - [Solution 3: Add Feature Flags](#solution-3-add-feature-flags)
   - [Solution 4: Add Monitoring & Alerts](#solution-4-add-monitoring--alerts)
5. [Implementation Roadmap](#implementation-roadmap)
   - [Phase 1: Immediate Fixes (This Week)](#phase-1-immediate-fixes-this-week)
   - [Phase 2: Infrastructure Improvements (Next Sprint)](#phase-2-infrastructure-improvements-next-sprint)
   - [Phase 3: Optimization & Monitoring (Future)](#phase-3-optimization--monitoring-future)
6. [Testing & Validation](#testing--validation)
   - [Before Deploying Changes](#before-deploying-changes)
   - [Success Criteria](#success-criteria)
7. [Preventative Measures](#preventative-measures)
   - [Code Review Checklist](#code-review-checklist)
   - [Development Guidelines](#development-guidelines)
8. [Emergency Response Plan](#emergency-response-plan)
   - [If Bandwidth Spikes Again](#if-bandwidth-spikes-again)
9. [Additional Resources](#additional-resources)
   - [Relevant Documentation](#relevant-documentation)
   - [Related Files](#related-files)
   - [Team Contacts](#team-contacts)
10. [Conclusion](#conclusion)

---

## Executive Summary

On October 11, 2025, Virtual Coffee's Netlify bandwidth and serverless function usage spiked significantly. Investigation revealed the root cause: **the Member Map feature was accidentally re-enabled in production while in a broken state**, remaining broken for 3+ days through multiple deployment cycles.

The map had been deliberately disabled in October 2024 for performance reasons but was inadvertently re-enabled during an attempt to fix marker icon issues.

### Impact Timeline

- **October 1, 2024**: Map disabled in production to reduce bandwidth
- **October 11, 2025**: Map re-enabled with broken marker icons (commit: bea0d53)
- **October 11-14, 2025**: Map running broken in production (3+ days)
- **October 14, 2025**: Map finally fixed (commit: eab94db)
- **Damage**: 3+ days of excessive bandwidth from tile requests, failed icon loads, and increased serverless function calls

### Current State

The map is now functional but remains a significant bandwidth consumer due to lack of caching infrastructure.

---

## Root Cause Analysis

### The Critical Commits

#### October 11, 2025 (The Spike Day)

**Commit bea0d53** - "fix broken map marker images on the members map"

Changes that caused the spike:

```typescript
// BEFORE: Map disabled in production
export default function MemberMap({ members }: { members: MappableMember[] }) {
  if (process.env.NODE_ENV === 'development') {
    return <div>Map disabled in local dev</div>;
  }
  // ... render map
}

// AFTER: Development check commented out, map enabled in broken state
export default function MemberMap({ members }: { members: MappableMember[] }) {
  // if (process.env.NODE_ENV === 'development') { // ❌ COMMENTED OUT
  //   return <div>Map disabled in local dev</div>;
  // }
  // ... render map with broken icons
}
```

Additional problematic changes:

- Upgraded `react-leaflet` v4.2.1 → v5.0.0 (major version during bug fix)
- Upgraded `react-leaflet-cluster` v2.1.0 → v3.1.1
- Changed icon path without testing: `'assets/images/...'` (missing leading `/`)

**Two follow-up commits same day:**

- 30584a4 - Second fix attempt (still broken)
- 8258499 - Attempted to restore dev mode check (map still enabled)

#### October 14, 2025 (The Fix)

**Commit eab94db** (#1421) - "fix broken map marker images on the members map"

- Created new `MapLoaderDev` component with proper dev/prod separation
- Fixed icon implementation
- But 3 days of damage already done

### Why This Caused Massive Bandwidth Usage

#### 1. OpenStreetMap Tile Requests (PRIMARY CAUSE)

**Location:** `src/app/members/components/MemberMap.tsx`

```typescript
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
/>
```

**Problem:**

- Hundreds of tiles loaded per page visit to `/members`
- Direct requests to OpenStreetMap servers (no CDN)
- No local caching
- Every zoom/pan = new tile requests
- Multiply by all visitors over 3+ days

**Why it was disabled:** This exact issue led to disabling the map in October 2024.

#### 2. Failed Marker Icon Requests

**Location:** `src/app/members/components/MemberMap.tsx:36-38`

```typescript
const icon = new L.Icon({
  iconUrl: avatarUrl || 'assets/images/virtual-coffee-mug-circle.svg', // ❌ Missing leading /
  iconSize: [24, 24],
});
```

**Problem:**

- Broken path for fallback icon (missing `/`)
- 100+ failed HTTP requests per page load (one per member with location data)
- 404 responses still consume bandwidth

#### 3. GitHub Avatar Loading

**Location:** Same icon creation, `avatarUrl` comes from member data

**Problem:**

- Each member marker loads external GitHub CDN image
- No local caching or CDN proxying
- Cold cache = fresh external requests for all avatars

#### 4. Serverless Function Calls (ONGOING ISSUE)

**Location:** `src/app/members/util/getMembers.ts:75`

```typescript
export async function getMembers() {
  console.log('Fetching member data...');
  // ... GitHub API calls
}
```

**Problem:**

- NO caching implemented (despite comment at line 72 mentioning On-Demand Builder)
- Called on EVERY `/members` page load
- Makes chunked GitHub GraphQL API queries (groups of 15 members)
- Rate limiting possible under high traffic

#### 5. Multiple Deploy Cycles

- 3 deployments on October 11 alone
- Each deploy = cache invalidation
- SEO bots recrawl after detecting changes
- Monitoring tools increase checks
- Users refresh repeatedly when seeing broken map

---

## Immediate Recommendations (Quick Wins)

### Priority 1: Add Serverless Function Caching

**File:** `src/app/members/util/getMembers.ts`

**Current Issue:** Line 72-74 has commented reference to On-Demand Builder but not implemented

```typescript
// TODO: Implement On-Demand Builder
// https://docs.netlify.com/configure-builds/on-demand-builders/

export async function getMembers() {
  console.log('Fetching member data...');
  // Fresh fetch every time ❌
}
```

**Solution:** Enable Next.js ISR (Incremental Static Regeneration) or Netlify On-Demand Builders

**Implementation Option A: Next.js Revalidation**

Since this is Next.js 15 App Router, use `revalidate`:

```typescript
// In the page component that calls getMembers()
export const revalidate = 3600; // Revalidate every hour

// Or use cache tags
export async function getMembers() {
  'use cache';
  const cacheTag = 'members-data';
  // ... fetch logic
}
```

**Implementation Option B: Add in-memory cache**

```typescript
let membersCache: {
  data: MemberObject[] | null;
  timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_TTL = 3600000; // 1 hour in ms

export async function getMembers() {
  const now = Date.now();

  // Return cached data if valid
  if (membersCache.data && (now - membersCache.timestamp) < CACHE_TTL) {
    console.log('Returning cached member data');
    return membersCache.data;
  }

  console.log('Fetching fresh member data...');
  const data = await fetchMemberData();

  membersCache = { data, timestamp: now };
  return data;
}
```

**Estimated Impact:** Reduce serverless function calls by 90%+

---

### Priority 2: Lazy Load the Member Map

**File:** `src/app/members/page.tsx`

**Current:** Map loads immediately on page load

**Solution:** Only load map when user scrolls to it or clicks a button

```typescript
'use client';

import { lazy, Suspense, useState } from 'react';

const MemberMap = lazy(() => import('./components/MemberMap'));

export default function MembersPage() {
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      {/* Other content */}

      <div className="member-map-section">
        {!showMap ? (
          <button onClick={() => setShowMap(true)}>
            Load Member Map
          </button>
        ) : (
          <Suspense fallback={<div>Loading map...</div>}>
            <MemberMap members={mappableMembers} />
          </Suspense>
        )}
      </div>
    </>
  );
}
```

**Alternative: Intersection Observer**

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

export default function MembersPage() {
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );

    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mapContainerRef}>
      {shouldLoadMap && <MemberMap members={mappableMembers} />}
    </div>
  );
}
```

**Estimated Impact:** Reduce bandwidth by 30-50% (many users never scroll to map)

---

### Priority 3: Fix Broken Resource Paths

**File:** `src/app/members/components/MemberMap.tsx:36`

**Current:**

```typescript
iconUrl: avatarUrl || 'assets/images/virtual-coffee-mug-circle.svg',
```

**Fixed:**

```typescript
iconUrl: avatarUrl || '/assets/images/virtual-coffee-mug-circle.svg',
```

**Verify the file exists at:** `/public/assets/images/virtual-coffee-mug-circle.svg`

**Estimated Impact:** Eliminate failed 404 requests

---

## Long-term Solutions

### Solution 1: Use a Tile CDN Proxy

**Problem:** Direct requests to `tile.openstreetmap.org` are not cached

**Solution A: Netlify Edge Functions Proxy**

Create a proxy edge function to cache tiles:

**File:** `netlify/edge-functions/tile-proxy.ts`

```typescript
import type { Context } from '@netlify/edge-functions';

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const tilePath = url.pathname.replace('/tiles/', '');

  // Forward to OpenStreetMap
  const tileUrl = `https://tile.openstreetmap.org/${tilePath}`;

  const response = await fetch(tileUrl);

  // Clone response and add aggressive caching
  const cachedResponse = new Response(response.body, response);
  cachedResponse.headers.set('Cache-Control', 'public, max-age=604800'); // 7 days

  return cachedResponse;
};

export const config = { path: '/tiles/*' };
```

**Update MemberMap.tsx:**

```typescript
<TileLayer
  url="/tiles/{z}/{x}/{y}.png"  // Use local proxy
  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
/>
```

**Solution B: Use a Dedicated Tile CDN**

Replace OpenStreetMap with a CDN-backed provider:

```typescript
<TileLayer
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  attribution='&copy; OpenStreetMap, &copy; CartoDB'
  subdomains="abcd"
  maxZoom={19}
/>
```

CartoDB, Mapbox, and others offer CDN-backed tile services with better performance.

**Estimated Impact:** Reduce tile bandwidth by 70-90%

---

### Solution 2: Cache GitHub Avatars Locally

**Problem:** External GitHub CDN requests on every member map render

**Solution A: Netlify Image CDN**

Use Netlify's built-in image optimization (requires Business plan or higher):

```typescript
const optimizedAvatarUrl = avatarUrl
  ? `/.netlify/images?url=${encodeURIComponent(avatarUrl)}&w=48&h=48&fm=webp`
  : '/assets/images/virtual-coffee-mug-circle.svg';

const icon = new L.Icon({
  iconUrl: optimizedAvatarUrl,
  iconSize: [24, 24],
});
```

**Solution B: Build-time Avatar Download**

Add to `scripts/loadMemberFiles.ts` to download avatars during build:

```typescript
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

async function downloadAvatar(url: string, username: string) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const outputPath = join(process.cwd(), 'public', 'avatars', `${username}.jpg`);
    await mkdir(join(process.cwd(), 'public', 'avatars'), { recursive: true });
    await writeFile(outputPath, Buffer.from(buffer));
    return `/avatars/${username}.jpg`;
  } catch (error) {
    console.error(`Failed to download avatar for ${username}:`, error);
    return null;
  }
}

// Call during member file build
```

Then reference local avatars in member data.

**Estimated Impact:** Reduce external requests by 100+ per page load

---

### Solution 3: Add Feature Flags

**Problem:** High-bandwidth features can't be quickly disabled without code changes

**Solution:** Environment-based feature flags

**File:** `src/config/features.ts` (new file)

```typescript
export const features = {
  memberMap: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_MEMBER_MAP === 'true',
    lazy: process.env.NEXT_PUBLIC_LAZY_LOAD_MAP !== 'false', // Default true
  },
  // Add other feature flags
};
```

**Update MemberMap usage:**

```typescript
import { features } from '@/config/features';

export default function MembersPage() {
  return (
    <>
      {features.memberMap.enabled && (
        <MemberMapSection lazy={features.memberMap.lazy} />
      )}
    </>
  );
}
```

**In Netlify UI:**

- Set `NEXT_PUBLIC_ENABLE_MEMBER_MAP=true` for production
- Can quickly set to `false` if bandwidth spikes
- No deploy needed to disable (with edge functions)

**Estimated Impact:** Ability to immediately stop bandwidth issues

---

### Solution 4: Add Monitoring & Alerts

**Problem:** Bandwidth spike went unnoticed for days

**Solution A: Netlify Bandwidth Monitoring**

Set up Netlify webhooks or check bandwidth via API:

**File:** `scripts/check-bandwidth.js` (new file)

```javascript
// Run as a cron job or GitHub Action
const NETLIFY_API = 'https://api.netlify.com/api/v1';
const SITE_ID = process.env.NETLIFY_SITE_ID;
const TOKEN = process.env.NETLIFY_TOKEN;

async function checkBandwidth() {
  const response = await fetch(`${NETLIFY_API}/accounts/${accountId}/bandwidth`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const data = await response.json();
  const dailyAverage = calculateDailyAverage(data);
  const currentUsage = data.used;

  if (currentUsage > dailyAverage * 2) {
    // Alert via Slack/Discord webhook
    await sendAlert(`Bandwidth spike detected! Current: ${currentUsage}, Average: ${dailyAverage}`);
  }
}
```

**Solution B: Add Analytics Events**

Track expensive operations:

```typescript
// In MemberMap.tsx
useEffect(() => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'member_map_loaded', {
      member_count: members.length,
      has_location: members.filter(m => m.location).length,
    });
  }
}, [members]);
```

**Solution C: Serverless Function Logging**

Add structured logging to track function calls:

```typescript
export async function getMembers() {
  const startTime = Date.now();
  console.log(JSON.stringify({
    event: 'member_fetch_start',
    timestamp: new Date().toISOString(),
  }));

  try {
    const data = await fetchData();

    console.log(JSON.stringify({
      event: 'member_fetch_complete',
      duration: Date.now() - startTime,
      member_count: data.length,
    }));

    return data;
  } catch (error) {
    console.error(JSON.stringify({
      event: 'member_fetch_error',
      error: error.message,
    }));
    throw error;
  }
}
```

Use Netlify logs or external service (Datadog, LogDNA) to analyze.

**Estimated Impact:** Early detection of future issues

---

## Implementation Roadmap

### Phase 1: Immediate Fixes (This Week)

**Priority Level: CRITICAL**

1. ✅ **Fix broken icon path** - 15 minutes
   - File: `src/app/members/components/MemberMap.tsx:36`
   - Change: Add leading `/` to icon path
   - Impact: Eliminate 404 requests

2. ⬜ **Add serverless function caching** - 1-2 hours
   - File: `src/app/members/util/getMembers.ts`
   - Implementation: In-memory cache with 1-hour TTL
   - Impact: 90%+ reduction in function calls

3. ⬜ **Lazy load the map** - 2-3 hours
   - File: `src/app/members/page.tsx`
   - Implementation: Intersection Observer approach
   - Impact: 30-50% bandwidth reduction

**Estimated Total Impact:** 60-70% bandwidth reduction

---

### Phase 2: Infrastructure Improvements (Next Sprint)

**Priority Level: HIGH**

1. ⬜ **Implement tile CDN proxy** - 1 day
   - File: `netlify/edge-functions/tile-proxy.ts` (new)
   - Implementation: Edge function with 7-day cache
   - Impact: 70-90% tile bandwidth reduction

2. ⬜ **Add feature flags** - 2-3 hours
   - File: `src/config/features.ts` (new)
   - Implementation: Environment-based flags
   - Impact: Emergency bandwidth control

3. ⬜ **Implement Next.js ISR** - 3-4 hours
   - File: `src/app/members/page.tsx`
   - Implementation: `revalidate` or cache tags
   - Impact: Better caching, CDN hits

**Estimated Total Impact:** 80-90% bandwidth reduction from baseline

---

### Phase 3: Optimization & Monitoring (Future)

**Priority Level: MEDIUM**

1. ⬜ **Cache GitHub avatars** - 1-2 days
   - Files: `scripts/loadMemberFiles.ts`, member data
   - Implementation: Build-time download or Netlify Image CDN
   - Impact: Eliminate external avatar requests

2. ⬜ **Add bandwidth monitoring** - 1 day
   - File: `scripts/check-bandwidth.js` (new)
   - Implementation: Daily checks via GitHub Actions
   - Impact: Early detection of future spikes

3. ⬜ **Consider alternative map solution** - 3-5 days
   - Research: Static map images, simpler implementations
   - Implementation: TBD based on research
   - Impact: Potentially eliminate tile requests entirely

---

## Testing & Validation

### Before Deploying Changes

1. **Local Testing**

   ```bash
   pnpm dev
   # Visit http://localhost:9000/members
   # Open browser DevTools Network tab
   # Check for:
   # - Failed 404 requests (should be 0)
   # - Number of tile requests
   # - Number of avatar requests
   ```

2. **Preview Deploy Testing**

   ```bash
   git checkout -b optimize/bandwidth-reduction
   # Make changes
   git add .
   git commit -m "feat: implement bandwidth optimizations"
   git push origin optimize/bandwidth-reduction
   # Create PR and test on Netlify preview URL
   ```

3. **Monitor After Deploy**
   - Check Netlify dashboard bandwidth for 24-48 hours
   - Monitor serverless function invocations
   - Check for errors in function logs
   - Verify map still works correctly

### Success Criteria

- ✅ No 404 errors for map marker icons
- ✅ Serverless function calls < 100/day (down from 1000s)
- ✅ Bandwidth usage returns to pre-October 11 levels
- ✅ Map loads only when user scrolls to it
- ✅ Tile requests reduced by 70%+

---

## Preventative Measures

### Code Review Checklist

When reviewing PRs that touch high-bandwidth features:

- [ ] Does this change affect the Member Map?
- [ ] Does this add new external resource requests?
- [ ] Does this change serverless function caching?
- [ ] Have we tested on a preview deploy?
- [ ] Have we checked Network tab for request volume?
- [ ] Does this library upgrade affect rendering behavior?
- [ ] Are we removing any performance safeguards (like dev mode checks)?

### Development Guidelines

1. **Never upgrade major versions during bug fixes**
   - Test library upgrades separately
   - Use preview deploys for major version bumps

2. **Always test with Network tab open**
   - Monitor request volume
   - Check for failed requests
   - Verify caching headers

3. **Keep performance safeguards visible**
   - Don't comment out feature flags silently
   - Document why features are disabled
   - Use proper feature flag systems

4. **Test on preview deploys first**
   - Never merge directly to main for high-traffic features
   - Monitor preview deploy for 24 hours
   - Check Netlify analytics on preview

---

## Emergency Response Plan

### If Bandwidth Spikes Again

1. **Immediate Actions (< 5 minutes)**
   - Check Netlify dashboard for affected resources
   - Check recent commits (last 7 days)
   - Look for increased 404s or failed requests

2. **Quick Mitigation (< 30 minutes)**
   - If map is causing issue: Revert to commit before map changes
   - If serverless functions: Add rate limiting in `netlify.toml`:

     ```toml
     [[functions]]
       path = "/.netlify/functions/*"
       cache-control = "max-age=3600"
     ```

   - Deploy immediately

3. **Root Cause Analysis (< 2 hours)**
   - Review git diff of suspected commits
   - Check browser Network tab on production
   - Analyze Netlify function logs
   - Document findings (like this document)

4. **Long-term Fix (< 1 week)**
   - Implement proper solution
   - Test on preview deploy
   - Monitor for 48 hours before considering resolved

---

## Additional Resources

### Relevant Documentation

- [Netlify On-Demand Builders](https://docs.netlify.com/configure-builds/on-demand-builders/)
- [Next.js Incremental Static Regeneration](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)

### Related Files

- `src/app/members/components/MemberMap.tsx` - Map component
- `src/app/members/util/getMembers.ts` - Member data fetching
- `src/app/members/page.tsx` - Members page
- `netlify.toml` - Netlify configuration
- `next.config.mjs` - Next.js configuration

### Team Contacts

- Questions about member data: Check `src/content/members/README.md`
- Netlify access: Check team documentation
- Emergency deploy: Use Netlify UI rollback feature

---

## Conclusion

The October 11, 2025 bandwidth spike was caused by accidentally re-enabling the Member Map feature while it was in a broken state. The map was previously disabled specifically for performance reasons.

**Key Takeaways:**

1. High-bandwidth features need proper safeguards (feature flags)
2. Major library upgrades should not happen during bug fixes
3. Preview deploys are essential for features affecting performance
4. Monitoring is critical for early detection

**Immediate Actions:**

- Implement Phase 1 fixes (caching, lazy loading, path fixes)
- Add monitoring to catch future issues early
- Update PR review process to check bandwidth impact

**Long-term:**

- Build proper caching infrastructure
- Consider alternative map solutions
- Implement comprehensive feature flag system

This plan should reduce bandwidth by 80-90% compared to the spike period and return usage to pre-October 11 levels while maintaining feature functionality.
