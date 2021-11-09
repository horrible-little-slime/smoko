import { $items, Requirement } from "libram";

export function smokeMonsterOutfit(requirements: Requirement[] = []): void {
  const compiledRequirements = Requirement.merge(requirements);
  const baseSmokeMonsterRequirement = new Requirement(["100 item max 567"], {
    forceEquip: $items`gnomish housemaid's kgnee`,
  });
  
}

export function freeFightOutfit(): void {}

export function embezzlerOutfit(): void {}
