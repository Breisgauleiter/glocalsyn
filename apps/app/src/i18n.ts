// Simple i18n utility (mobile-first, minimal). MIT License.
// Usage: t('me.account.scl') returns translated string in active language.

type Lang = 'de' | 'en';

const DICT: Record<Lang, Record<string, string>> = {
  de: {
    'me.title': 'Ich',
    'me.description': 'Profil & Einstellungen.',
    'me.account.section': 'Account',
    'me.account.scl': 'SCL',
    'me.account.github': 'GitHub',
    'me.account.badges': 'Badges',
    'me.github.link': 'GitHub verknüpfen',
    'me.github.linkedThanks': 'GitHub ist verknüpft. Danke!',
    'me.github.settings.legend': 'GitHub Einstellungen',
    'me.github.repos.label': 'Repos (owner/name, komma-separiert)',
    'me.github.repos.help': 'Diese Auswahl überschreibt die Standard-Repo-Liste. Leer lassen = Standard verwenden.',
    'me.github.repos.invalidFormat': 'Ungültiges Format: {invalid}. Erwartet: owner/name.',
    'me.github.issueState': 'Issue-Status',
    'me.github.labels': 'Labels (komma-separiert)',
    'me.github.token': 'GitHub Token (optional)',
    'me.github.save': 'Speichern',
    'me.github.repoSelection.title': 'Repo-Auswahl',
    'me.github.repoSelection.empty': 'Keine Standard-Repos konfiguriert.',
  },
  en: {
    'me.title': 'Me',
    'me.description': 'Profile & Settings.',
    'me.account.section': 'Account',
    'me.account.scl': 'SCL',
    'me.account.github': 'GitHub',
    'me.account.badges': 'Badges',
    'me.github.link': 'Link GitHub',
    'me.github.linkedThanks': 'GitHub linked. Thanks!',
    'me.github.settings.legend': 'GitHub Settings',
    'me.github.repos.label': 'Repos (owner/name, comma-separated)',
    'me.github.repos.help': 'This overrides the default repo list. Leave empty = use default.',
    'me.github.repos.invalidFormat': 'Invalid format: {invalid}. Expected: owner/name.',
    'me.github.issueState': 'Issue status',
    'me.github.labels': 'Labels (comma-separated)',
    'me.github.token': 'GitHub Token (optional)',
    'me.github.save': 'Save',
    'me.github.repoSelection.title': 'Repository Selection',
    'me.github.repoSelection.empty': 'No default repositories configured.',
  },
};

function detectLang(): Lang {
  const stored = typeof localStorage !== 'undefined' ? (localStorage.getItem('lang') as Lang | null) : null;
  const envLang = (import.meta as any)?.env?.VITE_LANG as Lang | undefined;
  const guess = stored || envLang || 'de';
  return (guess === 'en' ? 'en' : 'de');
}

export function t(key: string, vars?: Record<string, string | number>, lang?: Lang): string {
  const active = lang || detectLang();
  const fallback = 'en';
  let template = DICT[active][key] || DICT[fallback][key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      template = template.replace(new RegExp(`{${k}}`, 'g'), String(v));
    }
  }
  return template;
}

export function availableLanguages(): Lang[] { return ['de', 'en']; }
