
import { useUserBidsQuery } from "./queries/useUserBidsQuery";
import { useListingBidsQuery } from "./queries/useListingBidsQuery";
import { useHighestBidQuery } from "./queries/useHighestBidQuery";

export const useBidQueries = () => {
  const { getUserBids } = useUserBidsQuery();
  const { getListingBids } = useListingBidsQuery();
  const { getHighestBid } = useHighestBidQuery();

  return {
    getUserBids,
    getListingBids,
    getHighestBid
  };
};
