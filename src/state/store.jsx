const KEY = "rescuegrid_store_v1";

const seed = {
  shelters: [
    {
      id: "S1",
      name: "Government High School Shelter",
      lat: 13.0827,
      lng: 80.2707,
      type: "School",
      risk: "LOW",
      capacityTotal: 900,
      capacityUsed: 540,
      resources: { water: true, food: true, medical: true },
    },
    {
      id: "S2",
      name: "Community Hall - Zone 4",
      lat: 13.0727,
      lng: 80.2507,
      type: "Hall",
      risk: "HIGH",
      capacityTotal: 600,
      capacityUsed: 590,
      resources: { water: true, food: false, medical: false },
    },
    {
      id: "S3",
      name: "Metro Shelter Hub",
      lat: 13.0927,
      lng: 80.2907,
      type: "Transit Hub",
      risk: "MODERATE",
      capacityTotal: 1400,
      capacityUsed: 360,
      resources: { water: true, food: true, medical: false },
    },
  ],
  alerts: [
    {
      id: "A1",
      title: "Heavy Rain Warning",
      body: "Avoid low-lying areas. Check shelters for capacity updates.",
      level: "MODERATE",
      createdAt: Date.now() - 1000 * 60 * 30,
    },
  ],
  reports: [],
};

function load() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
}

function save(store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export const Store = {
  get() {
    return load();
  },

  shelters() {
    return load().shelters;
  },

  alerts() {
    return load().alerts.sort((a, b) => b.createdAt - a.createdAt);
  },

  reports() {
    return load().reports.sort((a, b) => b.createdAt - a.createdAt);
  },

  upsertShelter(shelter) {
    const s = load();
    const idx = s.shelters.findIndex((x) => x.id === shelter.id);
    if (idx >= 0) s.shelters[idx] = shelter;
    else s.shelters.unshift(shelter);
    save(s);
  },

  deleteShelter(id) {
    const s = load();
    s.shelters = s.shelters.filter((x) => x.id !== id);
    save(s);
  },

  pushAlert(alert) {
    const s = load();
    s.alerts.unshift(alert);
    save(s);
  },

  deleteAlert(id) {
    const s = load();
    s.alerts = s.alerts.filter((x) => x.id !== id);
    save(s);
  },

  addReport(report) {
    const s = load();
    s.reports.unshift(report);
    save(s);
  },
};
