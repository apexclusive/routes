/**
 * Peilingen (polls): stem lokaal, uitslag altijd zichtbaar.
 * Basis-stemmen zijn deterministisch per poll-id, zodat een uitslag er
 * nooit uitziet als een verlaten dorpsplein. Pure logica → testbaar.
 */

export interface PollDef {
  id: string;
  question: string;
  options: string[];
}

/** Deterministische basis-stemmen per optie (hash van id+optie, 12–89). */
export function baseVotes(id: string, options: string[]): number[] {
  return options.map((o) => 12 + (hashStr(id + "|" + o) % 78));
}

/** Uitslag: percentages afgerond, samen altijd 100 binnen afrondingscorrectie. */
export function tally(
  id: string,
  options: string[],
  localVotes: number[] | null
): { votes: number[]; total: number; percentages: number[]; winner: number } {
  const base = baseVotes(id, options);
  const votes = base.map(
    (b, i) => b + (localVotes && localVotes[i] > 0 ? localVotes[i] : 0)
  );
  const total = votes.reduce((a, b) => a + b, 0) || 1;
  const raw = votes.map((v) => (v / total) * 100);
  const percentages = raw.map((p) => Math.round(p));
  // afronding corrigeren op het grootste restant
  const drift = 100 - percentages.reduce((a, b) => a + b, 0);
  if (drift !== 0 && percentages.length > 0) {
    let idx = 0;
    let bestRest = -1;
    raw.forEach((p, i) => {
      const rest = p - Math.floor(p);
      if (rest > bestRest) {
        bestRest = rest;
        idx = i;
      }
    });
    percentages[idx] += drift;
  }
  let winner = 0;
  votes.forEach((v, i) => {
    if (v > votes[winner]) winner = i;
  });
  return { votes, total, percentages, winner };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
