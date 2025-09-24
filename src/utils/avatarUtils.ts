// Avatar utility functions for generating default avatars

export const getDefaultAvatar = (gender: string | null, id: number): string => {
  // Use local avatar files
  if (gender === 'female') {
    return '/src/assets/avatars/female_avatar.svg';
  } else if (gender === 'male') {
    return '/src/assets/avatars/male_avatar.svg';
  } else {
    // Default to male avatar for 'other' gender
    return '/src/assets/avatars/male_avatar.svg';
  }
};

// Fallback function for when local avatar files are not available
export const getFallbackAvatar = (gender: string | null, id: number): string => {
  if (gender === 'female') {
    return generateFemaleAvatar(id);
  } else if (gender === 'male') {
    return generateMaleAvatar(id);
  } else {
    return generateNeutralAvatar(id);
  }
};

// Generate female avatar SVG
const generateFemaleAvatar = (id: number): string => {
  const colors = [
    '#FF6B9D', '#FF8E9B', '#FFB3BA', '#FFC1CC', '#FFD1DC',
    '#FFB6C1', '#FFA0B4', '#FF91A4', '#FF82B1', '#FF69B4'
  ];
  const color = colors[id % colors.length];
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
        </linearGradient>
        <linearGradient id="hair-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#A0522D;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="75" cy="75" r="75" fill="url(#bg-${id})"/>
      
      <!-- Face -->
      <ellipse cx="75" cy="85" rx="35" ry="40" fill="#FDBCB4"/>
      
      <!-- Hair -->
      <path d="M 40 60 Q 75 35 110 60 Q 110 45 75 25 Q 40 45 40 60 Z" fill="url(#hair-${id})"/>
      
      <!-- Eyes -->
      <circle cx="65" cy="75" r="4" fill="#2C3E50"/>
      <circle cx="85" cy="75" r="4" fill="#2C3E50"/>
      <circle cx="65" cy="73" r="1.5" fill="#FFFFFF"/>
      <circle cx="85" cy="73" r="1.5" fill="#FFFFFF"/>
      
      <!-- Eyebrows -->
      <path d="M 58 68 Q 65 65 72 68" stroke="#8B4513" stroke-width="2" fill="none"/>
      <path d="M 78 68 Q 85 65 92 68" stroke="#8B4513" stroke-width="2" fill="none"/>
      
      <!-- Nose -->
      <ellipse cx="75" cy="85" rx="2" ry="3" fill="#E8A87C"/>
      
      <!-- Mouth -->
      <path d="M 70 95 Q 75 100 80 95" stroke="#E74C3C" stroke-width="2" fill="none"/>
      
      <!-- Earrings -->
      <circle cx="50" cy="85" r="3" fill="#FFD700"/>
      <circle cx="100" cy="85" r="3" fill="#FFD700"/>
      
      <!-- Necklace -->
      <circle cx="75" cy="120" r="2" fill="#FFD700"/>
    </svg>
  `)}`;
};

// Generate male avatar SVG
const generateMaleAvatar = (id: number): string => {
  const colors = [
    '#3498DB', '#2980B9', '#5DADE2', '#85C1E9', '#AED6F1',
    '#D6EAF8', '#A9CCE3', '#7FB3D3', '#5499C7', '#2980B9'
  ];
  const color = colors[id % colors.length];
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
        </linearGradient>
        <linearGradient id="hair-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2C3E50;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#34495E;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="75" cy="75" r="75" fill="url(#bg-${id})"/>
      
      <!-- Face -->
      <ellipse cx="75" cy="85" rx="35" ry="40" fill="#FDBCB4"/>
      
      <!-- Hair -->
      <path d="M 40 55 Q 75 20 110 55 Q 110 40 75 15 Q 40 40 40 55 Z" fill="url(#hair-${id})"/>
      
      <!-- Eyes -->
      <circle cx="65" cy="75" r="4" fill="#2C3E50"/>
      <circle cx="85" cy="75" r="4" fill="#2C3E50"/>
      <circle cx="65" cy="73" r="1.5" fill="#FFFFFF"/>
      <circle cx="85" cy="73" r="1.5" fill="#FFFFFF"/>
      
      <!-- Eyebrows -->
      <path d="M 58 68 Q 65 65 72 68" stroke="#2C3E50" stroke-width="2" fill="none"/>
      <path d="M 78 68 Q 85 65 92 68" stroke="#2C3E50" stroke-width="2" fill="none"/>
      
      <!-- Nose -->
      <ellipse cx="75" cy="85" rx="2" ry="3" fill="#E8A87C"/>
      
      <!-- Mouth -->
      <path d="M 70 95 Q 75 100 80 95" stroke="#E74C3C" stroke-width="2" fill="none"/>
      
      <!-- Mustache -->
      <path d="M 68 90 Q 75 88 82 90" stroke="#2C3E50" stroke-width="2" fill="none"/>
      
      <!-- Beard -->
      <path d="M 65 100 Q 75 110 85 100 Q 85 115 75 120 Q 65 115 65 100 Z" fill="url(#hair-${id})"/>
    </svg>
  `)}`;
};

// Generate neutral avatar SVG
const generateNeutralAvatar = (id: number): string => {
  const colors = [
    '#9B59B6', '#8E44AD', '#A569BD', '#BB8FCE', '#D2B4DE',
    '#E8DAEF', '#D7BDE2', '#C39BD3', '#AF7AC5', '#9B59B6'
  ];
  const color = colors[id % colors.length];
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
        </linearGradient>
        <linearGradient id="hair-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6C3483;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8E44AD;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="75" cy="75" r="75" fill="url(#bg-${id})"/>
      
      <!-- Face -->
      <ellipse cx="75" cy="85" rx="35" ry="40" fill="#FDBCB4"/>
      
      <!-- Hair -->
      <path d="M 40 60 Q 75 30 110 60 Q 110 45 75 20 Q 40 45 40 60 Z" fill="url(#hair-${id})"/>
      
      <!-- Eyes -->
      <circle cx="65" cy="75" r="4" fill="#2C3E50"/>
      <circle cx="85" cy="75" r="4" fill="#2C3E50"/>
      <circle cx="65" cy="73" r="1.5" fill="#FFFFFF"/>
      <circle cx="85" cy="73" r="1.5" fill="#FFFFFF"/>
      
      <!-- Eyebrows -->
      <path d="M 58 68 Q 65 65 72 68" stroke="#6C3483" stroke-width="2" fill="none"/>
      <path d="M 78 68 Q 85 65 92 68" stroke="#6C3483" stroke-width="2" fill="none"/>
      
      <!-- Nose -->
      <ellipse cx="75" cy="85" rx="2" ry="3" fill="#E8A87C"/>
      
      <!-- Mouth -->
      <path d="M 70 95 Q 75 100 80 95" stroke="#E74C3C" stroke-width="2" fill="none"/>
      
      <!-- Glasses -->
      <circle cx="65" cy="75" r="12" stroke="#2C3E50" stroke-width="2" fill="none" opacity="0.3"/>
      <circle cx="85" cy="75" r="12" stroke="#2C3E50" stroke-width="2" fill="none" opacity="0.3"/>
      <line x1="77" y1="75" x2="73" y2="75" stroke="#2C3E50" stroke-width="2" opacity="0.3"/>
    </svg>
  `)}`;
};

// Alternative: Use a service like DiceBear for more variety
export const getDiceBearAvatar = (gender: string | null, id: number): string => {
  const seed = `employee-${id}`;
  
  if (gender === 'female') {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,pastelPink,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc`;
  } else if (gender === 'male') {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc`;
  } else {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&hairColor=auburn,black,blonde,brown,pastelPink,red,strawberryBlonde&skinColor=edb98a,fdbcb4,fd9841,ffd5dc`;
  }
};
