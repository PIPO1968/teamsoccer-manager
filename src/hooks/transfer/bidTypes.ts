
import { PlayerBid } from "@/pages/transfer-market/types";

export interface BidOperationResult {
  success: boolean;
  message?: string;
  error?: any;
}

export interface BidHighestResult {
  amount: number;
  isUserBid: boolean;
}

// Error types for better error handling
export interface BidError extends Error {
  context?: string;
  operation?: string;
  data?: any;
}

// Create a typed error factory
export function createBidError(message: string, operation: string, data?: any): BidError {
  const error = new Error(message) as BidError;
  error.name = "BidError";
  error.context = "bid";
  error.operation = operation;
  error.data = data;
  return error;
}
