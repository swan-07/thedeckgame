// Builds dist/og.png, the link-preview image, from the same data the home page
// uses: the title above a red back, every open card (or a "?" card when none
// is announced), and a blue back. Runs after `vite build`, so the preview
// follows deckData.ts on every deploy.
import { build } from "esbuild";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200;
const H = 630;

// deckData.ts and games.ts are TypeScript; bundle them into a module we can import.
const bundled = await build({
  stdin: {
    contents:
      'export { GAMES } from "./src/lib/deckData"; export { classifyGames } from "./src/lib/games";',
    resolveDir: root,
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
});
const { GAMES, classifyGames } = await import(
  "data:text/javascript;base64," + Buffer.from(bundled.outputFiles[0].text).toString("base64")
);
const { active } = classifyGames(GAMES);

const cardFiles = [
  "public/cards/Back-R.png",
  ...(active.length ? active.map((g) => `public/cards/${g.suit}-${g.rank}.png`) : ["scripts/og/mystery.png"]),
  "public/cards/Back-B.png",
];

// Cards are ~486x757. Shrink them when several open cards need to fit the row.
const gap = 56;
const maxRow = 1100;
const cardH = Math.min(300, Math.floor(((maxRow - gap * (cardFiles.length - 1)) / cardFiles.length) * (757 / 486)));
const cards = await Promise.all(
  cardFiles.map(async (f) => {
    const buf = await sharp(path.join(root, f)).resize({ height: cardH }).png().toBuffer();
    const { width } = await sharp(buf).metadata();
    return { buf, width };
  }),
);

const title = await sharp(path.join(root, "scripts/og/title.png")).png().toBuffer();
const titleMeta = await sharp(title).metadata();

const titleGap = 64;
const blockH = titleMeta.height + titleGap + cardH;
const top = Math.round((H - blockH) / 2);
const rowW = cards.reduce((s, c) => s + c.width, 0) + gap * (cards.length - 1);

let x = Math.round((W - rowW) / 2);
const layers = [{ input: title, left: Math.round((W - titleMeta.width) / 2), top }];
for (const c of cards) {
  layers.push({ input: c.buf, left: x, top: top + titleMeta.height + titleGap });
  x += c.width + gap;
}

await sharp({ create: { width: W, height: H, channels: 4, background: "#000000" } })
  .composite(layers)
  .png()
  .toFile(path.join(root, "dist/og.png"));

console.log(`og.png: ${active.length ? active.map((g) => `${g.suit}-${g.rank}`).join(", ") : "no open card (?)"}`);
