import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const iconsFolderPath = useSettingsStore(selectEffectiveIconsFolderPath);

  const sections = useMemo<IconIndexSection[]>(() => {
    const result: IconIndexSection[] = [
      { id: "killers", title: t("iconsIndex.killerPortraits"), category: "Characters", items: [...KILLERS] },
      {
        id: "survivors",
        title: t("iconsIndex.survivorPortraits"),
        category: "Characters",
        items: [...SURVIVORS],
      },
      {
        id: "killer-perks",
        title: t("iconsIndex.killerPerks"),
        category: "Perks",
        items: KILLER_PERKS.map((p) => p.name),
      },
      {
        id: "survivor-perks",
        title: t("iconsIndex.survivorPerks"),
        category: "Perks",
        items: SURVIVOR_PERKS.map((p) => p.name),
      },
      { id: "items", title: t("iconsIndex.items"), category: "Items", items: [...SURVIVOR_ITEMS] },
    ];

    for (const group of SURVIVOR_ADDONS) {
      result.push({
        id: `addons-${slugify(group.itemType)}`,
        title: t("iconsIndex.addonsFor", { name: group.itemType }),
        category: "Addons",
        items: [...group.addons],
      });
    }

    for (const killer of Object.keys(KILLER_ADDONS)) {
      result.push({
        id: `addons-${slugify(killer)}`,
        title: t("iconsIndex.addonsFor", { name: killer }),
        category: "Addons",
        items: [...KILLER_ADDONS[killer]],
        owner: killer,
      });
    }

    return result;
  }, [t]);

  return (
    <div className="icon-index-page">
      <h1>{t("iconsIndex.title")}</h1>
      <p>{t("iconsIndex.explanation")}</p>

      {!iconsFolderPath && <p className="icon-index-warning">{t("iconsIndex.noFolderWarning")}</p>}

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
