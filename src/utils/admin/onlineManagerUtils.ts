
export const formatLastLogin = (lastLogin: string) => {
  const date = new Date(lastLogin);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  return date.toLocaleDateString();
};

export const formatCurrentLocation = (url?: string) => {
  if (!url) return "Unknown location";
  
  // Map common URLs to readable names
  const urlMappings: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/world': 'World',
    '/matches': 'Matches',
    '/transfer-market': 'Transfer Market',
    '/training': 'Training',
    '/forums': 'Forums',
    '/messages': 'Messages',
    '/challenges': 'Challenges',
    '/rooms': 'Rooms',
    '/community': 'Community',
    '/help': 'Help',
    '/admin': 'Admin Area',
    '/shop': 'Shop'
  };

  // Check for exact matches first
  if (urlMappings[url]) {
    return `${urlMappings[url]} (${url})`;
  }

  // Check for pattern matches
  if (url.startsWith('/team/')) return `Team View (${url})`;
  if (url.startsWith('/manager/')) return `Manager Profile (${url})`;
  if (url.startsWith('/match/')) return `Match View (${url})`;
  if (url.startsWith('/series/')) return `Series (${url})`;
  if (url.startsWith('/league/')) return `League (${url})`;
  if (url.startsWith('/forum/')) return `Forum Thread (${url})`;
  if (url.startsWith('/thread/')) return `Forum Discussion (${url})`;
  if (url.startsWith('/players/')) return `Player View (${url})`;
  if (url.startsWith('/stadium/')) return `Stadium (${url})`;
  if (url.startsWith('/finances/')) return `Finances (${url})`;
  if (url.startsWith('/bids/')) return `Transfer Bids (${url})`;
  if (url.startsWith('/admin/')) return `Admin Tools (${url})`;
  if (url.startsWith('/rooms/')) return `Group Room (${url})`;
  if (url.startsWith('/guestbook/')) return `Team Guestbook (${url})`;
  if (url.startsWith('/flags/')) return `Flag Collection (${url})`;

  // Always return the URL, even if no specific mapping exists
  return url;
};
