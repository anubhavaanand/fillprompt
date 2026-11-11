// Shows how much the MCP server is used: `npm run stats:mcp` (last 30 days) or `npm run stats:mcp -- 7`.
const days = Number(process.argv[2]) || 30;
const KEY = 'sb_publishable_Cj7wD5R2tYT2reySsZ3ubQ_A9eCyWO6';
const res = await fetch('https://bckenxyvaavzysmdnepy.supabase.co/rest/v1/rpc/mt_mcp_stats', {
  method: 'POST',
  headers: { 'content-type': 'application/json', apikey: KEY, authorization: `Bearer ${KEY}` },
  body: JSON.stringify({ days }),
});
if (!res.ok) {
  console.error(`Could not read stats (${res.status}): ${await res.text()}`);
  console.error('Has supabase/mcp-usage.sql been run in the Supabase SQL editor?');
  process.exit(1);
}
const rows = await res.json();
const sum = (list, f) => list.reduce((n, r) => n + r[f], 0);

console.log(`fillprompt MCP usage, last ${days} days\n`);
if (!rows.length) {
  console.log('No calls yet.');
  process.exit(0);
}

const byTool = {};
for (const r of rows) (byTool[r.tool] ||= []).push(r);
console.log('Tool             Calls   Empty searches');
for (const [tool, list] of Object.entries(byTool)) {
  const empty = tool === 'search_prompts' ? String(sum(list, 'empty')) : '';
  console.log(`${tool.padEnd(16)} ${String(sum(list, 'calls')).padStart(5)}   ${empty}`);
}

const byKind = {};
for (const r of rows.filter((r) => r.tool === 'search_prompts')) byKind[r.kind || 'any'] = (byKind[r.kind || 'any'] || 0) + r.calls;
console.log('\nSearches by type: ' + Object.entries(byKind).map(([k, n]) => `${k} ${n}`).join(', '));

const byDay = {};
for (const r of rows) byDay[r.day] = (byDay[r.day] || 0) + r.calls;
console.log('\nDay          Calls');
for (const [day, n] of Object.entries(byDay)) console.log(`${day}   ${String(n).padStart(5)}  ${'#'.repeat(Math.min(n, 60))}`);
