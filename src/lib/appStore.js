import { isSupabaseConfigured } from "./supabaseClient.js";
import { localStore } from "./localStore.js";
import { supabaseStore } from "./supabaseStore.js";

export const appStore = isSupabaseConfigured ? supabaseStore : localStore;
export const usingSupabase = isSupabaseConfigured;

