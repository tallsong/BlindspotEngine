"use client";

import { useState } from "react";

type Question = string;

type QA = {
  question: string;
  answer: string;
};

type ScheduleItem = {
  time: string;
  activity: string;
  description: string;
  resource_type: string;
};

export default function Home() {
  const [step, setStep] = useState<"input" | "questions" | "plan">("input");

  // Step 1 State
  const [knownDomain, setKnownDomain] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [focus, setFocus] = useState("");

  // Step 2 State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  // Step 3 State
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Handlers
  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ known_domain: knownDomain, target_domain: targetDomain, focus: focus || null }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");
      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setStep("questions");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError("");

    const qaPairs = questions.map((q, i) => ({ question: q, answer: answers[i] }));

    try {
      const response = await fetch(`${apiUrl}/interview/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          known_domain: knownDomain,
          target_domain: targetDomain,
          focus: focus || null,
          qa_pairs: qaPairs
        }),
      });

      if (!response.ok) throw new Error("Failed to generate plan");
      const data = await response.json();
      setSchedule(data.schedule);
      setStep("plan");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Blindspot Engine</h1>
        <p style={{ color: "#666" }}>Bridging the gap between what you know and what you don't.</p>
      </header>

      {error && (
        <div style={{ padding: "1rem", backgroundColor: "#fee", color: "red", borderRadius: "8px", marginBottom: "2rem" }}>
          {error}
        </div>
      )}

      {/* STEP 1: INPUT */}
      {step === "input" && (
        <section style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "1.5rem" }}>Where do you want to go?</h2>
          <form onSubmit={handleStartInterview} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Known Domain (Expertise)</label>
              <input
                type="text"
                value={knownDomain}
                onChange={(e) => setKnownDomain(e.target.value)}
                placeholder="e.g. Software Engineering, Jazz Music"
                required
                style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Target Domain (Curiosity)</label>
              <input
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="e.g. Molecular Biology, Roman History"
                required
                style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Specific Focus (Optional)</label>
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. System Scaling, Leadership"
                style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: "1rem", backgroundColor: "#000", color: "#fff", borderRadius: "8px", border: "none", fontSize: "1.1rem", cursor: "pointer", marginTop: "1rem" }}
            >
              {loading ? "Analyzing..." : "Start Discovery"}
            </button>
          </form>
        </section>
      )}

      {/* STEP 2: QUESTIONS */}
      {step === "questions" && (
        <section>
          <h2 style={{ marginBottom: "1rem" }}>Let's Diagnose Your Blindspots</h2>
          <p style={{ marginBottom: "2rem", color: "#666" }}>Answer these questions to help us tailor your plan. Be honest - "I don't know" is a valid answer!</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {questions.map((q, idx) => (
              <div key={idx} style={{ padding: "1.5rem", backgroundColor: "#f9f9f9", borderRadius: "12px" }}>
                <p style={{ fontWeight: "bold", marginBottom: "1rem", fontSize: "1.1rem" }}>{idx + 1}. {q}</p>
                <textarea
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Your answer..."
                  rows={3}
                  style={{ width: "100%", padding: "1rem", borderRadius: "8px", border: "1px solid #ddd", fontSize: "1rem" }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
             <button
              onClick={handleGeneratePlan}
              disabled={loading}
              style={{ padding: "1rem 2rem", backgroundColor: "#000", color: "#fff", borderRadius: "8px", border: "none", fontSize: "1.1rem", cursor: "pointer" }}
            >
              {loading ? "Building Schedule..." : "Generate Learning Plan"}
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: PLAN (CALENDAR VIEW) */}
      {step === "plan" && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h2>Your 1-Day Intensive Plan</h2>
            <button onClick={() => setStep("input")} style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", background: "white", borderRadius: "4px", cursor: "pointer" }}>
              Start Over
            </button>
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            {schedule.map((item, idx) => (
              <div key={idx} style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: "1rem",
                backgroundColor: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                <div style={{
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "#333",
                  padding: "1rem"
                }}>
                  {item.time}
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{item.activity}</h3>
                    <span style={{
                      fontSize: "0.8rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "100px",
                      backgroundColor: "#eef",
                      color: "#0070f3",
                      fontWeight: "bold"
                    }}>
                      {item.resource_type}
                    </span>
                  </div>
                  <p style={{ color: "#555", lineHeight: "1.6", margin: 0 }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
