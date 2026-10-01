import { v7, validate } from 'uuid';

/**
 * Row ids for the membership and submission pipelines: opaque because they
 * appear in /admin URLs, v7 so they sort by creation and break timestamp ties.
 * See docs/adr/0008.
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
