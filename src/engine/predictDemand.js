function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function norm(n, a, b) {
  if (b - a === 0) return 0;
  return clamp((n - a) / (b - a), 0, 1);
}

export function computeDemand(zones, scenario) {
  const pops = zones.map(z => z.population);
  const incs = zones.map(z => z.pastIncidents);
  const elev = zones.map(z => z.elevationM);
  const hosp = zones.map(z => z.hospitalKm);

  const popMin = Math.min(...pops), popMax = Math.max(...pops);
  const incMin = Math.min(...incs), incMax = Math.max(...incs);
  const elevMin = Math.min(...elev), elevMax = Math.max(...elev);
  const hospMin = Math.min(...hosp), hospMax = Math.max(...hosp);

  const { disasterType, severity, rainfallMm, windKmph, timeOfDay, mobilityImpact } = scenario;

  const baseType = disasterType === "FLOOD" ? 1.0 : disasterType === "CYCLONE" ? 0.95 : disasterType === "FIRE" ? 0.85 : 0.9;
  const sev = clamp(severity / 100, 0, 1);

  const rainFactor = disasterType === "FLOOD" ? clamp(rainfallMm / 200, 0, 1) : clamp(rainfallMm / 500, 0, 0.5);
  const windFactor = disasterType === "CYCLONE" ? clamp(windKmph / 120, 0, 1) : clamp(windKmph / 250, 0, 0.35);

  const timeFactor = timeOfDay === "NIGHT" ? 1.10 : 1.0;
  const mobilityFactor = 1 + clamp(mobilityImpact / 100, 0, 0.6);

  return zones.map(z => {
    const popN = norm(z.population, popMin, popMax);
    const incN = norm(z.pastIncidents, incMin, incMax);
    const elevN = 1 - norm(z.elevationM, elevMin, elevMax);
    const hospN = norm(z.hospitalKm, hospMin, hospMax);

    const vulnerability =
      0.33 * clamp(z.elderlyPct, 0, 0.3) +
      0.27 * clamp(z.povertyPct, 0, 0.4) +
      0.20 * hospN +
      0.20 * incN;

    const hazard =
      0.35 * sev +
      0.25 * rainFactor +
      0.20 * windFactor +
      0.20 * elevN;

    const evacRate = clamp(
      baseType *
        (0.22 + 0.58 * hazard + 0.35 * vulnerability) *
        timeFactor *
        mobilityFactor,
      0.05,
      0.85
    );

    const demand = Math.round(z.population * evacRate);

    return {
      zoneId: z.id,
      zoneName: z.name,
      demand,  
      evacRate,
      vulnerability,
      hazard
    };
  });
}

