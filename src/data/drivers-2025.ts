import { Driver } from '@/types';

export const drivers2025: Driver[] = [
  // Red Bull Racing
  { code: 'VER', name: 'Max Verstappen', team: 'Red Bull Racing', teamColor: '#3671C6', number: 1 },
  { code: 'LAW', name: 'Liam Lawson', team: 'Red Bull Racing', teamColor: '#3671C6', number: 30 },
  // Ferrari
  { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', teamColor: '#E80020', number: 16 },
  { code: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari', teamColor: '#E80020', number: 44 },
  // McLaren
  { code: 'NOR', name: 'Lando Norris', team: 'McLaren', teamColor: '#FF8000', number: 4 },
  { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', teamColor: '#FF8000', number: 81 },
  // Mercedes
  { code: 'RUS', name: 'George Russell', team: 'Mercedes', teamColor: '#27F4D2', number: 63 },
  { code: 'ANT', name: 'Kimi Antonelli', team: 'Mercedes', teamColor: '#27F4D2', number: 12 },
  // Aston Martin
  { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', teamColor: '#229971', number: 14 },
  { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin', teamColor: '#229971', number: 18 },
  // Alpine
  { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine', teamColor: '#0093CC', number: 10 },
  { code: 'DOO', name: 'Jack Doohan', team: 'Alpine', teamColor: '#0093CC', number: 7 },
  // Williams
  { code: 'ALB', name: 'Alexander Albon', team: 'Williams', teamColor: '#64C4FF', number: 23 },
  { code: 'SAI', name: 'Carlos Sainz', team: 'Williams', teamColor: '#64C4FF', number: 55 },
  // RB (Racing Bulls)
  { code: 'TSU', name: 'Yuki Tsunoda', team: 'RB', teamColor: '#6692FF', number: 22 },
  { code: 'HAD', name: 'Isack Hadjar', team: 'RB', teamColor: '#6692FF', number: 6 },
  // Haas
  { code: 'OCO', name: 'Esteban Ocon', team: 'Haas', teamColor: '#B6BABD', number: 31 },
  { code: 'BEA', name: 'Oliver Bearman', team: 'Haas', teamColor: '#B6BABD', number: 87 },
  // Sauber
  { code: 'HUL', name: 'Nico Hulkenberg', team: 'Sauber', teamColor: '#52E252', number: 27 },
  { code: 'BOR', name: 'Gabriel Bortoleto', team: 'Sauber', teamColor: '#52E252', number: 5 },
];

export function getDriverByCode(code: string): Driver | undefined {
  return drivers2025.find(d => d.code === code);
}
