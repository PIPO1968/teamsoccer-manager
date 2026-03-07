

import { useState } from "react";
import { apiFetch } from "@/services/apiClient";
import { toast } from "sonner";
import { faker } from '@faker-js/faker';

export const useTransferListingsSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const seedTransferListings = async () => {
    setIsSeeding(true);
    try {
      console.log("Obteniendo países (region_id) de la base de datos...");
      // 1. Obtener todos los region_id de leagues_regions
      const regionsRes = await apiFetch<{ success: boolean; regions: { region_id: number }[] }>(
        '/leagues-regions',
        { method: 'GET' }
      );
      const regionIds = Array.isArray(regionsRes.regions)
        ? regionsRes.regions.map(r => r.region_id)
        : [1, 2, 3]; // fallback mínimo
      if (!regionIds.length) {
        toast.error("No se encontraron países en la base de datos");
        setIsSeeding(false);
        return;
      }

      // 2. Generar jugadores variados
      const positions = [
        'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'LM', 'RM', 'CAM', 'LW', 'RW', 'ST'
      ];
      const forms = ['Good', 'Excellent', 'Average', 'Poor'];
      const newPlayers = Array.from({ length: 10 }, () => {
        const position = faker.helpers.arrayElement(positions);
        const nationality_id = faker.helpers.arrayElement(regionIds);
        const age = faker.number.int({ min: 17, max: 36 });
        const rating = faker.number.int({ min: 58, max: 92 });
        const value = Math.round((Math.pow(rating / 60, 3.5) * 2000000) * (1 + faker.number.float({ min: -0.2, max: 0.2 })) / 50000) * 50000;
        const wage = Math.round(value / faker.number.int({ min: 350, max: 600 }) / 500) * 500;
        return {
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          position,
          nationality_id,
          age,
          value,
          team_id: null,
          wage,
          rating,
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
          form: faker.helpers.arrayElement(forms),
          personality: faker.number.int({ min: 1, max: 100 }),
          experience: faker.number.int({ min: 1, max: 100 }),
          leadership: faker.number.int({ min: 1, max: 100 }),
          loyalty: faker.number.int({ min: 1, max: 100 }),
          image_url: null,
          contract_until: '2027'
        };
      });

      // 3. Insertar jugadores
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
