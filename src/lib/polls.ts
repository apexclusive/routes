/**
 * Peilingen: alleen echte stemmen tellen.
 *
 * De app heeft nog geen centrale poll-database. We verzinnen daarom geen
 * "basisstemmen" of sociale bewijskracht. `tally` rekent uitsluitend met een
 * expliciet aangeleverde telling en geeft bij nul stemmen ook echt nul terug.
 */

export interface PollDef {
  id: string;
  question: string;
  options: string[];
}

export interface PollResult {
  votes: number[];
  total: number;
  percentages: number[];
  /** -1 als er nog geen echte stem is. */
  winner: number;
}

/**
 * Rekent echte tellingen om naar percentages die bij een niet-lege poll exact
 * 100 vormen. Negatieve, oneindige en ontbrekende waarden tellen als nul.
 */
export function tally(
  _id: string,
  options: string[],
  suppliedVotes: number[] | null
): PollResult {
  const votes = options.map((_, i) => {
    const value = suppliedVotes?.[i] ?? 0;
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  });
  const total = votes.reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return { votes, total: 0, percentages: options.map(() => 0), winner: -1 };
  }

  const raw = votes.map((value) => (value / total) * 100);
  const percentages = raw.map((value) => Math.floor(value));
  let remainder = 100 - percentages.reduce((sum, value) => sum + value, 0);

  // Largest-remainder-methode: stabiel en exact, ook bij drie gelijke opties.
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let i = 0; remainder > 0 && order.length > 0; i++, remainder--) {
    percentages[order[i % order.length].index] += 1;
  }

  let winner = 0;
  votes.forEach((value, index) => {
    if (value > votes[winner]) winner = index;
  });
  return { votes, total, percentages, winner };
}
