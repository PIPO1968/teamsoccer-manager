
import { Player } from "../../../components/types/match";
import { MatchEventData } from "../types/matchTypes";
import { generateMatchTimeline } from "./utils/timelineGenerator";
import { calculateMatchStats } from "./utils/matchStats";
import { exportMatchData } from "./utils/matchExporter";
import { getRandomWeather, createWeatherEvent, WeatherType } from "./utils/weatherUtils";

/**
 * Core engine for match simulation
 */
export class MatchSimulationEngine {
  private homePlayers: Player[];
  private awayPlayers: Player[];
  private eventTimeline: MatchEventData[];
  private homeTeamId?: number;
  private awayTeamId?: number;
  private homeTeamName?: string;
  private awayTeamName?: string;
  private homeTeamLogo?: string;
  private awayTeamLogo?: string;
  private homeScore: number = 0;
  private awayScore: number = 0;
  private weather: WeatherType;

  constructor(
    homePlayers: Player[], 
    awayPlayers: Player[], 
    homeTeamId?: number,
    awayTeamId?: number,
    homeTeamName?: string,
    awayTeamName?: string,
    homeTeamLogo?: string,
    awayTeamLogo?: string
  ) {
    this.homePlayers = homePlayers;
    this.awayPlayers = awayPlayers;
    this.homeTeamId = homeTeamId;
    this.awayTeamId = awayTeamId;
    this.homeTeamName = homeTeamName;
    this.awayTeamName = awayTeamName;
    this.homeTeamLogo = homeTeamLogo;
    this.awayTeamLogo = awayTeamLogo;
    
    // Generate random weather for the match
    this.weather = getRandomWeather();
    
    // Generate the initial timeline
    this.eventTimeline = this.generateTimeline();
    
    // Calculate the score from the timeline
    const scores = this.calculateScores(this.eventTimeline);
    this.homeScore = scores.homeScore;
    this.awayScore = scores.awayScore;
    
    console.log(`Match initialized with weather: ${this.weather}`);
  }

  /**
   * Generate a complete match timeline
   */
  private generateTimeline(): MatchEventData[] {
    // First generate a weather event at the start of the match
    const weatherEvent = createWeatherEvent(0, this.weather, this.homeTeamName);
    
    // Generate the match events timeline
    const timelineResult = generateMatchTimeline(
      this.homePlayers, 
      this.awayPlayers,
      {
        homeTeamId: this.homeTeamId,
        awayTeamId: this.awayTeamId,
        homeTeamName: this.homeTeamName,
        awayTeamName: this.awayTeamName,
        homeTeamLogo: this.homeTeamLogo,
        awayTeamLogo: this.awayTeamLogo,
        weather: this.weather
      }
    );
    
    // Get the timeline from the result object
    const timeline = timelineResult.eventTimeline;
    
    // Add the weather event at the start
    timeline.unshift(weatherEvent);
    
    // Return the final timeline
    return timeline;
  }

  /**
   * Regenerate the match timeline for a new simulation
   */
  public regenerateTimeline(): MatchEventData[] {
    // Generate new random weather
    this.weather = getRandomWeather();
    
    // Regenerate the match events timeline
    this.eventTimeline = this.generateTimeline();
    
    // Recalculate the score
    const scores = this.calculateScores(this.eventTimeline);
    this.homeScore = scores.homeScore;
    this.awayScore = scores.awayScore;
    
    console.log(`Match regenerated with weather: ${this.weather}`);
    return this.eventTimeline;
  }

  /**
   * Get the current timeline
   */
  public getTimeline(): MatchEventData[] {
    return this.eventTimeline;
  }

  /**
   * Get the current weather
   */
  public getWeather(): WeatherType {
    return this.weather;
  }

  /**
   * Calculate the final score from goal events
   */
  private calculateScores(timeline: MatchEventData[]): { homeScore: number, awayScore: number } {
    let homeScore = 0;
    let awayScore = 0;
    
    timeline.forEach(event => {
      if (event.type === 'goal') {
        if (event.team === 'home') {
          homeScore++;
        } else {
          awayScore++;
        }
      }
    });
    
    return { homeScore, awayScore };
  }

  /**
   * Export the match data as JSON
   */
  public exportMatch(): string {
    return exportMatchData(
      this.eventTimeline,
      this.homeTeamId,
      this.homeTeamName,
      this.homeTeamLogo,
      this.homeScore,
      this.awayTeamId,
      this.awayTeamName,
      this.awayTeamLogo,
      this.awayScore,
      this.weather
    );
  }
}
