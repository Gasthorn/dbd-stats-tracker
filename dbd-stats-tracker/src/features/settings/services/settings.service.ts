import { supabase } from "../../../shared/lib/supabase/client";
import type { SettingsService } from "./settings.service.types";

export const settingsService: SettingsService = {
  async getIconsFolderPath(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("icons_folder_path")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data.icons_folder_path;
  },

  async updateIconsFolderPath(userId, path) {
    const { error } = await supabase
      .from("users")
      .update({ icons_folder_path: path })
      .eq("id", userId);
    if (error) throw error;
  },
};
