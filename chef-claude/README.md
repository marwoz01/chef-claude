# Chef Claude

Aplikacja React/Vite do wyszukiwania przepisow na podstawie skladnikow. Dane pochodza z publicznego API TheMealDB, wiec projekt dziala bez lokalnego backendu i bez klucza API.

## Uruchomienie

```bash
npm install
npm run dev
```

Domyslny adres lokalny:

```text
http://127.0.0.1:5173/chef-claude/
```

## Build

```bash
npm run build
```

## API

Projekt uzywa darmowego endpointu developerskiego TheMealDB:

- `filter.php?i=ingredient` do wyszukiwania dan po skladniku
- `lookup.php?i=id` do pobierania pelnych danych przepisu
