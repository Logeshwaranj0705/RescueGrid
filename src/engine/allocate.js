function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const c1 = Math.cos((aLat * Math.PI) / 180);
  const c2 = Math.cos((bLat * Math.PI) / 180);
  const x = s1 * s1 + c1 * c2 * s2 * s2;
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * y;
}

function travelTimeMin(distKm, scenario, shelterRisk) {
  const baseSpeed = scenario.disasterType === "FLOOD" ? 18 : scenario.disasterType === "CYCLONE" ? 22 : 26;
  const sev = clamp(scenario.severity / 100, 0, 1);
  const congestion = 1 + 0.9 * sev;
  const mobility = 1 + clamp(scenario.mobilityImpact / 100, 0, 0.6);
  const riskPenalty = shelterRisk === "HIGH" ? 1.25 : shelterRisk === "MODERATE" ? 1.12 : 1.0;

  const minutes = (distKm / baseSpeed) * 60 * congestion * mobility * riskPenalty;
  return Math.round(minutes);
}

export function allocateDemand({ zones, shelters, demandByZone, scenario }) {
  const shelterState = shelters.map(s => ({
    ...s,
    available: Math.max(0, s.capacityTotal - s.capacityUsed)
  }));

  const zoneMap = new Map(zones.map(z => [z.id, z]));

  const costs = [];
  for (const d of demandByZone) {
    const z = zoneMap.get(d.zoneId);
    for (const s of shelterState) {
      const dist = haversineKm(z.lat, z.lng, s.lat, s.lng);
      const time = travelTimeMin(dist, scenario, s.risk);
      const cost = time + Math.round(dist * 2);
      costs.push({
        zoneId: d.zoneId,
        zoneName: d.zoneName,
        shelterId: s.id,
        shelterName: s.name,
        distKm: Number(dist.toFixed(2)),
        timeMin: time,
        cost
      });
    }
  }

  costs.sort((a, b) => a.cost - b.cost);

  const remaining = new Map(demandByZone.map(d => [d.zoneId, d.demand]));
  const assigned = [];
  const assignedByZone = new Map();
  const assignedByShelter = new Map();

  for (const edge of costs) {
    const need = remaining.get(edge.zoneId) || 0;
    if (need <= 0) continue;

    const sh = shelterState.find(s => s.id === edge.shelterId);
    if (!sh || sh.available <= 0) continue;

    const take = Math.min(need, sh.available);
    if (take <= 0) continue;

    sh.available -= take;
    remaining.set(edge.zoneId, need - take);

    assigned.push({ ...edge, people: take });

    assignedByZone.set(edge.zoneId, (assignedByZone.get(edge.zoneId) || 0) + take);
    assignedByShelter.set(edge.shelterId, (assignedByShelter.get(edge.shelterId) || 0) + take);
  }

  const unserved = demandByZone
    .map(d => ({ zoneId: d.zoneId, zoneName: d.zoneName, unserved: remaining.get(d.zoneId) || 0 }))
    .filter(x => x.unserved > 0);

  const totalDemand = demandByZone.reduce((a, b) => a + b.demand, 0);
  const totalAssigned = assigned.reduce((a, b) => a + b.people, 0);

  const weightedTime = assigned.reduce((acc, x) => acc + x.people * x.timeMin, 0);
  const avgTime = totalAssigned ? Math.round(weightedTime / totalAssigned) : 0;

  return {
    assigned,
    unserved,
    shelterRemaining: shelterState.map(s => ({
      id: s.id,
      name: s.name,
      remaining: s.available
    })),
    metrics: {
      totalDemand,
      totalAssigned,
      totalUnserved: totalDemand - totalAssigned,
      avgTravelTimeMin: avgTime
    }
  };
}
