import {
  availableAmount,
  inebrietyLimit,
  isAccessible,
  itemAmount,
  mallPrice,
  myAdventures,
  myInebriety,
  myLevel,
  myTurncount,
  runChoice,
  visitUrl,
} from "kolmafia";
import {
  $coinmaster,
  $familiar,
  $item,
  $monster,
  get,
  getAverageAdventures,
  getSaleValue,
  have,
  PropertiesManager,
} from "libram";

export const globalOptions: {
  ascending: boolean;
  stopTurncount: number | null;
  saveTurns: number;
  cachedPantsgivingFood: PantsgivingFood | null;
} = {
  stopTurncount: null,
  ascending: false,
  saveTurns: 0,
  cachedPantsgivingFood: null,
};

export const propertyManager = new PropertiesManager();

export function estimatedTurns(): number {
  if (globalOptions.stopTurncount) return globalOptions.stopTurncount - myTurncount();
  // Assume roughly 2 fullness from pantsgiving and 8 adventures/fullness.
  const pantsgivingAdventures = have($item`Pantsgiving`)
    ? Math.max(0, 2 - get("_pantsgivingFullness")) * 8
    : 0;
  const potentialSausages =
    itemAmount($item`magical sausage`) + itemAmount($item`magical sausage casing`);
  const sausageAdventures = have($item`Kramco Sausage-o-Matic™`)
    ? Math.min(potentialSausages, 23 - get("_sausagesEaten"))
    : 0;
  const nightcapAdventures = globalOptions.ascending && myInebriety() <= inebrietyLimit() ? 60 : 0;
  const thumbRingMultiplier = have($item`mafia thumb ring`) ? 1 / 0.96 : 1;
  const gnomeMultiplier = have($familiar`Reagnimated Gnome`) ? 1.1 : 1;

  return (
    (myAdventures() + sausageAdventures + pantsgivingAdventures + nightcapAdventures) *
    thumbRingMultiplier *
    gnomeMultiplier
  );
}

type PantsgivingFood = {
  food: Item;
  costOverride?: () => number;
  canGet: () => boolean;
};

const pantsgivingFoods: PantsgivingFood[] = [
  {
    food: $item`glass of raw eggs`,
    costOverride: () => 0,
    canGet: () => have($item`glass of raw eggs`),
  },
  {
    food: $item`Affirmation Cookie`,
    canGet: () => true,
  },
  {
    food: $item`disco biscuit`,
    canGet: () => true,
  },
  {
    food: $item`ice rice`,
    canGet: () => true,
  },
  {
    food: $item`Tea, Earl Grey, Hot`,
    canGet: () => true,
  },
  {
    food: $item`Dreadsylvanian stew`,
    costOverride: () =>
      (10 / 20) *
      Math.max(getSaleValue($item`electric Kool-Aid`), getSaleValue($item`bottle of Bloodweiser`)),
    canGet: () =>
      have($item`Freddy Kruegerand`, 10) &&
      isAccessible($coinmaster`The Terrified Eagle Inn`) &&
      myLevel() >= 20,
  },
  {
    food: $item`FantasyRealm turkey leg`,
    costOverride: () => 0,
    canGet: () => {
      if (!have($item`Rubee™`, 100)) return false;
      if (!get("_frToday") && !get("frAlways")) return false;
      if (have($item`FantasyRealm G. E. M.`)) return true;
      visitUrl("place.php?whichplace=realm_fantasy&action=fr_initcenter");
      runChoice(1);
      return have($item`FantasyRealm G. E. M.`);
    },
  },
];

const valuePantsgivingFood = (foodChoice: PantsgivingFood) =>
  getAverageAdventures(foodChoice.food) * get("valueOfAdventure") -
  (foodChoice.costOverride ? foodChoice.costOverride() : mallPrice(foodChoice.food));
export function getPantsgivingFood(): PantsgivingFood {
  if (globalOptions.cachedPantsgivingFood) {
    if (
      !have(globalOptions.cachedPantsgivingFood.food) &&
      !globalOptions.cachedPantsgivingFood.canGet()
    ) {
      globalOptions.cachedPantsgivingFood = null;
    }
  }
  if (!globalOptions.cachedPantsgivingFood) {
    globalOptions.cachedPantsgivingFood = pantsgivingFoods
      .filter((x) => have(x.food) || x.canGet())
      .reduce((a, b) => (valuePantsgivingFood(b) < valuePantsgivingFood(a) ? a : b));
  }
  return globalOptions.cachedPantsgivingFood;
}

const witchessPieces = [
  { piece: $monster`Witchess Bishop`, drop: $item`Sacramento wine` },
  { piece: $monster`Witchess Knight`, drop: $item`jumping horseradish` },
  { piece: $monster`Witchess Pawn`, drop: $item`armored prawn` },
  { piece: $monster`Witchess Rook`, drop: $item`Greek fire` },
];

export function bestWitchessPiece(): Monster {
  return witchessPieces.sort((a, b) => getSaleValue(b.drop) - getSaleValue(a.drop))[0].piece;
}

let cachedCopyMonster: Monster;
export function copyMonster(): Monster {
  if (!cachedCopyMonster) {
    if (
      have($item`Kramco Sausage-o-Matic™`) &&
      availableAmount($item`magical sausage casing`) < 420
    ) {
      cachedCopyMonster = $monster`sausage goblin`;
    } else {
      cachedCopyMonster = bestWitchessPiece();
    }
  }
  return cachedCopyMonster;
}
