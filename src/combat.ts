import { haveEquipped, myAdventures, myClass, toInt } from "kolmafia";
import {
  $class,
  $effect,
  $item,
  $items,
  $monster,
  $skill,
  $skills,
  clamp,
  get,
  SourceTerminal,
  StrictMacro,
} from "libram";
import { copyMonster } from "./lib";

export default class Macro extends StrictMacro {
  ifMonster(monster: Monster, iftrue: Macro): Macro {
    return this.if_(`monsterid ${monster.id}`, iftrue);
  }
  static ifMonster(monster: Monster, iftrue: Macro): Macro {
    return new Macro().ifMonster(monster, iftrue);
  }

  trackMonster(monster: Monster): Macro {
    return this.ifMonster(
      monster,
      Macro.if_(
        `!haseffect ${toInt($effect`On the Trail`)}`,
        Macro.skill($skill`Transcendent Olfaction`)
      ).externalIf(
        get("_gallapagosMonster") === monster,
        Macro.skill($skill`Gallapagosian Mating Call`)
      )
    );
  }
  static trackMonster(monster: Monster): Macro {
    return new Macro().trackMonster(monster);
  }

  smokePocket(): Macro {
    return this.ifMonster(
      $monster`smoke monster`,
      Macro.step("pickpocket")
        .externalIf(
          $items`Greatest American Pants, navel ring of navel gazing`.some(haveEquipped),
          Macro.if_(
            `match ${$item`transdermal smoke patch`.name}`,
            Macro.trackMonster($monster`smoke monster`).runaway()
          )
        )
        .trackMonster($monster`smoke monster`)
        .kill()
    );
  }
  static smokePocket(): Macro {
    return new Macro().smokePocket();
  }

  kill(): Macro {
    return this.skill(...$skills`Curse of Weaksauce, Micrometeorite`).externalIf(
      myClass() === $class`Sauceror`,
      Macro.skill($skill`Saucegeyser`).repeat(),
      Macro.attack().repeat()
    );
  }
  static kill(): Macro {
    return new Macro().kill();
  }

  jungle(): Macro {
    return this.smokePocket()
      .externalIf(shouldRedigitize(), Macro.ifMonster(copyMonster(), Macro.skill($skill`Digitize`)))
      .externalIf(
        $items`Greatest American Pants, navel ring of navel gazing`.some(haveEquipped),
        Macro.runaway(),
        Macro.kill()
      );
  }
}

function shouldRedigitize() {
  const digitizesLeft = clamp(3 - get("_sourceTerminalDigitizeUses"), 0, 3);
  const monsterCount = get("_sourceTerminalDigitizeMonsterCount") + 1;
  // triangular number * 10 - 3
  const digitizeAdventuresUsed = monsterCount * (monsterCount + 1) * 5 - 3;
  // Redigitize if fewer adventures than this digitize usage.
  return SourceTerminal.have() && myAdventures() * 1.04 < digitizesLeft * digitizeAdventuresUsed;
}
