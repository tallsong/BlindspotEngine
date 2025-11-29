"use client";

import { useState } from "react";

export default function Home() {
  const [view, setView] = useState<"onboarding" | "viewing">("onboarding");
  const [expertTopics, setExpertTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [epiphany, setEpiphany] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addTopic = () => {
    if (currentTopic.trim() && expertTopics.length < 3) {
      setExpertTopics([...expertTopics, currentTopic.trim()]);
      setCurrentTopic("");
    }
  };

  const removeTopic = (index: number) => {
    setExpertTopics(expertTopics.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setEpiphany(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/bridge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expert_topics: expertTopics,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch epiphany");
      }

      const data = await response.json();
      setEpiphany(data);
      setView("viewing");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setView("onboarding");
    setEpiphany(null);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1>The Blindspot Engine</h1>
        <p style={{ color: "#666" }}>Discover your Unknown Unknowns.</p>
      </header>

      {view === "onboarding" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section>
            <h2>Step 1: Define Your Expertise</h2>
            <p>Enter up to 3 topics you know well (e.g., "React", "Gardening", "Physics").</p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="text"
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTopic()}
                placeholder="Add a topic..."
                disabled={expertTopics.length >= 3}
                style={{ flex: 1, padding: "0.8rem", fontSize: "1rem" }}
              />
              <button
                onClick={addTopic}
                disabled={expertTopics.length >= 3}
                style={{ padding: "0.8rem", cursor: "pointer" }}
              >
                Add
              </button>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {expertTopics.map((topic, idx) => (
                <div key={idx} style={{
                  background: "#e0e0e0",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <span>{topic}</span>
                  <button
                    onClick={() => removeTopic(idx)}
                    style={{ border: "none", background: "none", cursor: "pointer", color: "red", fontWeight: "bold" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          <button
            onClick={handleGenerate}
            disabled={expertTopics.length === 0 || loading}
            style={{
              padding: "1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              borderRadius: "4px"
            }}
          >
            {loading ? "Discovering..." : "Reveal My Blindspot"}
          </button>

          {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}
        </div>
      )}

      {view === "viewing" && epiphany && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
          <div style={{
            border: "1px solid #ccc",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "600px",
            background: "#fff"
          }}>
            <div style={{ textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px", color: "#666", marginBottom: "0.5rem" }}>
              From Domain: {epiphany.concept_domain}
            </div>
            <h2 style={{ fontSize: "2rem", margin: "0 0 1rem 0" }}>{epiphany.concept_name}</h2>

            <p style={{ fontStyle: "italic", borderLeft: "4px solid #0070f3", paddingLeft: "1rem", margin: "1.5rem 0" }}>
              "{epiphany.explanation}"
            </p>

            <h3>The Bridge</h3>
            <p style={{ lineHeight: "1.6" }}>{epiphany.bridge}</p>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={handleReset}
              style={{ padding: "0.8rem 1.5rem", border: "1px solid #ccc", background: "white", cursor: "pointer", borderRadius: "4px" }}
            >
              ← Back
            </button>
            <button
              onClick={handleGenerate}
               style={{ padding: "0.8rem 1.5rem", backgroundColor: "#0070f3", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
            >
              Next Discovery
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
