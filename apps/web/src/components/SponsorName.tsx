import { SPONSOR_URLS } from "../lib/deckData";

/** A sponsor's name, linked to their website when we have one. */
export function SponsorName({ name }: { name: string }) {
  const url = SPONSOR_URLS[name];
  if (!url) return <>{name}</>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {name}
    </a>
  );
}
