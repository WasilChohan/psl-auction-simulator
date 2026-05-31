export type TeamState = {
  teamId: number;
  name: string;
  ownerName: string;
  purseLeft: number;
  squad: { playerId: string; boughtPrice: number; playerName: string }[];
  isBot: boolean;
};

export type AuctionRoomState = {
  roomId: string;
  phase: "PRE" | "LIVE" | "PAUSED" | "XI" | "DONE";
  settings: { bidTimerSec: 10 | 15 | 20; pursePerTeam: number; squadLimit: number };
  teams: TeamState[];
  queue: string[];
  currentPlayerId: string | null;

  highestBid: number;
  highestBidTeamId: number | null;
  hasAnyBidOnCurrentPlayer: boolean;

  timerEndsAt: number | null;
  interval?: NodeJS.Timeout;
  
  // Track sold/unsold players
  soldPlayers: Map<string, { teamId: number; price: number }>;
  unsoldPlayers: string[];
};