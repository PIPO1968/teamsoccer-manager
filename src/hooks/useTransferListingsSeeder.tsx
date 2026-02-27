
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { faker } from '@faker-js/faker';

export const useTransferListingsSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const seedTransferListings = async () => {
    setIsSeeding(true);
    try {
      console.log("Starting to seed transfer listings");
      
      // Generate 10 new players with no team
      const newPlayers = Array.from({ length: 10 }, () => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        position: faker.helpers.arrayElement([
          'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'LM', 'RM', 'CAM', 'LW', 'RW', 'ST'
        ]),
        nationality: faker.location.country(),
        age: faker.number.int({ min: 18, max: 35 }),
        rating: faker.number.int({ min: 65, max: 85 }),
        form: faker.helpers.arrayElement(['Excellent', 'Good', 'Average', 'Poor']),
        value: faker.number.int({ min: 500000, max: 5000000 }),
        team_id: null
      }));

      console.log("Generated new players:", newPlayers.length);

      // Insert new players into the players table
      const { data: insertedPlayers, error: playerError } = await supabase
        .from('players')
        .insert(newPlayers)
        .select();

      if (playerError) {
        console.error("Error inserting players:", playerError);
        throw playerError;
      }

      if (!insertedPlayers || insertedPlayers.length === 0) {
        console.error("No players were inserted");
        toast.error("Failed to create new players");
        setIsSeeding(false);
        return;
      }

      console.log("Successfully inserted players:", insertedPlayers.length);

      // Create transfer listings for the new players
      const listings = insertedPlayers.map(player => ({
        player_id: player.player_id,
        asking_price: Math.round(player.value * (1 + Math.random() * 0.4)), // Random price up to 40% above value
        is_active: true,
        seller_team_id: null, // Explicitly set to null since these are free agents
        views: 0,
        hotlists: 0,
        bids: 0
      }));

      console.log("Preparing to insert listings:", listings.length);

      // Insert the listings one by one to help with debugging
      for (const listing of listings) {
        const { error: listingError } = await supabase
          .from('transfer_listings')
          .insert(listing);

        if (listingError) {
          console.error("Error inserting listing for player", listing.player_id, ":", listingError);
          throw listingError;
        }
      }

      console.log("Successfully added listings to transfer market");
      toast.success(`Added ${listings.length} new players to the transfer market`);
    } catch (error) {
      console.error("Error seeding transfer listings:", error);
      toast.error("Failed to add players to the transfer market");
    } finally {
      setIsSeeding(false);
    }
  };

  return { seedTransferListings, isSeeding };
};
