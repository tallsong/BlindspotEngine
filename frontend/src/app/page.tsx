"use client";

import { useState } from "react";

type ScheduleItem = {
  time: string;
  activity: string;
  description: string;
  resource_type: string;
};

export default function Home() {
  const [step, setStep] = useState<"input" | "questions" | "plan">("input");

  // Step 1 Inputs
  const [knownDomain, setKnownDomain] = useState("");
  const [targetDomain, setTargetDomain] = useState("");
  const [focus, setFocus] = useState("");

  // Step 2 Questions
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  // Step 3 Plan
  const [plan, setPlan] = useState<ScheduleItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleGenerateQuestions = async () => {
    if (!knownDomain || !targetDomain) {
      setError("Please fill in Known Domain and Target Domain.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/generate_questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          known_domain: knownDomain,
          target_domain: targetDomain,
          focus: focus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions.");
      }

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
    // Validate answers?
    if (answers.some(a => !a.trim())) {
      setError("Please answer all questions.");
      return;
    }

    setLoading(true);
    setError("");

    const qaList = questions.map((q, i) => ({
      question: q,
      answer: answers[i],
    }));

    try {
      const response = await fetch(`${apiUrl}/generate_plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          known_domain: knownDomain,
          target_domain: targetDomain,
          focus: focus,
          qa_list: qaList,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan.");
      }

      const data = await response.json();
      setPlan(data.schedule);
      setStep("plan");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setKnownDomain("");
    setTargetDomain("");
    setFocus("");
    setQuestions([]);
    setAnswers([]);
    setPlan([]);
    setError("");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1>The Blindspot Engine</h1>
        <p style={{ color: "#666" }}>Discover your Unknown Unknowns.</p>
      </header>

      {error && (
        <div style={{
          background: "#ffebee",
          color: "#c62828",
          padding: "1rem",
          borderRadius: "4px",
          marginBottom: "1rem",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      {step === "input" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <section>
            <h2>Step 1: Setup Context</h2>
            <p>Tell us what you know and what you want to learn.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label htmlFor="knownDomain" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Known Domain</label>
                <input
                  id="knownDomain"
                  type="text"
                  value={knownDomain}
                  onChange={(e) => setKnownDomain(e.target.value)}
                  placeholder="e.g., Python Programming"
                  style={{ width: "100%", padding: "0.8rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>

              <div>
                <label htmlFor="targetDomain" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Target Domain</label>
                <input
                  id="targetDomain"
                  type="text"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  placeholder="e.g., Molecular Biology"
                  style={{ width: "100%", padding: "0.8rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>

              <div>
                <label htmlFor="focus" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Focus (Optional)</label>
                <input
                  id="focus"
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g., Protein Folding"
                  style={{ width: "100%", padding: "0.8rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
            </div>
          </section>

          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            style={{
              padding: "1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              borderRadius: "4px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Generating Questions..." : "Next: Diagnostic Questions"}
          </button>
        </div>
      )}

      {step === "questions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <section>
            <h2>Step 2: Diagnostic Questions</h2>
            <p>Answer these questions to help us assess your blindspots.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {questions.map((q, idx) => (
                <div key={idx}>
                  <p style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{idx + 1}. {q}</p>
                  <textarea
                    value={answers[idx]}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[idx] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                    placeholder="Your answer..."
                    rows={3}
                    style={{ width: "100%", padding: "0.8rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}
                  />
                </div>
              ))}
            </div>
          </section>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            style={{
              padding: "1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              borderRadius: "4px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Creating Plan..." : "Generate Learning Plan"}
          </button>
        </div>
      )}

      {step === "plan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <section>
            <h2>Step 3: Your Learning Schedule</h2>
            <p>A tailored 1-day plan to bridge {knownDomain} and {targetDomain}.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {plan.map((item, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                }}>
                  <div style={{
                    backgroundColor: "#f5f5f5",
                    padding: "1rem",
                    width: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "#555",
                    borderRight: "1px solid #e0e0e0"
                  }}>
                    {item.time}
                  </div>
                  <div style={{ padding: "1rem", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{item.activity}</h3>
                      <span style={{
                        fontSize: "0.8rem",
                        backgroundColor: "#e3f2fd",
                        color: "#1565c0",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "12px",
                        height: "fit-content"
                      }}>
                        {item.resource_type}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: "#666", lineHeight: "1.5" }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            onClick={handleReset}
            style={{
              padding: "1rem",
              backgroundColor: "#fff",
              color: "#333",
              border: "1px solid #ccc",
              cursor: "pointer",
              fontSize: "1rem",
              borderRadius: "4px"
            }}
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
