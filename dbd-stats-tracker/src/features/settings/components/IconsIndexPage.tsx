import { useMemo } from "react";
import { KILLERS, SURVIVORS } from "../../../shared/data/characters";
import { SURVIVOR_ADDONS, SURVIVOR_ITEMS, KILLER_ADDONS } from "../../../shared/data/equipment";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { selectEffectiveIconsFolderPath, useSettingsStore } from "../stores/settings.store";
import { IconIndexTile } from "./IconIndexTile";
import "./icons-index.css";

interface IconIndexSection {
  id: string;
  title: string;
  category: IconCategory;
  items: string[];
  owner?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function IconsIndexPage() {
  const iconsFolderPath = useSettingsStore(selectEffectiveIconsFolderPath);

  const sections = useMemo<IconIndexSection[]>(() => {
    const result: IconIndexSection[] = [
      { id: "killers", title: "Portraits : Tueurs", category: "Characters", items: [...KILLERS] },
      {
        id: "survivors",
        title: "Portraits : Survivants",
        category: "Characters",
        items: [...SURVIVORS],
      },
      {
        id: "killer-perks",
        title: "Compétences : Tueurs",
        category: "Perks",
        items: KILLER_PERKS.map((p) => p.name),
      },
      {
        id: "survivor-perks",
        title: "Compétences : Survivants",
        category: "Perks",
        items: SURVIVOR_PERKS.map((p) => p.name),
      },
      { id: "items", title: "Objets", category: "Items", items: [...SURVIVOR_ITEMS] },
    ];

    for (const group of SURVIVOR_ADDONS) {
      result.push({
        id: `addons-${slugify(group.itemType)}`,
        title: `Addons : ${group.itemType}`,
        category: "Addons",
        items: [...group.addons],
      });
    }

    for (const killer of Object.keys(KILLER_ADDONS)) {
      result.push({
        id: `addons-${slugify(killer)}`,
        title: `Addons : ${killer}`,
        category: "Addons",
        items: [...KILLER_ADDONS[killer]],
        owner: killer,
      });
    }

    return result;
  }, []);

  return (
    <div className="icon-index-page">
      <h1>Index des icônes</h1>
      <p>
        Toutes les icônes du jeu affichées d'un coup : une icône qui retombe sur le placeholder
        vide (encadré en rouge) signale un chemin mal résolu pour ce nom.
      </p>

      {!iconsFolderPath && (
        <p className="icon-index-warning">
          Aucun dossier Icons configuré : va sur la page Accueil pour en choisir un, sinon toutes
          les icônes ci-dessous resteront vides.
        </p>
      )}

      <nav className="icon-index-nav">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.title}
          </a>
        ))}
      </nav>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="icon-index-section">
          <h2>{section.title}</h2>
          <div className="icon-index-grid">
            {section.items.map((name) => (
              <IconIndexTile
                key={name}
                category={section.category}
                name={name}
                manualOwner={section.owner ?? null}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
