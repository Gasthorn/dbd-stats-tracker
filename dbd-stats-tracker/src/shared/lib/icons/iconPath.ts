/**
 * Faithful TypeScript port of legacy-web-prototype/js/app.js's getIconPath().
 * Computes the file path of a game icon *relative to the user-selected Icons
 * folder root* (i.e. the equivalent of legacy-web-prototype/Icons/).
 *
 * The legacy prototype returned paths prefixed with "Icons/" because it served
 * that folder from its own web root; here the user points directly at the
 * Icons folder, so that prefix is dropped everywhere it appeared in the
 * original implementation.
 */
import { KILLERS, SURVIVORS } from "../../data/characters";
import { KILLER_ADDONS } from "../../data/equipment";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../data/perks";

export type IconCategory = "Characters" | "Perks" | "Addons" | "Items";

const ALL_PERKS = [...KILLER_PERKS, ...SURVIVOR_PERKS];

/** Character name -> DLC/chapter icon folder. Characters absent from this map live at the CharPortraits/Perks/ItemAddons root. */
const CHARACTER_FOLDER_MAP: Record<string, string> = {
  "The Unknown": "Applepie",
  "Sable Ward": "Applepie",
  "Ashley J. Williams": "Ash",
  "The Twins": "Aurora",
  "Élodie Rakoto": "Aurora",
  "The Cannibal": "Cannibal",
  "The Lich": "Churros",
  "The Troupe": "Churros",
  "The Trickster": "Comet",
  "Yun-Jin Lee": "Comet",
  "The Shape": "DLC2",
  "Laurie Strode": "DLC2",
  "The Hag": "DLC3",
  "Ace Visconti": "DLC3",
  "The Doctor": "DLC4",
  "Feng Min": "DLC4",
  "The Huntress": "DLC5",
  "David King": "DLC5",
  "Lara Croft": "Donut",
  "The Dracula": "Eclair",
  "Trevor Belmont": "Eclair",
  "The Nemesis": "Eclipse",
  "Jill Valentine": "Eclipse",
  "Leon S. Kennedy": "Eclipse",
  "The Nightmare": "England",
  "Quentin Smith": "England",
  "The Pig": "Finland",
  "Detective David Tapp": "Finland",
  "The Houndmaster": "Gelato",
  "Taurie Cain": "Gelato",
  "The Cenobite": "Gemini",
  "The Clown": "Guam",
  "Kate Denson": "Guam",
  "The Spirit": "Haiti",
  "Adam Francis": "Haiti",
  "Mikaela Reid": "Hubble",
  "The Ghoul": "Icecream",
  "The Artist": "Ion",
  "Jonah Vasquez": "Ion",
  "Orela Rose": "Jerky",
  "The Legion": "Kenya",
  "Jeff Johansen": "Kenya",
  "The Onryō": "Kepler",
  "Yoichi Asakawa": "Kepler",
  "The Animatronic": "Ketchup",
  "William Bill Overbeck": "L4D",
  "Rick Grimes": "Lasagna",
  "Michonne Grimes": "Lasagna",
  "The Plague": "Mali",
  "Jane Romero": "Mali",
  "The Krasue": "Maple",
  "Vee Boonyasak": "Maple",
  "The Dredge": "Meteor",
  "Haddie Kaur": "Meteor",
  "The Ghost Face": "Oman",
  "The Mastermind": "Orion",
  "Ada Wong": "Orion",
  "Rebecca Chambers": "Orion",
  "The First": "Poutine",
  "Dustin Henderson": "Poutine",
  Eleven: "Poutine",
  "The Demogorgon": "Qatar",
  "Steve Harrington": "Qatar",
  "Nancy Wheeler": "Qatar",
  "The Knight": "Quantum",
  "Vittorio Toscano": "Quantum",
  "Kwon Tae-Young": "Quiche",
  "Kwon Tae-young": "Quiche",
  "Kwon Tae Young": "Quiche",
  "The Skull Merchant": "Saturn",
  "Thalita Lyra": "Saturn",
  "Renato Lyra": "Saturn",
  "The Slasher": "Sushi",
  "The Oni": "Sweden",
  "Yui Kimura": "Sweden",
  "The Deathslinger": "Ukraine",
  "Zarina Kassir": "Ukraine",
  "The Singularity": "Umbra",
  "Gabriel Soma": "Umbra",
  "Nicolas Cage": "Venus",
  "The Executioner": "Wales",
  "Cheryl Mason": "Wales",
  "The Xenomorph": "Wormhole",
  "Ellen Ripley": "Wormhole",
  "The Blight": "Yemen",
  "Felix Richter": "Yemen",
  "The Good Guy": "Yerkes",
  "Alan Wake": "Zodiac",
};

function normalizeForCharacters(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

function normalizeForPerks(str: string): string {
  let normalized = str.normalize("NFD").replace(/[̀-ͯ]/g, "");
  normalized = normalized.replace(/[^a-zA-Z0-9\s]/g, "");
  return normalized
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

const UI_PREFIX_ALL_FOLDERS = ["Maple", "Poutine", "Quiche", "Sushi"];
const UI_PREFIX_PERKS_AND_ADDONS_FOLDERS = ["Gelato", "Icecream", "Ketchup"];
const UI_PREFIX_PERKS_ONLY_FOLDERS = ["Jerky", "Lasagna"];

function getFolderInfo(
  ownerName: string | null | undefined,
  currentCategory: IconCategory,
): { path: string; prefix: string } {
  if (!ownerName || ownerName === "Base Kit") return { path: "", prefix: "" };
  let folder: string | null | undefined = CHARACTER_FOLDER_MAP[ownerName];

  // Kate Denson's perks live in "Kate" but her portrait lives in "Guam".
  if (currentCategory === "Perks" && ownerName === "Kate Denson") {
    folder = "Kate";
  }
  // The Cannibal's addons are mostly at the ItemAddons root, with a few explicit exceptions.
  if (currentCategory === "Addons" && ownerName === "The Cannibal") {
    folder = null;
  }

  if (!folder) return { path: "", prefix: "" };

  const path = `${folder}/`;
  let prefix = "";

  if (UI_PREFIX_ALL_FOLDERS.includes(folder)) {
    prefix = "T_UI_";
  } else if (
    UI_PREFIX_PERKS_AND_ADDONS_FOLDERS.includes(folder) &&
    (currentCategory === "Perks" || currentCategory === "Addons")
  ) {
    prefix = "T_UI_";
  } else if (UI_PREFIX_PERKS_ONLY_FOLDERS.includes(folder) && currentCategory === "Perks") {
    prefix = "T_UI_";
  } else if (folder === "Ion" && currentCategory === "Perks") {
    prefix = "T_";
  }

  return { path, prefix };
}

const PERK_DERIVATIVE_MAPPING: Record<string, string> = {
  "Bound By Obsession": "Object of Obsession",
  "Bound by Obsession": "Object of Obsession",
  "Down To The Last": "Sole Survivor",
  "Will to Live": "Decisive Strike",
  "Hex: Fortune's Fool": "Hex: Plaything",
  "Keep Them Waiting": "Save the Best for Last",
  "No Holds Barred": "Deadlock",
  "Scourge Hook: Weeping Wounds": "Scourge Hook: Gift of Pain",
  "See How They Run": "Play With Your Food",
  "Cull the Weak": "Dying Light",
  "Cull of the Weak": "Dying Light",
};

const PERK_NAME_MAPPING: Record<string, string> = {
  "Boon: Dark Theory": "Dark Theory",
  "Boon: Illumination": "Illumination",
  "Quick Gambit": "Vittorios Gambit",
  "Awakened Awareness": "Awakened Awarenesss",
  "Barbecue & Chilli": "BBQAndChili",
  "Cruel Limits": "CruelConfinement",
  "Darkness Revealed": "DarknessRevelated",
  "Dead Man's Switch": "DeadManSwitch",
  "Franklin's Demise": "FranklinsLoss",
  "Hex: Devour Hope": "DevourHope",
  "Hex: Ruin": "Ruin",
  "Hex: Thrill of the Hunt": "ThrillOfTheHunt",
  "Hex: Haunted Ground": "HauntedGround",
  "Hex: Huntress Lullaby": "HuntressLullaby",
  "Hex: No One Escapes Death": "NoOneEscapesDeath",
  "Hex: Nothing but Misery": "NothingButMisery",
  "Hex: Scared to Death": "ScaredToDeath",
  "Hex: The Third Seal": "TheThirdSeal",
  "Hex: Two Can Play": "twoCanPlay",
  "Machine Learning": "SelfAware",
  Overcharge: "GeneratorOvercharge",
  Rancor: "Hatred",
  "Scourge Hook: Floods of Rage": "FloodOfRage",
  "Scourge Hook: Hangman's Trick": "HangmansTrick",
  "Scourge Hook: Monstrous Shrine": "MonstrousShrine",
  "Scourge Hook: Pain Resonance": "PainResonance",
  Thanatophobia: "Thatanophobia",
  "Shattered Hope": "BoonDestroyer",
};

const PERK_SPECIAL_PREFIX_OWNERS = [
  "Sable Ward",
  "Taurie Cain",
  "Orela Rose",
  "Dustin Henderson",
  "Eleven",
  "The First",
  "Kwon Tae-young",
  "Kwon Tae-Young",
  "Kwon Tae Young",
  "Alan Wake",
  "The Slasher",
];

const SURVIVOR_ADDON_FILE_MAPPING: Record<string, string> = {
  "Low Amp Filament": "threadedFilament",
  "Unique Wedding Ring": "uniqueRing",
  "Rubber Gloves": "gloves",
  "Medical Scissors": "scissors",
  "Needle and Thread": "needAndThread",
  "Gauze Roll": "gauseRoll",
  "Anti-Exhaustion Syringe": "syringe",
  "Wire Spool": "spoolOfWire",
  Hacksaw: "metalSaw",
  // Exceptions: TWD (Lasagna) chapter
  "Friendship Charm": "Lasagna/T_UI_iconIAddon_FriendshipCharm",
  "Shrill Whistle": "Lasagna/T_UI_iconAddon_ShrillWhistle",
  "Braided Bauble": "Lasagna/T_UI_iconAddon_BraidedBauble",
  "Glowing Ink": "Lasagna/T_UI_iconAddon_GlowingInk",
  "Gnarled Compass": "Lasagna/T_UI_iconAddon_GnarledCompass",
  "Battered Tape": "Lasagna/T_UI_iconAddon_BatteredTape",
  "Sharpened Flint": "Lasagna/T_UI_iconAddon_SharpenedFlint",
  "Crimson Stamp": "Lasagna/T_UI_iconAddon_CrimsonStamp",
  "Volcanic Stone": "Lasagna/T_UI_iconAddon_volcanicStone",
  "Reactive Compound": "Lasagna/T_UI_iconAddon_reactiveCompound",
  "Oily Sap": "Lasagna/T_UI_iconAddon_oilySap",
  "Mushroom Formula": "Lasagna/T_UI_iconAddon_mushroomFormula",
  "Potent Extract": "Lasagna/T_UI_iconAddon_potentExtract",
};

// Killer addon name -> icon file name (or "Folder/fileName" for a few chapters
// that break the owner's usual folder convention). Kept in the exact source
// order of legacy-web-prototype/js/app.js: a few addon names collide across
// killers (e.g. "Begrimed Chains"), and JS object literals keep the *last*
// declared value for a duplicate key, so order here must match the original.
const KILLER_ADDON_FILE_MAPPING: Record<string, string> = {
  // The Trapper
  "4-Coil Spring Kit": "coilsKit4",
  "Coffee Grounds": "coffeeGrinds",
  "Iridescent Stone": "diamondStone",
  // The Wraith
  "The Beast - Soot": "sootTheBeast",
  "The Ghost - Soot": "sootTheGhost",
  "The Hound - Soot": "sootTheHound",
  "The Serpent - Soot": "sootTheSerpent",
  "Blind Warrior - Mud": "mudBaikraKaeug",
  "Blink - Mud": "mudBlink",
  "Swift Hunt - Mud": "mudSwiftHunt",
  "Windstorm - Mud": "mudWindstorm",
  "Blind Warrior - White": "whiteBlindWarrior",
  "Blink - White": "whiteBlink",
  "Shadow Dance - White": "whiteShadowDance",
  "Swift Hunt - White": "whiteKuntinTakkho",
  "Windstorm - White": "whiteWindstorm",
  "All Seeing - Blood": "bloodKraFabai",
  "Shadow Dance - Blood": "bloodShadowDance",
  "Swift Hunt - Blood": "bloodSwiftHunt",
  "Windstorm - Blood": "bloodWindstorm",
  "All Seeing - Spirit": "spiritAllSeeing",
  // The Hillbilly
  Counterweight: "Zodiac/iconAddon_counterweight",
  "Cracked Primer Bulb": "Zodiac/iconAddon_crackedPrimerBulb",
  "Discarded Air Filter": "Zodiac/iconAddon_discardedAirFilter",
  "Steel Toe Boots": "Xipre/iconAddon_steelToeBoots",
  "Clogged Intake": "Zodiac/iconAddon_cloggedIntake",
  "Greased Throttle": "Zodiac/iconAddon_greasedThrottle",
  "High-Speed Idler Screw": "Zodiac/iconAddon_highSpeedIdlerScrew",
  "Off-Brand Motor Oil": "Xipre/iconAddon_offBrandMotorOil",
  "Thermal Casing": "Zodiac/iconAddon_thermalCasing",
  "Begrimed Chains": "iconAddon_chainsBloody",
  "Dad's Boots": "Xipre/iconAddon_dadsBoots",
  "Low Kickback Chains": "Xipre/iconAddon_lowKickbackChains",
  "Ragged Engine": "Zodiac/iconAddon_raggedEngine",
  "Apex Muffler": "Xipre/iconAddon_apexMuffler",
  "Filthy Slippers": "Zodiac/iconAddon_filthySlippers",
  "LoPro Chains": "Xipre/iconAddon_lowProChains",
  "Iridescent Engravings": "Zodiac/iconAddon_iridescentEngravings",
  "Tuned Carburettor": "Xipre/iconAddon_tunedCarburetor",
  // The Nurse
  "Catatonic Boy's Treasure": "catatonicTreasure",
  // The Shape
  "Blond Hair": "blondeHair",
  "Fragrant Tuft of Hair": "tuftOfHair",
  Jewellery: "jewelry",
  "Jewellery Box": "jewelryBox",
  // The Hag
  "Grandma's Heart": "granmasHeart",
  // The Doctor
  "Mouldy Electrode": "moldyElectrode",
  "Discipline - Class II": "diciplineClassII",
  "Discipline - Class III": "diciplineClassIII",
  "Discipline - Carter's Notes": "diciplineCartersNotes",
  // The Cannibal
  "Award-winning Chilli": "Cannibal/iconAddon_awardWinningChili",
  Chilli: "Cannibal/iconAddon_Chili",
  "Iridescent Flesh": "Cannibal/iconAddon_IridescentFlesh",
  "Knife Scratches": "Cannibal/iconAddon_KnifeScratches",
  "The Beast's Marks": "Cannibal/iconAddon_theBeastsMark",
  "The Grease": "Cannibal/iconAddon_TheGrease",
  "Grisly Chains": "chainsGrisly",
  "Rusted Chains": "chainsRusted",
  "Carburettor Tuning Guide": "carburetorTuningGuide",
  "Begrimed Chains ": "chainsBloody",
  // The Pig
  "Razor Wires": "razerWire",
  "Rules Set No.2": "rulesSetN2",
  // The Clown
  "Sulphuric Acid Vial": "sulfuricAcidVial",
  "Ether 15 Vol%": "ether15",
  "RedHead's Pinkie Finger": "redheadsPinkyFinger",
  // The Spirit
  "Muddy Sports Day Cap": "muddySportCap",
  "Mother's Glasses": "Hubble/iconAddon_mothersGlasses",
  "Senko Hanabi": "Hubble/iconAddon_senkoHanabi",
  Uchiwa: "Hubble/iconAddon_uchiwa",
  Furin: "Hubble/iconAddon_furin",
  "Kintsugi Teacup": "Hubble/iconAddon_kintsugiTeacup",
  // The Legion
  "Smiley Face Pin": "smileyFaceButton",
  "Defaced Smiley Pin": "defacedSmileyButton",
  "Stylish Sunglasses": "nastyBlade",
  "Susie's Mix Tape": "suziesMixtape",
  "The Legion Pin": "theLegionButton",
  BFFs: "coldDirt",
  // The Plague
  "Blessed Apple": "prayerApple",
  "Haematite Seal": "hematiteSeal",
  // The Ghost Face
  "Cinch Straps": "reusuableCinchStraps",
  "Night Vision Monocular": "nightvisionMoncular",
  "Ghost Face Caught on Tape": "caughtOnTape",
  // The Oni
  "Renjiro's Bloody Glove": "renirosBloodyGlove",
  // The Deathslinger
  "Gold Creek Whiskey": "clearCreekWhiskey",
  // The Executioner
  "Misty Day, Remains of Judgement": "mistyDay",
  "Iridescent Seal of Metatron": "iridescentSeal",
  // The Trickster
  "Inferno Wires": "Comet/icons_Addon_InfernoWires",
  "Killing Part Chords": "Comet/icons_Addon_KillingPartChords",
  "Memento Blades": "Comet/icons_Addon_MementoBlades",
  "Trick Pouch": "Comet/icons_Addon_TrickPouch",
  "Bloody Boa": "Comet/icons_Addon_BloodyBoa",
  "Caged Heart Shoes": "Comet/icons_Addon_CagedHeartShoes",
  "Ji-Woon's Autograph": "Comet/icons_Addon_JiWoonsAutograph",
  "Lucky Blade": "Comet/icons_Addon_LuckyBlade",
  "Tequila Moonrock": "Comet/icons_Addon_TequilaMoonrock",
  "Fizz-Spin Soda": "Comet/icons_Addon_FizzSpinSoda",
  "Melodious Murder": "Comet/icons_Addon_YumisMurder",
  "On Target Single": "Comet/icons_Addon_OnTargetSingle",
  "Ripper Brace": "Comet/icons_Addon_RipperBrace",
  "Waiting For You Watch": "Comet/icons_Addon_WaitingForYouWatch",
  "Cut Thru U Single": "Comet/icons_Addon_CutThruUSingle",
  "Diamond Cufflinks": "Comet/icons_Addon_DiamondCufflinks",
  "Edge of Revival Album": "Comet/icons_Addon_EdgeOfRevivalAlbum",
  "Trick Blades": "Comet/icons_Addon_TrickBlades",
  "Death Throes Compilation": "Comet/icons_Addon_DeathThroesCompilation",
  "Iridescent Photocard": "Comet/icons_Addon_IridescentPhotocard",
  // The Nemesis
  "Jill's Sandwich": "jillSandwich",
  // The Artist
  "Matias' Baby Shoes": "JacobsBabyShoes",
  // The Onryō
  "Videotape Copy": "VhsCopy",
  "Distorted Photo": "DisortedPhoto",
  "Iridescent Videotape": "IridescentVHStape",
  // The Dredge
  "Air Freshener": "AirFreshner",
  // The Mastermind
  "Maiden Medallion": "maidenMedalliom",
  "Uroboros Virus": "lasPlagasVariant",
  // The Knight
  "Town Watch's Torch": "TownWatctTorch",
  "Sharpened Mount": "Donut/iconAddon_SharpenedMount",
  "Jailer's Chimes": "Donut/iconAddon_JailersChimes",
  // The Skull Merchant
  "Adi Valente Issue 1": "AdiValente1",
  "Ultrasonic Speaker": "UltrasonicTrapSpeaker",
  Supercharge: "overcharge",
  "Infrared Upgrade": "infaredUpgrade",
  "Randomised Strobes": "RandomizedStrobes",
  // The Singularity
  "Foreign Plant Fibres": "foreignPlantFibers",
  "Iridescent Crystal Shard": "iridiscentCrystalShard",
  // The Good Guy
  "Hair Spray and Candle": "flamingHairSpray",
  // The Unknown
  "B-Movie Poster": "B-MoviePoster",
  // The Lich
  "Vorpal Sword": "SwordOfKass",
  // The Dracula
  "Traveller's Hat": "TravelersHat",
  // The Ghoul
  "Kaneki's Satchel": "satchel",
  "Torture Apparatus": "medicalApparatus",
  // The Animatronic
  "Foxy's Hook": "foxyHook",
  // The Krasue
  "Spattered Handkerchief": "SpottedHandkerchief",
  "Mysterious Elixir": "IridescentElixir",
  // The First
  "Mid-Century Radio": "Mid-CenturyRadio",
};

// NB: legacy source declares "Begrimed Chains" twice (Hillbilly, then
// Cannibal); the second literal wins in JS. The mapping above renames the
// second key to avoid TypeScript's duplicate-object-key rule while
// preserving that exact original outcome.
KILLER_ADDON_FILE_MAPPING["Begrimed Chains"] = KILLER_ADDON_FILE_MAPPING["Begrimed Chains "];
delete KILLER_ADDON_FILE_MAPPING["Begrimed Chains "];

function emptyIconPath(category: IconCategory): string {
  if (category === "Characters") return "CharPortraits/empty.png";
  if (category === "Addons") return "ItemAddons/empty.png";
  return `${category}/empty.png`;
}

/**
 * Mirrors legacy-web-prototype's getIconPath(), returning a path relative to
 * the Icons folder root (no leading "Icons/").
 */
export function getIconRelativePath(
  category: IconCategory,
  name: string | null | undefined,
  manualOwner: string | null = null,
): string {
  if (!name || name === "None") {
    return emptyIconPath(category);
  }

  if (category === "Characters") {
    const fileNamePart = name === "The Good Guy" ? "The Yerkes" : name;
    const { path, prefix } = getFolderInfo(name, category);
    const baseCharPath = `CharPortraits/${path}`;

    const killerIndex = KILLERS.indexOf(name);
    if (killerIndex !== -1) {
      const charId = String(killerIndex + 1).padStart(2, "0");
      return `${baseCharPath}${prefix}K${charId}_${normalizeForCharacters(fileNamePart)}_Portrait.png`;
    }

    const survivorIndex = SURVIVORS.indexOf(name);
    if (survivorIndex !== -1) {
      const charTypePrefix = survivorIndex === 18 ? "T_UI_S" : "S";
      const charId = String(survivorIndex + 1).padStart(2, "0");
      return `${baseCharPath}${prefix}${charTypePrefix}${charId}_${normalizeForCharacters(fileNamePart)}_Portrait.png`;
    }

    return "CharPortraits/empty.png";
  }

  if (category === "Perks") {
    const searchName = PERK_DERIVATIVE_MAPPING[name.trim()] || name.trim();
    const perk = ALL_PERKS.find((p) => p.name.toLowerCase() === searchName.toLowerCase());
    let officialName = perk ? perk.name : searchName;

    if (PERK_NAME_MAPPING[officialName]) {
      officialName = PERK_NAME_MAPPING[officialName];
    }

    let owner = perk ? perk.owner : null;
    if (searchName === "Shattered Hope") owner = "The Dredge";
    if (searchName === "Hex: Thrill of the Hunt") owner = "The Hag";

    const { path, prefix } = getFolderInfo(owner, category);
    const perkFilePrefix =
      owner && PERK_SPECIAL_PREFIX_OWNERS.includes(owner) ? "iconsPerks_" : "iconPerks_";

    let perkFileName = normalizeForPerks(officialName);
    if (officialName === "Self-Preservation" || officialName === "twoCanPlay") {
      perkFileName = officialName;
    }

    return `Perks/${path}${prefix}${perkFilePrefix}${perkFileName}.png`;
  }

  if (category === "Addons") {
    if (SURVIVOR_ADDON_FILE_MAPPING[name]) {
      const mapped = SURVIVOR_ADDON_FILE_MAPPING[name];
      return `ItemAddons/${mapped.includes("/") ? mapped : `iconAddon_${mapped}`}.png`;
    }

    let ownerKiller: string | null =
      manualOwner && KILLER_ADDONS[manualOwner] ? manualOwner : null;

    if (!ownerKiller) {
      for (const killer of Object.keys(KILLER_ADDONS)) {
        if (KILLER_ADDONS[killer].includes(name)) {
          ownerKiller = killer;
          break;
        }
      }
    }

    if (ownerKiller) {
      const { path, prefix } = getFolderInfo(ownerKiller, category);
      const fileName = KILLER_ADDON_FILE_MAPPING[name] || normalizeForPerks(name);
      if (fileName.includes("/")) return `ItemAddons/${fileName}.png`;
      if (fileName.startsWith("iconAddon_")) return `ItemAddons/${path}${prefix}${fileName}.png`;
      return `ItemAddons/${path}${prefix}iconAddon_${fileName}.png`;
    }

    return `ItemAddons/iconAddon_${normalizeForPerks(name)}.png`;
  }

  // Items
  if (name === "Fog Vial") {
    return "Items/T_UI_iconItems_apprenticesFogVial.png";
  }
  return `Items/iconItems_${normalizeForPerks(name)}.png`;
}
