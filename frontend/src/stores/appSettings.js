import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getSettings as getSettingsApi,
  patchSettings as patchSettingsApi,
} from '@/api';

export const useAppSettings = defineStore('appSettings', () => {
  const loaded = ref(false);
  const loading = ref(false);
  const lastError = ref(null);
  const state = ref({
    thumbnails: {
      enabled: true,
      size: 200,
      quality: 70,
      showVideoCoverArt: true,
    },
    access: { rules: [] },
  });

  const load = async () => {
    loading.value = true;
    lastError.value = null;
    try {
      const s = await getSettingsApi();
      state.value = {
        thumbnails: {
          enabled: s?.thumbnails?.enabled ?? true,
          size: s?.thumbnails?.size ?? 200,
          quality: s?.thumbnails?.quality ?? 70,
          showVideoCoverArt: s?.thumbnails?.showVideoCoverArt,
          concurrency: s?.thumbnails?.concurrency ?? 10,
        },
        access: {
          rules: Array.isArray(s?.access?.rules) ? s.access.rules : [],
        },
      };
      loaded.value = true;
    } catch (e) {
      lastError.value = e?.message || 'Failed to load settings';
    } finally {
      loading.value = false;
    }
  };

  const save = async (partial) => {
    lastError.value = null;
    const updated = await patchSettingsApi(partial);
    state.value = {
      thumbnails: {
        enabled: updated?.thumbnails?.enabled ?? true,
        size: updated?.thumbnails?.size ?? 200,
        quality: updated?.thumbnails?.quality ?? 70,
        showVideoCoverArt: updated?.thumbnails?.showVideoCoverArt,
        concurrency: updated?.thumbnails?.concurrency ?? 10,
      },
      access: {
        rules: Array.isArray(updated?.access?.rules)
          ? updated.access.rules
          : [],
      },
    };
    loaded.value = true;
    return state.value;
  };

  return { state, loaded, loading, lastError, load, save };
});
