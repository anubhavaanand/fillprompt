// Counts MCP tool calls per day, tool and prompt type in Supabase (see supabase/mcp-usage.sql).
// Nothing about the caller or the query is sent. Counting never delays or breaks a tool call:
// it runs after the response through waitUntil, and every failure is ignored.
import { waitUntil } from '@vercel/functions';

// The same project and publishable key as the copy counter in src/lib/counter.ts.
const RPC = 'https://bckenxyvaavzysmdnepy.supabase.co/rest/v1/rpc/mt_mcp_bump';
const KEY = 'sb_publishable_Cj7wD5R2tYT2reySsZ3ubQ_A9eCyWO6';

/** Record one call of `tool`; `kind` is the prompt type asked for, `zero` marks a search with no results. */
export function recordUsage(tool, kind = '', zero = false) {
  if (process.env.MCP_USAGE === 'off') return;
  const sent = fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json', apikey: KEY, authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ t: tool, k: kind || '', zero }),
    signal: AbortSignal.timeout(3000),
  }).catch(() => {});
  try {
    waitUntil(sent);
  } catch {
    // Outside Vercel there is no request context; the fetch still runs on its own.
  }
}
