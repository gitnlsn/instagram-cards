import "dotenv/config";
import { Command } from "commander";
import { generateCardContent } from "./gemini.js";
import { renderCards } from "./renderer.js";
import { STYLES } from "./styles.js";

const program = new Command();

program
  .name("instagram-cards")
  .description("Generate Instagram carousel cards for Voile Drift")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate a set of carousel cards")
  .requiredOption("--topic <topic>", "Topic or theme for the carousel")
  .option("--cards <count>", "Number of cards to generate", "5")
  .option("--style <style>", "Carousel style (educational, myths, tips, storytelling)", "educational")
  .option("--output <dir>", "Output directory", "./output")
  .action(async (opts) => {
    const cardCount = parseInt(opts.cards, 10);

    if (isNaN(cardCount) || cardCount < 2 || cardCount > 10) {
      console.error("Error: --cards must be a number between 2 and 10");
      process.exit(1);
    }

    const style = STYLES[opts.style];
    if (!style) {
      console.error(`Error: unknown style "${opts.style}". Available: ${Object.keys(STYLES).join(", ")}`);
      process.exit(1);
    }

    console.log(`\nGenerating ${cardCount} cards for: "${opts.topic}" (style: ${style.name})\n`);

    console.log("Calling Gemini for content...");
    const cards = await generateCardContent(opts.topic, cardCount, style);
    console.log("Content generated. Rendering cards...\n");

    for (const [i, card] of cards.entries()) {
      console.log(`  Card ${i + 1}: ${card.title}`);
    }

    console.log("");
    const paths = await renderCards(cards, opts.output);

    console.log("Done! Cards saved to:");
    for (const p of paths) {
      console.log(`  ${p}`);
    }
    console.log("");
  });

program.parse();
