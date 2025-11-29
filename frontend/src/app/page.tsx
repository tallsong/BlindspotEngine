"use client";

import { useState } from "react";

export default function Home() {
  const [knownDomain, setKnownDomain] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/bridge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          known_domain: knownDomain,
          target_domain: targetDomain,
          focus: focus || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bridge");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>The Blindspot Engine</h1>
      <p>Discover Unknown Unknowns through Interdisciplinary Bridges.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Known Domain (What you know):</label>
          <input
            type="text"
            value={knownDomain}
            onChange={(e) => setKnownDomain(e.target.value)}
            placeholder="e.g. Software Engineering"
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Target Domain (What you don't know):</label>
          <input
            type="text"
            value={targetDomain}
            onChange={(e) => setTargetDomain(e.target.value)}
            placeholder="e.g. Agricultural History"
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Focus (Optional):</label>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. scaling"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "1rem", backgroundColor: "#0070f3", color: "white", border: "none", cursor: "pointer" }}
        >
          {loading ? "Generating..." : "Generate Bridge"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: "1rem" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
          <h2>Result</h2>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{result}</div>
        </div>
      )}
    </div>
  );
}
