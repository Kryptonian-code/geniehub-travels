import { useEffect, useState } from "react";
import { apiRequest, isApiConfigured } from "./api";
import { readStorage, STORAGE_KEYS, writeStorage } from "./storage";
import type { DestinationCategory, DestinationOptionRecord } from "./adminTypes";

function ensureDestinationBootstrap() {
  if (!window.localStorage.getItem(STORAGE_KEYS.destinationOptions)) {
    writeStorage(STORAGE_KEYS.destinationOptions, []);
  }
}

ensureDestinationBootstrap();

export function getLocalDestinationOptions() {
  return readStorage<DestinationOptionRecord[]>(STORAGE_KEYS.destinationOptions, []);
}

export async function getDestinationOptions() {
  if (isApiConfigured) {
    try {
      const response = await apiRequest<{ destinations: DestinationOptionRecord[] }>("destinations.list", {
        method: "GET",
      });
      return response.destinations;
    } catch {
      return getLocalDestinationOptions();
    }
  }

  return getLocalDestinationOptions();
}

export function filterDestinationOptions(
  options: DestinationOptionRecord[],
  categories?: DestinationCategory[],
) {
  const active = options.filter((item) => item.active);
  if (!categories?.length) {
    return active;
  }

  return active.filter((item) => categories.includes(item.category));
}

export function useDestinationOptions(categories?: DestinationCategory[]) {
  const [options, setOptions] = useState<DestinationOptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const categoryKey = categories?.join("|") ?? "";

  useEffect(() => {
    let active = true;

    void getDestinationOptions()
      .then((records) => {
        if (!active) return;
        setOptions(filterDestinationOptions(records, categories));
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [categories, categoryKey]);

  return { options, loading };
}
