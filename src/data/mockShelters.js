export const mockShelters = [
  {
    id: "S1",
    name: "Govt School Shelter",
    type: "School",
    lat: 13.0827,
    lng: 80.2707,
    capacityTotal: 300,
    capacityUsed: 210,
    resources: { water: true, food: true, medical: false },
    safety: "GOOD",
    updatedAt: Date.now() - 1000 * 60 * 12
  },
  {
    id: "S2",
    name: "Community Hall Shelter",
    type: "Hall",
    lat: 13.0700,
    lng: 80.2500,
    capacityTotal: 180,
    capacityUsed: 160,
    resources: { water: true, food: false, medical: true },
    safety: "MODERATE",
    updatedAt: Date.now() - 1000 * 60 * 4
  },
  {
    id: "S3",
    name: "Temple Shelter",
    type: "Relief",
    lat: 13.0950,
    lng: 80.2900,
    capacityTotal: 120,
    capacityUsed: 40,
    resources: { water: true, food: true, medical: true },
    safety: "GOOD",
    updatedAt: Date.now() - 1000 * 60 * 22
  },
  {
    id: "S4",
    name: "Stadium Shelter Zone",
    type: "Stadium",
    lat: 13.0605,
    lng: 80.2750,
    capacityTotal: 800,
    capacityUsed: 790,
    resources: { water: true, food: true, medical: true },
    safety: "HIGH_RISK",
    updatedAt: Date.now() - 1000 * 60 * 2
  }
];