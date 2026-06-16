export default function About() {
  return (
    <main className="narrow" style={{ lineHeight: 1.7, fontSize: "0.95rem" }}>
      <h2>What is this?</h2>
      <p className="muted">
        The Deck Game is a 52-event competition based in Yale. Each event is represented by a
        card in the standard deck, spanning math, game theory, physical contests, and more.
        Winning an event gets you both the prizes of the event, as well as an invitation in the
        form of the card you have won. Once all 52 events are complete, all 52 card holders are
        invited to a Squid Game–style finale.
      </p>

      <h2>Suits</h2>
      <p className="muted">
        Every card has both a suit and a rank. The suit determines the type of event.{" "}
        <strong>♣ Clubs</strong> are CS, AI, and strategy.{" "}
        <strong>♦ Diamonds</strong> are math and intellectual challenges.{" "}
        <strong>♥ Hearts</strong> are physical and social. <strong>♠ Spades</strong> are wild
        cards — everything else.
      </p>

      <h2>Ranks</h2>
      <p className="muted">
        The rank determines the scale of the challenge. Challenges scale in difficulty and stakes
        from 2 → 10 → J → Q → K → A.
      </p>

      <h2>Sponsors</h2>
      <p className="muted">
        If you're interested in sponsoring a card, email{" "}
        <a href="mailto:hosts@thedeckgame.com">hosts@thedeckgame.com</a>.
      </p>

      <h2>FAQ</h2>
      <dl>
        <dt style={{ fontWeight: 600, marginTop: "1.25rem" }}>How do I participate?</dt>
        <dd className="muted" style={{ margin: "0.35rem 0 0" }}>
          Sign in with Google and complete your profile. Published events appear on the deck —
          open one and submit an application. Some events are open to all, some are
          application-based, and some are invite only.
        </dd>
        <dt style={{ fontWeight: 600, marginTop: "1.25rem" }}>
          If I win and can't compete in the finale, can I give someone else my card?
        </dt>
        <dd className="muted" style={{ margin: "0.35rem 0 0" }}>
          Cards are completely transferable. Yes, it is completely allowed to give away, trade, or
          sell your card.
        </dd>
        <dt style={{ fontWeight: 600, marginTop: "1.25rem" }}>
          Can I compete in/win more than one game?
        </dt>
        <dd className="muted" style={{ margin: "0.35rem 0 0" }}>
          Yes, you can compete in and win as many games as you'd like. However, the Hosts reserve
          the right to make the games more challenging for you if you win often :)
        </dd>
      </dl>
    </main>
  );
}
