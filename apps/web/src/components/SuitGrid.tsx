import { useLayoutEffect, useRef } from "react";

import { RANK_ORDER, SUITS, type Suit } from "../lib/types";
import type { Cell } from "../lib/games";
import { CardTile } from "./CardTile";
import "./deck.css";

const rankIndex = (r: number) => RANK_ORDER.indexOf(r);

// Animation timing.
const DEAL_MS = 1400; // flight time of the cards
const DECK_IN_MS = 650; // deck sliding into the corner before dealing starts

// Order the four suit columns are dealt in, by origin corner.
const SUIT_ORDER: Record<"left" | "right", Suit[]> = {
  right: ["H", "D", "C", "S"], // deck top-right → deal right-to-left
  left: ["S", "C", "D", "H"], // deck top-left → deal left-to-right
};

/**
 * Renders cells in the four suit columns and, whenever `dealToken` changes,
 * plays a dealing animation. The deck slides into a top corner with a
 * thickness equal to the number of cards; each card flies out to its slot and
 * the deck thins by one layer; the final card flips from back to face as it
 * travels to its place. `origin` picks the corner and within-row direction.
 */
export function SuitGrid({
  cells,
  dealToken,
  origin = "right",
}: {
  cells: Cell[];
  dealToken: number;
  origin?: "left" | "right";
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  const bySuit = new Map<Suit, Cell[]>();
  for (const s of SUITS) bySuit.set(s.code, []);
  for (const c of cells) bySuit.get(c.suit)?.push(c);
  for (const list of bySuit.values()) list.sort((a, b) => rankIndex(a.rank) - rankIndex(b.rank));

  // Deal order: for each row top→bottom, cards across in the origin direction.
  const dealOrder = new Map<string, number>();
  const maxLen = Math.max(0, ...[...bySuit.values()].map((l) => l.length));
  let order = 0;
  for (let r = 0; r < maxLen; r++) {
    for (const s of SUIT_ORDER[origin]) {
      const list = bySuit.get(s)!;
      if (r < list.length) dealOrder.set(`${list[r].suit}-${list[r].rank}`, order++);
    }
  }
  const total = order;

  useLayoutEffect(() => {
    if (!dealToken) return; // no deal on first mount, only when opened
    const wrap = wrapRef.current;
    const deck = deckRef.current;
    if (!wrap) return;
    const cards = Array.from(wrap.querySelectorAll<HTMLElement>("[data-deal]"));
    const faces = Array.from(wrap.querySelectorAll<HTMLElement>(".dc-face, .dc-back"));

    // Reset so re-opening re-deals and so we can measure natural positions.
    cards.forEach((el) => (el.style.animation = "none"));
    faces.forEach((el) => (el.style.animation = "none"));
    if (deck) deck.style.animation = "none";
    void wrap.offsetWidth; // reflow

    // Measure each card's offset back to the deck (its flight start point).
    const deckRect = deck?.getBoundingClientRect();
    cards.forEach((el) => {
      if (!deckRect) return;
      const rect = el.getBoundingClientRect();
      // Stack offset by deal order so the cards form a thick pile in the corner.
      const depth = Number(el.dataset.deal);
      el.style.setProperty("--sx", `${deckRect.left - rect.left + depth * 0.22}px`);
      el.style.setProperty("--sy", `${deckRect.top - rect.top + depth * 0.7}px`);
    });
    void wrap.offsetWidth; // reflow before applying animations

    // All cards fly to their slots together, once the deck is in place. Each
    // card shows its back first, then its faces swap at the flip's midpoint.
    cards.forEach((el) => {
      el.style.animation = `deal-in-flip ${DEAL_MS}ms linear both`;
      el.style.animationDelay = `${DECK_IN_MS}ms`;
      const face = el.querySelector<HTMLElement>(".dc-face");
      const back = el.querySelector<HTMLElement>(".dc-back");
      if (face) {
        face.style.animation = `flip-show ${DEAL_MS}ms linear both`;
        face.style.animationDelay = `${DECK_IN_MS}ms`;
      }
      if (back) {
        back.style.animation = `flip-hide ${DEAL_MS}ms linear both`;
        back.style.animationDelay = `${DECK_IN_MS}ms`;
      }
    });

  }, [dealToken, total, origin]);

  return (
    <div className="deal-wrap" ref={wrapRef}>
      {/* Invisible anchor marking the corner the cards stack at / deal from. */}
      <div
        className={"deal-deck" + (origin === "left" ? " deal-deck-left" : "")}
        ref={deckRef}
        aria-hidden
      />

      <section className="suits">
        {SUITS.map((s) => (
          <div key={s.code} className={"suit" + (s.red ? " red" : "")}>
            <div className="cards">
              {(bySuit.get(s.code) ?? []).map((c) => {
                const key = `${c.suit}-${c.rank}`;
                return (
                  <div key={key} className="deal-card deal-card-flip" data-deal={dealOrder.get(key)}>
                    <div className="dc-face">
                      <CardTile suit={c.suit} rank={c.rank} game={c.game} />
                    </div>
                    <div className="dc-back">
                      <img src="/cards/Back-B.png" alt="" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
