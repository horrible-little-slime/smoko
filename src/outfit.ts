import { myFamiliar, toSlot } from "kolmafia";
import {
  $familiar,
  $item,
  $items,
  $slot,
  CrownOfThrones,
  findLeprechaunMultiplier,
  get,
  getSaleValue,
  have,
  Requirement,
} from "libram";
import { Modifiers } from "libram/dist/modifier";
import { dropsItems } from "./bonusequips";
import { meatFamiliar } from "./familiar";

CrownOfThrones.createRiderMode(
  "default",
  (modifiers: Modifiers) => (get("valueOfAdventure") * (modifiers["Familiar Weight"] ?? 0)) / 1000
);
CrownOfThrones.createRiderMode("embezzler", (modifiers: Modifiers) => {
  const weight = modifiers["Familiar Weight"] ?? 0;
  const meat = modifiers["Meat Drop"] ?? 0;
  const lepMult = findLeprechaunMultiplier(meatFamiliar());
  const lepBonus = weight * (2 * lepMult + Math.sqrt(lepMult));
  return (1025 * (lepBonus + meat)) / 100;
});

export function smokeMonsterOutfit(requirements: Requirement[] = []): void {
  const compiledRequirements = Requirement.merge(requirements);
  const runItem = $items`Greatest American Pants, navel ring of navel gazing`.find((item) =>
    have(item)
  );
  const baseSmokeMonsterRequirement = new Requirement(
    [`${(0.15 * getSaleValue($item`transdermal smoke patch`)) / 100} item max 567`],
    {
      forceEquip: [
        ...(myFamiliar() === $familiar`Reagnimated Gnome` ? $items`gnomish housemaid's kgnee` : []),
        ...(runItem ? [runItem] : []),
      ],
      bonusEquip: dropsItems(),
    }
  );
  const bjornChoice = CrownOfThrones.pickRider("default");
  const bjornalikeToUse = compiledRequirements.maximizeOptions.forceEquip?.some(
    (equipment) => toSlot(equipment) === $slot`back`
  )
    ? $item`Crown of Thrones`
    : $item`Buddy Bjorn`;
  const bjornalikeRequirement = new Requirement([], {
    bonusEquip: new Map<Item, number>([
      [bjornalikeToUse, bjornChoice ? bjornChoice.meatVal() * bjornChoice.probability : 0],
    ]),
    preventEquip: [
      bjornalikeToUse === $item`Buddy Bjorn` ? $item`Crown of Thrones` : $item`Buddy Bjorn`,
    ],
  });

  Requirement.merge([
    compiledRequirements,
    baseSmokeMonsterRequirement,
    bjornalikeRequirement,
  ]).maximize();
}

export function freeFightOutfit(): void {}

export function embezzlerOutfit(): void {}
