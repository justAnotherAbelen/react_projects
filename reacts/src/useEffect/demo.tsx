import { useEffect, useState } from "react";

export default function UseEffectDemo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const [tick, setTick] = useState(0);
  const [effectRuns, setEffectRuns] = useState({
    everyRender: 0,
    mountOnly: 0,
    countEffect: 0,
    textEffect: 0,
    cleanupEffect: 0,
  });
  const [eventLogs, setEventLogs] = useState<string[]>([]);

  const schedule = (callback: () => void) => {
    setTimeout(callback, 0);
  };

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setEventLogs((prev) => [`${time} - ${message}`, ...prev].slice(0, 10));
  };

  // 1) No dependency array:
  // Runs after EVERY render (initial render + every update).
  useEffect(() => {
    schedule(() => {
      setEffectRuns((prev) => ({ ...prev, everyRender: prev.everyRender + 1 }));
      addLog("Effect A ran (no dependency array).");
    });
  });

  // 2) Empty dependency array []:
  // Runs only once after the first render (like componentDidMount).
  useEffect(() => {
    schedule(() => {
      setEffectRuns((prev) => ({ ...prev, mountOnly: prev.mountOnly + 1 }));
      addLog("Effect B ran once on mount ([]).");
    });
  }, []);

  // 3) Dependency array [count]:
  // Runs on first render and whenever "count" changes.
  useEffect(() => {
    schedule(() => {
      setEffectRuns((prev) => ({ ...prev, countEffect: prev.countEffect + 1 }));
      addLog(`Effect C ran because count changed to ${count}.`);
    });
  }, [count]);

  // 4) Dependency array [text]:
  // Runs on first render and whenever "text" changes.
  useEffect(() => {
    schedule(() => {
      setEffectRuns((prev) => ({ ...prev, textEffect: prev.textEffect + 1 }));
      addLog(`Effect D ran because text changed to "${text || "(empty)"}".`);
    });
  }, [text]);

  // Cleanup example:
  // Cleanup runs before the effect re-runs and when component unmounts.
  useEffect(() => {
    schedule(() => {
      addLog("Effect E started interval; cleanup runs on next count change.");
    });
    const id = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 3000);

    return () => {
      clearInterval(id);
      schedule(() => {
        setEffectRuns((prev) => ({ ...prev, cleanupEffect: prev.cleanupEffect + 1 }));
        addLog("Effect E cleanup ran (interval cleared).");
      });
    };
  }, [count]); // Cleanup + re-run every time count changes

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Inter, Arial, sans-serif",
        background: "linear-gradient(180deg, #f6f8ff 0%, #eef2ff 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0 12px 30px rgba(44, 62, 80, 0.12)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#1e3a8a" }}>useEffect Dependency Demo</h2>

        <p style={{ color: "#334155" }}>
          This page shows exactly when each effect runs. Change <strong>count</strong> and{" "}
          <strong>text</strong> to see how dependency arrays control behavior.
        </p>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setCount((prev) => prev + 1)}
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Increase Count
          </button>
          <button
            onClick={() => setCount(0)}
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Reset Count
          </button>
          <button
            onClick={() => {
              setEventLogs([]);
            }}
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Clear Logs
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ background: "#eff6ff", padding: "0.75rem", borderRadius: "10px" }}>
            <strong>Count:</strong> {count}
          </div>
          <div style={{ background: "#ecfeff", padding: "0.75rem", borderRadius: "10px" }}>
            <strong>Interval Tick:</strong> {tick}
          </div>
          <div style={{ background: "#f0fdf4", padding: "0.75rem", borderRadius: "10px" }}>
            <strong>Effect E cleanups:</strong> {effectRuns.cleanupEffect}
          </div>
        </div>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something to trigger [text] effect"
          style={{
            padding: "0.6rem",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
          }}
        />

        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.75rem" }}>
            <strong>No deps</strong>
            <div>Runs: {effectRuns.everyRender}</div>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.75rem" }}>
            <strong>Empty deps []</strong>
            <div>Runs: {effectRuns.mountOnly}</div>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.75rem" }}>
            <strong>[count]</strong>
            <div>Runs: {effectRuns.countEffect}</div>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "0.75rem" }}>
            <strong>[text]</strong>
            <div>Runs: {effectRuns.textEffect}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            border: "1px solid #dbeafe",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div style={{ background: "#eff6ff", padding: "0.7rem 0.9rem", fontWeight: 600 }}>
            Effect Activity (on page)
          </div>
          <div style={{ maxHeight: "240px", overflowY: "auto", padding: "0.8rem", background: "#f8fafc" }}>
            {eventLogs.length === 0 ? (
              <p style={{ margin: 0, color: "#64748b" }}>No logs yet. Interact with the page.</p>
            ) : (
              eventLogs.map((log, index) => (
                <p key={`${log}-${index}`} style={{ margin: "0 0 0.45rem 0", fontSize: "0.92rem", color: "#334155" }}>
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
