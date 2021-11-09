import { fullnessLimit, mallPrice, myAdventures, myFullness, toSlot } from "kolmafia";
import {
  $item,
  $items,
  $slot,
  get,
  getAverageAdventures,
  getFoldGroup,
  getModifier,
  getSaleValue,
  have,
} from "libram";
import { estimatedTurns, getPantsgivingFood, globalOptions } from "./lib";

const bestAdventuresFromPants =
  Item.all()
    .filter(
      (item) => toSlot(item) === $slot`pants` && have(item) && getModifier("Adventures", item) > 0
    )
    .map((pants) => getModifier("Adventures", pants))
    .sort((a, b) => b - a)[0] || 0;

const haveSomeCheese = getFoldGroup($item`stinky cheese diaper`).some((item) => have(item));
export function cheeses(): Map<Item, number> {
  return haveSomeCheese &&
    !globalOptions.ascending &&
    get("_stinkyCheeseCount") < 100 &&
    estimatedTurns() >= 100 - get("_stinkyCheeseCount")
    ? new Map<Item, number>(
        getFoldGroup($item`stinky cheese diaper`)
          .filter((item) => toSlot(item) !== $slot`weapon`)
          .map((item) => [
            item,
            get("valueOfAdventure") * (10 - bestAdventuresFromPants) * (1 / 100),
          ])
      )
    : new Map<Item, number>();
}
function snowSuit() {
  // Ignore for EMBEZZLER
  // Ignore for DMT, assuming mafia might get confused about the drop by the weird combats
  if (!have($item`Snow Suit`) || get("_carrotNoseDrops") >= 3) return new Map<Item, number>([]);

  return new Map<Item, number>([[$item`Snow Suit`, getSaleValue($item`carrot nose`) / 10]]);
}
function mayflowerBouquet() {
  // Drops flowers 50% of the time, wiki says 5-10 a day.
  // Theorized that flower drop rate drops off but no info on wiki.
  // During testing I got 4 drops then the 5th took like 40 more adventures
  // so let's just assume rate drops by 11% with a min of 1% ¯\_(ツ)_/¯

  const averageFlowerValue =
    getSaleValue(
      ...$items`tin magnolia, upsy daisy, lesser grodulated violet, half-orchid, begpwnia`
    ) * Math.max(0.01, 0.5 - get("_mayflowerDrops") * 0.11);
  return new Map<Item, number>([
    [$item`Mayflower bouquet`, get("_mayflowerDrops") < 10 ? averageFlowerValue : 0],
  ]);
}
export function dropsItems(isFree = false): Map<Item, number> {
  return new Map<Item, number>([
    [$item`mafia thumb ring`, !isFree ? 300 : 0],
    [$item`lucky gold ring`, 400],
    [$item`Mr. Cheeng's spectacles`, 250],
    [$item`pantogram pants`, get("_pantogramModifier").includes("Drops Items") ? 100 : 0],
    [$item`Mr. Screege's spectacles`, 180],
    [
      $item`bag of many confections`,
      getSaleValue(...$items`Polka Pop, BitterSweetTarts, Piddles`) / 6,
    ],
    ...snowSuit(),
    ...mayflowerBouquet(),
  ]);
}

export function pantsgiving(): Map<Item, number> {
  if (!have($item`Pantsgiving`)) return new Map<Item, number>();
  const count = get("_pantsgivingCount");
  const turnArray = [5, 50, 500, 5000];
  const index =
    myFullness() === fullnessLimit()
      ? get("_pantsgivingFullness")
      : turnArray.findIndex((x) => count < x);
  const turns = turnArray[index] || 50000;

  if (turns - count > myAdventures()) return new Map<Item, number>();
  const foodPick = getPantsgivingFood();
  const fullnessValue =
    get("valueOfAdventure") *
      (getAverageAdventures(foodPick.food) + 1 + (get("_fudgeSporkUsed") ? 3 : 0)) -
    (foodPick.costOverride ? foodPick.costOverride() : mallPrice(foodPick.food)) -
    mallPrice($item`Special Seasoning`) -
    (get("_fudgeSporkUsed") ? mallPrice($item`fudge spork`) : 0);
  const pantsgivingBonus = fullnessValue / (turns * 0.9);
  return new Map<Item, number>([[$item`Pantsgiving`, pantsgivingBonus]]);
}
