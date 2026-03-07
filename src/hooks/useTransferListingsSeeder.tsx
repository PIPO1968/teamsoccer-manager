
import { useState } from "react";
import { apiFetch } from "@/services/apiClient";
import { toast } from "sonner";
import { faker } from '@faker-js/faker';

export const useTransferListingsSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const seedTransferListings = async () => {
    setIsSeeding(true);
    try {
      console.log("Starting to seed transfer listings");

      const newPlayers = Array.from({ length: 10 }, () => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        position: faker.helpers.arrayElement([
          'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'LM', 'RM', 'CAM', 'LW', 'RW', 'ST'
        ]),
        nationality_id: faker.number.int({ min: 1, max: 3 }), // region_id válidos en leagues_regions
        age: faker.number.int({ min: 18, max: 35 }),
        value: faker.number.int({ min: 500000, max: 5000000 }),
        team_id: null
      }));

      const insertedData = await apiFetch<{ success: boolean; players: any[] }>(
        '/admin/players/batch',
        { method: 'POST', body: JSON.stringify({ players: newPlayers }) }
      );

      const insertedPlayers = insertedData.players;
      if (!insertedPlayers || insertedPlayers.length === 0) {
        toast.error("Failed to create new players");
        return;
      }

      console.log("Successfully inserted players:", insertedPlayers.length);

      for (const player of insertedPlayers) {
        const askingPrice = Math.round(player.value * (1 + Math.random() * 0.4));
        await apiFetch('/transfer-listings', {
          method: 'POST',
          body: JSON.stringify({
            player_id: player.player_id,
            asking_price: askingPrice,
            seller_team_id: null // explícito para jugadores libres
          })
        });
      }

      console.log("Successfully seeded transfer listings");
      toast.success(`Added ${insertedPlayers.length} new players to the transfer market`);
    } catch (error) {
      console.error("Error seeding transfer listings:", error);
      toast.error("Failed to add players to the transfer market");
    } finally {
      setIsSeeding(false);
    }
  };

  return { seedTransferListings, isSeeding };
};
