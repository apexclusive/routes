// Genereert public/patch-tekst.html vanuit public/apex-verbeteringen.patch
const fs = require("fs");
const patch = fs.readFileSync("public/apex-verbeteringen.patch", "utf8");
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const style = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#060606; color:#f5f5f5; font-family:"Inter",ui-sans-serif,system-ui,sans-serif; padding:20px; }
  .bar { position:sticky; top:0; background:rgba(6,6,6,.95); padding:12px 0 14px; border-bottom:1px solid rgba(255,255,255,.12); margin-bottom:14px; z-index:5; }
  h1 { font-size:16px; margin-bottom:6px; }
  p { font-size:12.5px; color:#a3a3a3; margin-bottom:10px; line-height:1.55; }
  button { background:#ffe600; color:#060606; border:0; font-weight:700; font-size:13px; padding:9px 14px; border-radius:10px; cursor:pointer; margin-right:8px; }
  pre { white-space:pre-wrap; word-break:break-all; font-size:10.5px; line-height:1.45; color:#d4d4d4; background:#0c0c0c; border:1px solid rgba(255,255,255,.1); border-radius:12px; padding:14px; }
  .ok { color:#ffe600; font-size:12.5px; font-weight:600; }
`;

const page = `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Apex Routes — patch als tekst</title>
<style>${style}</style></head><body>
<div class="bar">
  <h1>Apex Routes — patch als tekst (5 commits)</h1>
  <p>Kopieer alles hieronder (kopieerknop of Ctrl+A/Ctrl+C) en plak het in een bestand <b>apex-verbeteringen.patch</b>. Dan in een nieuwe coding-sessie op <b>apexclusive/routes</b>: <code>git checkout main &amp;&amp; git pull &amp;&amp; git am apex-verbeteringen.patch</code>.</p>
  <button onclick="copyPatch()">📋 Kopieer patch</button>
  <span class="ok" id="status"></span>
</div>
<pre id="patch">${esc(patch)}</pre>
<script>
  async function copyPatch() {
    const t = document.getElementById("patch").textContent;
    try { await navigator.clipboard.writeText(t); }
    catch {
      const r = document.createRange(); r.selectNode(document.getElementById("patch"));
      getSelection().removeAllRanges(); getSelection().addRange(r);
      document.execCommand("copy");
    }
    document.getElementById("status").textContent = "✓ Gekopieerd — plak het in een .patch-bestand";
  }
</script>
</body></html>`;

fs.writeFileSync("public/patch-tekst.html", page);
console.log("bytes:", page.length);
