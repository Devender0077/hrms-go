const fs = require('fs');

// Read the complete en.json as reference
const enData = JSON.parse(fs.readFileSync('./en.json', 'utf8'));

// Language mappings for auto-translation placeholders
const languages = {
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ar: 'Arabic',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese'
};

// Function to recursively ensure all keys exist
function ensureKeys(target, source, lang) {
  for (const key in source) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      ensureKeys(target[key], source[key], lang);
    } else {
      if (!(key in target)) {
        // Add English as placeholder with note
        target[key] = source[key] + ` (${lang} translation needed)`;
      }
    }
  }
  return target;
}

// Update each language file
Object.keys(languages).forEach(langCode => {
  const filePath = `./${langCode}.json`;
  let langData = {};
  
  try {
    langData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.log(`⚠️  ${langCode}.json not found or invalid, creating new...`);
  }
  
  // Ensure all keys from en.json exist
  langData = ensureKeys(langData, enData, languages[langCode]);
  
  // Write updated file
  fs.writeFileSync(filePath, JSON.stringify(langData, null, 2) + '\n');
  
  console.log(`✅ Updated ${langCode}.json with structure from en.json`);
});

console.log('\n✅ All language files synchronized!');
console.log('📝 Note: Keys with "(Language translation needed)" should be translated by native speakers');

