import { SURVIVOR_ADDONS } from "../../data/equipment";
import type { CollectibleKind, QuestRarity } from "./types";

/**
 * Entity Quest rarity tier list: a meta-based judgment call (strength / impact on
 * a match), NOT the in-game Bloodweb rarity. It drives unlock odds and shop
 * prices. Tweak freely - any name not listed falls back to "common".
 */
type TierList = Partial<Record<Exclude<QuestRarity, "common">, readonly string[]>>;

const KILLER_TIERS: TierList = {
  legendary: ["The Nurse", "The Blight", "The Ghoul", "The Slasher", "The Judgment", "The Dracula", ],
  epic: [
    "The Lich",
    "The Twins",
    "The Oni",
    "The Spirit",
    "The Hillbilly",
    "The Unknown",
    "The Dredge",
    "The First",
    "The Krasue",
    "The Animatronic",
  ],
  rare: [
    "The Singularity",
    "The Artist",
    "The Deathslinger",
    "The Xenomorph",
    "The Mastermind",
    "The Executioner",
    "The Plague",
    "The Houndmaster",
    "The Huntress",
    "The Demogorgon",
  ],
  uncommon: [
    "The Knight",
    "The Nemesis",
    "The Onryō",
    "The Trickster",
    "The Cenobite",
    "The Good Guy",
    "The Clown",
    "The Cannibal",
    "The Clown",
    "The Ghostface",
  ],
};

const KILLER_PERK_TIERS: TierList = {
  legendary: [
    "Scourge Hook: Pain Resonance",
    "Grim Embrace",
    "Deadlock",
    "Dead Man's Switch",
    "Lethal Pursuer",
    "No Way Out",
    "Eruption",
  ],
  epic: [
    "Barbecue & Chilli",
    "Corrupt Intervention",
    "Sloppy Butcher",
    "Surge",
    "Hex: No One Escapes Death",
    "Hex: Devour Hope",
    "Hex: Ruin",
    "Hex: Plaything",
    "Hex: Undying",
    "Dissolution",
    "Nowhere to Hide",
    "Starstruck",
    "Merciless Storm",
    "Hysteria",
    "Machine Learning",
    "Pop Goes the Weasel",
    "Scourge Hook: Gift of Pain",
    "Scourge Hook: Floods of Rage",
    "Ultimate Weapon",
  ],
  rare: [
    "Agitation",
    "Bamboozle",
    "Call of Brine",
    "Coup de Grâce",
    "Darkness Revealed",
    "Discordance",
    "Dragon's Grip",
    "Enduring",
    "Spirit Fury",
    "Infectious Fright",
    "Make Your Choice",
    "Overcharge",
    "Thanatophobia",
    "Thrilling Tremors",
    "Unforeseen",
    "Weave Attunement",
    "Hex: Blood Favor",
    "Hex: The Third Seal",
    "Hex: Wretched Fate",
    "Hex: Hive Mind",
    "Friends Till the End",
    "Rapid Brutality",
    "Superior Anatomy",
    "Save the Best for Last",
    "Oppression",
    "Leverage",
    "Languid Touch",
    "Terminus",
    "Shattered Hope",
    "Forever Entwined",
    "Celestial Witness",
  ],
  uncommon: [
    "Bitter Murmur",
    "Brutal Strength",
    "Coulrophobia",
    "Cruel Limits",
    "Dark Devotion",
    "Dying Light",
    "Fire Up",
    "Forced Penance",
    "Franklin's Demise",
    "Gearhead",
    "Hex: Crowd Control",
    "Hex: Haunted Ground",
    "Hex: Huntress Lullaby",
    "Hex: Retribution",
    "Hex: Two Can Play",
    "Hex: Face the Darkness",
    "I'm All Ears",
    "Iron Maiden",
    "Knock Out",
    "Monitor and Abuse",
    "No Holds Barred",
    "Nemesis",
    "Play with Your Food",
    "Rancor",
    "Remember Me",
    "Scourge Hook: Hangman's Trick",
    "Scourge Hook: Jagged Compass",
    "Spies from the Shadows",
    "Stridor",
    "Surveillance",
    "Tinkerer",
    "Trail of Torment",
    "Whispers",
    "Zanshin Tactics",
    "Genetic Limits",
    "Septic Touch",
    "Ravenous",
    "Help Wanted",
    "Human Greed",
    "Wandering Eye",
    "Alien Instinct",
    "All-Shaking Thunder",
    "Batteries Included",
    "Awakened Awareness",
    "A Nurse's Calling",
    "Mindbreaker",
  ],
};

const SURVIVOR_PERK_TIERS: TierList = {
  legendary: [
    "Dead Hard",
    "Sprint Burst",
    "Windows of Opportunity",
    "Adrenaline",
    "Decisive Strike",
    "Off the Record",
    "Resurgence",
  ],
  epic: [
    "Lithe",
    "Balanced Landing",
    "Overcome",
    "Made for This",
    "Unbreakable",
    "Borrowed Time",
    "Bite the Bullet",
    "Deliverance",
    "Background Player",
    "Distortion",
    "Kindred",
    "Resilience",
    "Hyperfocus",
    "Boon: Circle of Healing",
    "Reassurance",
    "Finesse",
  ],
  rare: [
    "Inner Strength",
    "Botany Knowledge",
    "Boon: Shadow Step",
    "Boon: Exponential",
    "Built to Last",
    "Champion of Light",
    "Head On",
    "Quick Gambit",
    "Plot Twist",
    "Blood Rush",
    "Ace in the Hole",
    "Spine Chill",
    "Empathy",
    "Deception",
    "Iron Will",
    "Parental Guidance",
    "Lucky Break",
    "Conviction",
    "Prove Thyself",
    "Hope",
    "Stake Out",
    "Quick and Quiet",
    "Low Profile",
    "Dramaturgy",
    "Flashbang",
    "Blast Mine",
    "Wiretap",
    "Appraisal",
    "Clairvoyance",
    "Second Wind",
    "Mirrored Illusion",
    "Leader",
    "Breakout",
    "We'll Make It",
  ],
  uncommon: [
    "Alert",
    "Aftercare",
    "Bond",
    "Calm Spirit",
    "Dark Sense",
    "Deja Vu",
    "Detectives Hunch",
    "Empathic Connection",
    "Fast Track",
    "Flip-Flop",
    "Lightweight",
    "Lucky Star",
    "Mettle of Man",
    "No Mither",
    "No One Left Behind",
    "Object of Obsession",
    "Open-Handed",
    "Premonition",
    "Rookie Spirit",
    "Saboteur",
    "Self-Care",
    "Small Game",
    "Smash Hit",
    "Sole Survivor",
    "Technician",
    "Tenacity",
    "This Is Not Happening",
    "Urban Evasion",
    "Vigil",
    "Visionary",
    "We're Gonna Live Forever",
    "Teamwork: Power of Two",
    "Boon: Dark Theory",
    "Boon: Illumination",
    "Breakdown",
    "Buckle Up",
    "Camaraderie",
    "Counterforce",
    "Corrective Action",
    "Desperate Measures",
    "Diversion",
    "Fixated",
    "Friendly Competition",
    "Inner Focus",
    "Potential Energy",
    "Power Struggle",
    "Red Herring",
    "Repressed Alliance",
    "Residual Manifest",
    "Shoulder the Burden",
    "Soul Guard",
    "Still Sight",
    "Streetwise",
    "Troubleshooter",
    "Up the Ante",
    "Wake Up!",
    "Wicked",
  ],
};

const ITEM_RARITY: Record<string, QuestRarity> = {
  Toolbox: "common",
  "Med-kit": "common",
  Flashlight: "uncommon",
  Map: "uncommon",
  "Fog Vial": "uncommon",
  Key: "rare",
};

/** Survivor add-ons that dominate a match get a hand-picked bump; the rest are tiered by list position. */
const LEGENDARY_SURVIVOR_ADDONS = new Set(["Brand New Part", "Styptic Agent", "Anti-Exhaustion Syringe", "Odd Bulb"]);

/** equipment.ts lists each item's add-ons roughly from weakest to strongest; bucket them by position. */
function survivorAddonRarity(name: string): QuestRarity | null {
  if (LEGENDARY_SURVIVOR_ADDONS.has(name)) return "legendary";
  for (const group of SURVIVOR_ADDONS) {
    const index = group.addons.indexOf(name);
    if (index < 0) continue;
    const position = index / group.addons.length;
    if (position < 0.3) return "common";
    if (position < 0.6) return "uncommon";
    if (position < 0.85) return "rare";
    return "epic";
  }
  return null;
}

function buildIndex(...lists: TierList[]): Map<string, QuestRarity> {
  const index = new Map<string, QuestRarity>();
  for (const list of lists) {
    for (const [rarity, names] of Object.entries(list) as [QuestRarity, readonly string[]][]) {
      for (const name of names) index.set(name, rarity);
    }
  }
  return index;
}

const CHARACTER_INDEX = buildIndex(KILLER_TIERS);
const PERK_INDEX = buildIndex(KILLER_PERK_TIERS, SURVIVOR_PERK_TIERS);

export function getQuestRarity(kind: CollectibleKind, name: string): QuestRarity {
  switch (kind) {
    case "character":
      return CHARACTER_INDEX.get(name) ?? "common";
    case "perk":
      return PERK_INDEX.get(name) ?? "common";
    case "equipment":
      return ITEM_RARITY[name] ?? survivorAddonRarity(name) ?? "common";
  }
}
