// eslint-disable-next-line node/no-extraneous-import
import fetch from "node-fetch";

/* replace global fetch with node-fetch. required to mock graphql (requests by linear sdk) responses with nock. */

// @ts-ignore
global.fetch = fetch;
