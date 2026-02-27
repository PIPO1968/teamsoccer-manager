
export interface MarketPlayer {
  id: number;
  name: string;
  position: string;
  age: number;
  nationality: string;
  rating: number;
  form: string;
  team: string;
  askingPrice: number;
  listedSince: string;
  listing_id?: number;
  player_id?: number;
  seller_team_id?: number | null;
  deadline: string;
  bidCount: number;
  highestBid?: number;
  userHasHighestBid?: boolean;
  value?: number; // Added value property for compatibility
  stats?: {
    finishing: number;
    pace: number;
    passing: number;
    defense: number;
    dribbling: number;
    heading: number;
    stamina: number;
  }
}

export interface PlayerBid {
  id: number; 
  transfer_listing_id: number;
  bidder_team_id: number;
  bidder_name: string;
  bid_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'outbid';
  created_at: string;
  // Additional properties for player details
  player_id?: number;
  player_name?: string;
  deadline?: string;
  is_active?: boolean;
  // Seller team details
  seller_team_id?: number;
  seller_team_name?: string;
}

export interface TransferListing {
  id: number;
  player_id: number;
  asking_price: number;
  seller_team_id: number | null;
  is_active: boolean;
  deadline: string;
  bids: number;
  playerDetails: {
    name: string;
    position: string;
    age: number;
    rating: number;
  };
  sellerDetails?: {
    name: string;
  };
}
