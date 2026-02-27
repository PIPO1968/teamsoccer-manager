
interface IPGeolocationResponse {
  country_name: string;
  country_code: string;
}

/**
 * Detect user's country by IP address using ipapi.co (free tier: 1000 requests/day)
 * Falls back to a secondary service if the first one fails
 */
export async function detectUserCountry(): Promise<string | null> {
  console.log('🌍 Starting IP geolocation detection...');
  
  try {
    // Primary service: ipapi.co
    console.log('📡 Trying primary service: ipapi.co');
    const response = await fetch('https://ipapi.co/json/');
    console.log('📡 Primary service response status:', response.status);
    
    if (response.ok) {
      const data: IPGeolocationResponse = await response.json();
      console.log('📡 Primary service response data:', data);
      console.log('🎯 Detected country from primary service:', data.country_name);
      return data.country_name;
    }
  } catch (error) {
    console.warn('❌ Primary IP geolocation service failed:', error);
  }

  try {
    // Fallback service: ip-api.com
    console.log('📡 Trying fallback service: ip-api.com');
    const response = await fetch('http://ip-api.com/json/');
    console.log('📡 Fallback service response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📡 Fallback service response data:', data);
      console.log('🎯 Detected country from fallback service:', data.country);
      return data.country;
    }
  } catch (error) {
    console.warn('❌ Fallback IP geolocation service failed:', error);
  }

  console.warn('❌ All IP geolocation services failed');
  return null;
}
