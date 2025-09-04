import React, { useState, useEffect } from "react";
import { logEvent } from "../middleware/logger";

interface ShortenedUrl {
  originalUrl: string;
  shortUrl: string;
  expiry?: number;
  expiresAt?: number; // timestamp when it expires
  clicks: number;
  custom?: string;
}

const UrlShortener: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [currentUrls, setCurrentUrls] = useState([
    { originalUrl: "", expiry: "", custom: "" },
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  const isValidUrl = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };
  const isValidExpiry = (value: string) => value === "" || (/^\d+$/.test(value) && parseInt(value) > 0);
  const isValidCustom = (value: string) => value === "" || /^[a-zA-Z0-9_-]+$/.test(value);

  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...currentUrls];
    updated[index][field as keyof typeof updated[0]] = value;
    setCurrentUrls(updated);
  };

  const addUrlInput = () => {
    if (currentUrls.length < 5) setCurrentUrls([...currentUrls, { originalUrl: "", expiry: "", custom: "" }]);
  };

  const handleShorten = () => {
    const newShortened: ShortenedUrl[] = [];
    const newErrors: string[] = [];

    for (let i = 0; i < currentUrls.length; i++) {
      const { originalUrl, expiry, custom } = currentUrls[i];

      if (!originalUrl || !isValidUrl(originalUrl)) { newErrors[i] = `Invalid URL in row ${i + 1}`; continue; }
      if (!isValidExpiry(expiry)) { newErrors[i] = `Expiry must be positive integer in row ${i + 1}`; continue; }
      if (!isValidCustom(custom)) { newErrors[i] = `Custom short code invalid in row ${i + 1}`; continue; }

      const shortCode = custom || Math.random().toString(36).substring(2, 8);
      const shortUrl = `http://short.ly/${shortCode}`;
      const expiresAt = expiry ? Date.now() + parseInt(expiry) * 60 * 1000 : undefined;

      newShortened.push({
        originalUrl,
        shortUrl,
        expiry: expiry ? parseInt(expiry) : undefined,
        expiresAt,
        clicks: 0,
        custom: custom || undefined,
      });

      logEvent("info", "component", `Shortened URL: ${shortUrl} for ${originalUrl}`);
    }

    if (newErrors.length > 0) { setErrors(newErrors); return; }

    setUrls([...urls, ...newShortened]);
    setCurrentUrls([{ originalUrl: "", expiry: "", custom: "" }]);
    setErrors([]);
  };

  const handleClickShortUrl = (index: number) => {
    const updatedUrls = [...urls];
    updatedUrls[index].clicks += 1;
    setUrls(updatedUrls);
    window.open(updatedUrls[index].originalUrl, "_blank");
    logEvent("info", "component", `Clicked short URL: ${updatedUrls[index].shortUrl}`);
  };

  // Expiry check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const activeUrls = urls.filter(url => !url.expiresAt || url.expiresAt > now);
      if (activeUrls.length !== urls.length) {
        setUrls(activeUrls);
        logEvent("info", "component", `Expired URLs removed`);
      }
    }, 1000); // check every second

    return () => clearInterval(interval);
  }, [urls]);

  return (
    <div className="container">
      <h2>Batch URL Shortener</h2>

      {currentUrls.map((urlObj, index) => (
        <div key={index} className="url-input-row">
          <input
            type="text"
            placeholder={`Enter URL #${index + 1}`}
            value={urlObj.originalUrl}
            onChange={(e) => handleInputChange(index, "originalUrl", e.target.value)}
          />
          <input
            type="text"
            placeholder="Expiry (minutes, optional)"
            value={urlObj.expiry}
            onChange={(e) => handleInputChange(index, "expiry", e.target.value)}
          />
          <input
            type="text"
            placeholder="Custom short URL (optional)"
            value={urlObj.custom}
            onChange={(e) => handleInputChange(index, "custom", e.target.value)}
          />
          {errors[index] && <span className="error">{errors[index]}</span>}
        </div>
      ))}

      <div className="buttons">
        {currentUrls.length < 5 && <button className="add-btn" onClick={addUrlInput}>+ Add Another URL</button>}
        <button className="shorten-btn" onClick={handleShorten}>Shorten URLs</button>
      </div>

      {urls.length > 0 && (
        <div className="shortened-list">
          <h3>Shortened URLs & Stats</h3>
          <table>
            <thead>
              <tr>
                <th>Short URL</th>
                <th>Original URL</th>
                <th>Expiry (min)</th>
                <th>Custom Code</th>
                <th>Clicks</th>
                <th>Time Left</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((u, index) => (
                <tr key={index}>
                  <td><a onClick={() => handleClickShortUrl(index)}>{u.shortUrl}</a></td>
                  <td>{u.originalUrl}</td>
                  <td>{u.expiry ?? "-"}</td>
                  <td>{u.custom ?? "-"}</td>
                  <td>{u.clicks}</td>
                  <td>
                    {u.expiresAt ? Math.max(0, Math.ceil((u.expiresAt - Date.now()) / 60000)) + " min" : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .container { max-width: 900px; margin: 20px auto; padding: 20px; background: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        h2 { text-align: center; margin-bottom: 20px; }
        .url-input-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
        .url-input-row input { flex: 1; padding: 8px; border-radius: 5px; border: 1px solid #ccc; }
        .error { color: red; flex-basis: 100%; }
        .buttons { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .add-btn, .shorten-btn { flex: 1; padding: 10px; border: none; border-radius: 5px; color: white; cursor: pointer; }
        .add-btn { background: #6c757d; }
        .shorten-btn { background: #007bff; }
        .shortened-list table { width: 100%; border-collapse: collapse; }
        .shortened-list th, .shortened-list td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        .shortened-list th { background: #007bff; color: white; }
        .shortened-list a { color: #007bff; cursor: pointer; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default UrlShortener;
