export function formatEventType(eventType: string): string {
  const formatMap: Record<string, string> = {
    'forum': 'Forum',
    'dinner': 'Dinner',
    'vrt': 'VRT',
    'learn_go': 'Learn & Go',
    'activation': 'Activation',
    'veb': 'VEB',
    'other': 'Other'
  };
  return formatMap[eventType] || eventType;
}

export function formatEventTypePlural(eventType: string): string {
  const pluralMap: Record<string, string> = {
    'forum': 'Forums',
    'dinner': 'Dinners',
    'vrt': 'Virtual Roundtables',
    'learn_go': 'Learn and Gos',
    'activation': 'Community Activations',
    'veb': 'VEBs',
    'other': 'Other Events'
  };
  return pluralMap[eventType] || eventType;
}
