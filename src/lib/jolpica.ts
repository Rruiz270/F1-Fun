interface JolpicaDriver {
  code: string;
  givenName: string;
  familyName: string;
}

interface JolpicaResult {
  position: string;
  Driver: JolpicaDriver;
}

export async function fetchQualifyingResults(round: number, season: number = 2025): Promise<string[]> {
  const url = `https://api.jolpi.ca/ergast/f1/${season}/${round}/qualifying.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jolpica API error: ${res.status}`);

  const data = await res.json();
  const races = data?.MRData?.RaceTable?.Races;
  if (!races || races.length === 0) throw new Error('No qualifying data found');

  const results: JolpicaResult[] = races[0].QualifyingResults;
  // Return driver codes in qualifying order (position 1, 2, 3...)
  return results
    .sort((a: JolpicaResult, b: JolpicaResult) => parseInt(a.position) - parseInt(b.position))
    .map((r: JolpicaResult) => r.Driver.code);
}

export async function fetchSprintResults(round: number, season: number = 2025): Promise<string[]> {
  const url = `https://api.jolpi.ca/ergast/f1/${season}/${round}/sprint.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jolpica API error: ${res.status}`);

  const data = await res.json();
  const races = data?.MRData?.RaceTable?.Races;
  if (!races || races.length === 0) throw new Error('No sprint data found');

  const results: JolpicaResult[] = races[0].SprintResults;
  return results
    .sort((a: JolpicaResult, b: JolpicaResult) => parseInt(a.position) - parseInt(b.position))
    .map((r: JolpicaResult) => r.Driver.code);
}

export async function fetchRaceResults(round: number, season: number = 2025): Promise<string[]> {
  const url = `https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jolpica API error: ${res.status}`);

  const data = await res.json();
  const races = data?.MRData?.RaceTable?.Races;
  if (!races || races.length === 0) throw new Error('No race data found');

  const results: JolpicaResult[] = races[0].Results;
  return results
    .sort((a: JolpicaResult, b: JolpicaResult) => parseInt(a.position) - parseInt(b.position))
    .map((r: JolpicaResult) => r.Driver.code);
}
