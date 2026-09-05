import type { Language } from './preference';
import telugu from './te.json';
const dictionary: Record<string, string> = telugu;
const folded = Object.fromEntries(Object.entries(dictionary).map(([key,value]) => [key.toLowerCase(),value]));
export function translate(text: string, language: Language): string {
  if (language === 'en' || !text.trim()) return text;
  const key = text.trim().replace(/\s+/g, ' ');
  const translated = dictionary[key] ?? folded[key.toLowerCase()];
  if (translated) return text.replace(text.trim(), translated);
  const arrow = key.match(/^(.*?)(\s*[→↗↘♡♥]+)$/);
  if (arrow && dictionary[arrow[1].trim()]) return dictionary[arrow[1].trim()] + arrow[2];
  const year = key.match(/^Tractors in (\d{4})$/);
  if (year) return year[1] + 'లో ట్రాక్టర్లు';
  const optional = key.match(/^(.*?) — Telugu \(optional\)$/);
  if (optional) return translate(optional[1], language) + ' — తెలుగు (ఐచ్ఛికం)';
  const counter = key.match(/^(\d+) (published models?|brands?|results?|tractors?|reviews?)$/);
  if (counter) return counter[1] + ' ' + ({'published model':'ప్రచురించిన మోడల్','published models':'ప్రచురించిన మోడళ్లు',brand:'బ్రాండ్',brands:'బ్రాండ్లు',result:'ఫలితం',results:'ఫలితాలు',tractor:'ట్రాక్టర్',tractors:'ట్రాక్టర్లు',review:'సమీక్ష',reviews:'సమీక్షలు'} as Record<string,string>)[counter[2]];
  return text;
}
