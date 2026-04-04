import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AvatarConfig, Language } from "@/types/game";
import type { Json } from "@/integrations/supabase/types";

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_config: AvatarConfig;
  language: Language;
  level: number;
  xp: number;
  hand_preference: string;
  theme: string;
  friend_code: string | null;
};

const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: 0, hairStyle: 0, hairColor: 0, outfit: 0, accessory: 0,
  makeup: 0, piercing: 0, nails: 0, eyeStyle: 0, shoes: 0,
};

function parseAvatarConfig(json: Json | null): AvatarConfig {
  if (json && typeof json === "object" && !Array.isArray(json)) {
    return { ...DEFAULT_AVATAR, ...(json as Record<string, number>) };
  }
  return DEFAULT_AVATAR;
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && !error) {
      setProfile({
        id: data.id,
        user_id: data.user_id,
        display_name: data.display_name,
        avatar_config: parseAvatarConfig(data.avatar_config),
        language: (data.language as Language) || "es",
        level: data.level,
        xp: data.xp,
        hand_preference: data.hand_preference,
        theme: data.theme,
        friend_code: data.friend_code,
      });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<{
    display_name: string;
    avatar_config: AvatarConfig;
    language: Language;
    level: number;
    xp: number;
    hand_preference: string;
    theme: string;
  }>) => {
    if (!userId) return { error: new Error("No user") };

    const dbUpdates: Record<string, unknown> = {};
    if (updates.display_name !== undefined) dbUpdates.display_name = updates.display_name;
    if (updates.avatar_config !== undefined) dbUpdates.avatar_config = updates.avatar_config as unknown as Json;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.hand_preference !== undefined) dbUpdates.hand_preference = updates.hand_preference;
    if (updates.theme !== undefined) dbUpdates.theme = updates.theme;

    const { error } = await supabase
      .from("profiles")
      .update(dbUpdates)
      .eq("user_id", userId);

    if (!error) {
      setProfile((prev) => prev ? { ...prev, ...updates } as Profile : null);
    }
    return { error };
  }, [userId]);

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
