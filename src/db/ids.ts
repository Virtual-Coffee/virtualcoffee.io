import { v7, validate } from 'uuid';

/**
 * Row ids for the membership and submission pipelines.
 *
 * These ids appear in `/admin` URLs, so they are opaque rather than sequential:
 * a counter lets anyone holding one link guess its neighbours, and discloses how
 * many rows exist — worst of all for CoC reports. See `docs/adr/0008`.
 *
 * v7 rather than v4 because it is time-ordered: index locality on insert, and a
 * deterministic tie-break for the timestamp columns the admin lists sort by. The
 * trade is that the leading bits encode the creation time, so an id you already
 * hold reveals roughly when its row was created. The remaining 74 random bits are
 * what make it unguessable, which is the property the URLs need.
 */
export const newId = () => v7();

/**
 * Whether a route param is a well-formed id.
 *
 * Not politeness: Postgres rejects a malformed literal against a `uuid` column
 * with `22P02 invalid input syntax for type uuid`, so an unchecked param makes
 * `eq(table.id, param)` throw rather than simply match nothing. Every route that
 * reads an id from the URL has to pass it through here first.
 */
export const isId = (value: string) => validate(value);
