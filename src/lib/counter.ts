// Copy counter. Counts live in Supabase (project "my-threads", objects prefixed mt_) and are
// reached only through two functions: mt_copy_bump(k) adds one, mt_copy_get(k) reads.
// The key below is the publishable one and is meant to be shipped to the browser.
export const COUNTER = {
  url: 'https://bckenxyvaavzysmdnepy.supabase.co/rest/v1/rpc',
  key: 'sb_publishable_Cj7wD5R2tYT2reySsZ3ubQ_A9eCyWO6',
  /** A prompt shows its count only from this many copies, so new prompts do not read "copied 0 times". */
  minShown: 5,
};
