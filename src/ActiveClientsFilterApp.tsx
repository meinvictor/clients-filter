// src/ActiveClientsFilterApp.tsx
import { useState } from "react";
import "./index.css";

export default function ActiveClientsFilterApp() {
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [keyword, setKeyword] = useState("Актив"); // використовується в фільтрі
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const parseLineToFields = (line: string): string[] => {
    let parts = line.split("\t").map(p => p.trim());
    if (parts.length === 1) parts = line.split(/\s{2,}/g).map(p => p.trim());
    if (parts.length === 1) parts = line.split(/\s+/g).map(p => p.trim());
    return parts.filter(Boolean);
  };

  const prettifySource = (src: string) => src.replace(/\s*TG$/i, "").trim();

  const formatRow = (parts: string[]): string | null => {
    if (parts.length < 6) return null;
    const [name, age, sourceRaw, , date, city] = parts;
    const source = prettifySource(sourceRaw);
    if (!name || !age || !city || !source || !date) return null;
    return `${name} ${age} ${city} ${source} ${date}`;
  };

  const filterActive = (text: string) =>
    text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .filter(l => l.includes(keyword))
      .map(line => formatRow(parseLineToFields(line)))
      .filter(Boolean) as string[];

  const handleFetch = async () => {
    setError("");
    setLoading(true);
    setResults([]);
    try {
      if (!url) throw new Error("Введи ссылку на текстовый файл.");
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} — не удалось загрузить файл`);
      const text = await res.text();
      setResults(filterActive(text));
    } catch (e: any) {
      setError(e?.message || "Ошибка загрузки/разбора");
    } finally {
      setLoading(false);
    }
  };

  const handleFromRaw = () => {
    setError("");
    setResults(filterActive(rawText));
  };

  const handleCopy = () => results.length && navigator.clipboard.writeText(results.join("\n"));

  const handleDownload = () => {
    const blob = new Blob([results.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "active_clients.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasResults = results.length > 0;

  return (
    <div className="container">
      <h1>Фильтр клиентов по статусу «Актив»</h1>
      <p>Вставь ссылку на текстовый файл или текст ниже и нажми фильтр.</p>

      <div className="input-group">
        <input placeholder="https://.../clients.txt" value={url} onChange={e => setUrl(e.target.value)} />
        <button onClick={handleFetch} disabled={loading}>{loading ? "Загрузка..." : "Загрузить и отфильтровать"}</button>
      </div>

      <div className="input-group">
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Ключевое слово" />
        <textarea placeholder="Вставь текст" value={rawText} onChange={e => setRawText(e.target.value)} />
        <button onClick={handleFromRaw}>Отфильтровать текст</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {hasResults ? <ul>{results.map((r,i) => <li key={i}>{r}</li>)}</ul> : <p>Пусто — загрузи файл или вставь текст.</p>}
        <div className="actions">
          <button onClick={handleCopy} disabled={!hasResults}>Копировать</button>
          <button onClick={handleDownload} disabled={!hasResults}>Скачать .txt</button>
        </div>
      </div>
    </div>
  );
}
