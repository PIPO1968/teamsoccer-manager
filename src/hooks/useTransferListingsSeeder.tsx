
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

      const newPlayers = Array.from({ length: 10 }, () => {
        const position = faker.helpers.arrayElement([
          'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'LM', 'RM', 'CAM', 'LW', 'RW', 'ST'
        ]);
        return {
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          position,
          nationality_id: faker.number.int({ min: 1, max: 3 }),
          age: faker.number.int({ min: 18, max: 35 }),
          value: faker.number.int({ min: 500000, max: 5000000 }),
          team_id: null,
          wage: faker.number.int({ min: 5000, max: 20000 }),
          rating: faker.number.int({ min: 60, max: 90 }),
          pace: faker.number.int({ min: 30, max: 99 }),
          finishing: faker.number.int({ min: 30, max: 99 }),
          passing: faker.number.int({ min: 30, max: 99 }),
          defense: faker.number.int({ min: 30, max: 99 }),
          dribbling: faker.number.int({ min: 30, max: 99 }),
          heading: faker.number.int({ min: 30, max: 99 }),
          stamina: faker.number.int({ min: 30, max: 99 }),
          goalkeeper: position === 'GK' ? faker.number.int({ min: 60, max: 99 }) : faker.number.int({ min: 10, max: 30 }),
          crosses: faker.number.int({ min: 10, max: 99 }),
          fitness: faker.number.int({ min: 80, max: 100 }),
          form: 'Good',
          personality: faker.number.int({ min: 1, max: 100 }),
          experience: faker.number.int({ min: 1, max: 100 }),
          leadership: faker.number.int({ min: 1, max: 100 }),
          loyalty: faker.number.int({ min: 1, max: 100 }),
          image_url: null,
          contract_until: '2027'
        };
      });

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
