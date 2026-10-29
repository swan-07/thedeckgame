import { useState, type FormEvent } from "react";

// The site is static (GitHub Pages), so signups go to the event app's API.
const SUBSCRIBE_URL = "https://five-of-spades.vercel.app/api/subscribe";

type Status = "idle" | "sending" | "done" | "error";

/** Email box for hearing about future Deck Game events. */
export function NotifySignup({ source }: { source: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(SUBSCRIBE_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, website, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Try again?");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Try again?");
    }
  }

  if (status === "done") {
    return <p className="notify-done">You&rsquo;re on the list.</p>;
  }

  return (
    <form className="notify-form" onSubmit={submit}>
      <input
        type="email"
        required
        placeholder="your@email.com"
        aria-label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="notify-hp"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <button className="btn btn-notify" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Notify me"}
      </button>
      {status === "error" && <p className="notify-error">{error}</p>}
    </form>
  );
}
