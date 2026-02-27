
import { Cloud, CloudRain, Sun, CloudSun } from "lucide-react";

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'partlyCloudy';

export const weatherTypes = {
  sunny: {
    name: 'Sunny',
    description: 'A beautiful sunny day for football',
    icon: Sun,
    ballMovement: 1.0, // Normal ball movement
    playerMovement: 1.0, // Normal player movement
  },
  rainy: {
    name: 'Rainy',
    description: 'Rain is affecting the pitch conditions',
    icon: CloudRain,
    ballMovement: 0.8, // Ball moves slower on wet pitch
    playerMovement: 0.9, // Players move slightly slower
  },
  cloudy: {
    name: 'Overcast',
    description: 'Cloudy conditions over the stadium',
    icon: Cloud,
    ballMovement: 1.0, // Normal ball movement
    playerMovement: 1.0, // Normal player movement
  },
  partlyCloudy: {
    name: 'Partly Cloudy',
    description: 'Partly cloudy but pleasant conditions',
    icon: CloudSun,
    ballMovement: 1.0, // Normal ball movement
    playerMovement: 1.0, // Normal player movement
  }
};

// Generate a random weather type
export const getRandomWeather = (): WeatherType => {
  const weatherOptions: WeatherType[] = ['sunny', 'rainy', 'cloudy', 'partlyCloudy'];
  const randomIndex = Math.floor(Math.random() * weatherOptions.length);
  return weatherOptions[randomIndex];
};

// Get a weather event with description for the match timeline
export const createWeatherEvent = (
  minute: number, 
  weather: WeatherType, 
  teamName: string = 'Home Team'
) => {
  const weatherInfo = weatherTypes[weather];
  
  return {
    minute,
    type: 'weather' as const,
    team: 'home' as const, // Weather events are neutral but we assign them to home team
    weather,
    weatherIcon: weather,
    description: `${weatherInfo.description} as ${teamName} prepares for the match.`,
    teamName
  };
};

// Generate weather commentary for match events
export const getWeatherCommentary = (weather: WeatherType): string => {
  const weatherInfo = weatherTypes[weather];
  
  if (!weatherInfo) return 'The weather conditions are affecting the match.';
  
  const commentaries = {
    sunny: [
      'It\'s a beautiful sunny day for football, perfect conditions for the match.',
      'Clear skies and sunshine today, giving players great visibility on the pitch.',
      'The sun is shining brightly, creating ideal playing conditions for both teams.'
    ],
    rainy: [
      'Rain is falling steadily, making the pitch slick and potentially impacting ball control.',
      'The wet conditions will test players\' technical abilities today.',
      'Players will need to adjust to the rainy conditions, as passes may skip across the wet surface.'
    ],
    cloudy: [
      'Overcast conditions over the stadium, but no rain expected during the match.',
      'Gray skies above but the pitch is in good condition for today\'s game.',
      'Cloudy weather provides comfortable temperatures for the players today.'
    ],
    partlyCloudy: [
      'Partly cloudy conditions for today\'s match, with occasional sunshine breaking through.',
      'A mix of sun and clouds for this match, creating pleasant playing conditions.',
      'Some cloud cover but generally good conditions for today\'s football.'
    ]
  };
  
  const options = commentaries[weather];
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
};

// Update the match simulation based on weather conditions
export const applyWeatherEffects = (
  weather: WeatherType,
  homePlayers: any[],
  awayPlayers: any[]
) => {
  const weatherInfo = weatherTypes[weather];
  
  if (!weatherInfo) return { homePlayers, awayPlayers };
  
  // Apply weather effects to player attributes if needed
  // This is where you would modify player attributes based on weather
  
  return { homePlayers, awayPlayers };
};
