import React, { useState } from "react";
import "./index.css";

export default function ActiveClientsFilterApp() {
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [keyword, setKeyword] = useState("Актив");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<string[]>([]);

  function parseLineToFields(line: string): string[] {
    let parts = line.split("\t").map((p) => p.trim());
    if (parts.length === 1) parts = line.split(/\s{2,}/g).map((p) => p.trim());
    if (parts.length === 1) parts = line.split(/\s+/g).map((p) => p.trim());
    return parts.filter(Boolean);
  }

  function prettifySource(src: string): string {
    return src.replace(/\s*TG$/i, "").trim();
  }

  function formatRow(parts: string[]): string | null {
    if (parts.length < 6) return null;
    const name = parts[0]?.trim();
    const age = parts[1]?.trim();
    const source = prettifySource(parts[2] || "");
    const date = parts[4]?.trim();
    const city = parts[5]?.trim();
    if (!name || !age || !city || !source || !date) return null;
    return `${name} ${age} ${city} ${source} ${date}`;
  }

  function filterActive(text: string): string[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const activeLines = lines.filter(l => l.includes(keyword));
    const formatted: string[] = [];
    for (const line of activeLines) {
      const parts = parseLineToFields(line);
      const fmt = formatRow(parts);
      if (fmt) formatted.push(fmt);
    }
    return formatted;
  }

  async function handleFetch() {
    setError("");
    setLoading(true);
    setResults([]);
    try {
      if (!url) throw new Error("Link to file");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} — can't upload file`);
      const text = await res.text();
      setResults(filterActive(text));
    } catch (e: any) {
      setError(e?.message || "Upload error");
    } finally {
      setLoading(false);
    }
  }

  function handleFromRaw() {
    setError("");
    setResults(filterActive(rawText));
  }

  function handleCopy() {
    if (!results.length) return;
    navigator.clipboard.writeText(results.join("\n"));
  }

  function handleDownload() {
    const blob = new Blob([results.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "active_clients.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasResults = results.length > 0;

  return (
    <div className="container">
      <h1>Client Filter</h1>
      <p>Add txt file to filter clients</p>
      <div className="input-group">
        <input placeholder="https://.../clients.txt" value={url} onChange={e => setUrl(e.target.value)} />
        <button onClick={handleFetch} disabled={loading}>{loading ? "Loading..." : "Upload and filter"}</button>
      </div>
      <div className="input-group">
        <textarea placeholder="Clients list..." value={rawText} onChange={e => setRawText(e.target.value)} />
        <button onClick={handleFromRaw}>Filter clients</button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="results">
        {hasResults ? (
          <ul>{results.map((r,i) => <li key={i}>{r}</li>)}</ul>
        ) : (
          <p>Empty, add list of clients...</p>
        )}
        <div className="actions">
          <button onClick={handleCopy} disabled={!hasResults}>Copy</button>
          <button onClick={handleDownload} disabled={!hasResults}>Download .txt</button>
        </div>
      </div>
    </div>
  );
}