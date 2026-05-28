# i18n — Internationalization Setup

## Files

| File | Purpose |
|------|---------|
| `en.json` | Complete English strings (source of truth) |
| `kin.json` | Kinyarwanda translation template (hand to translator) |
| `i18n.js` | react-i18next configuration |

---

## 1. Install dependencies

```bash
npm install i18next react-i18next
```

---

## 2. Register i18n in your app entry point

In `src/main.jsx`, import the config **before** rendering:

```jsx
import "./i18n/i18n.js"; // must be first
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 3. Use translations in any component

```jsx
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav>
      <a href="/">{t("nav.home")}</a>
      <a href="/explore">{t("nav.explore")}</a>
      <button>{t("nav.favorites")}</button>
    </nav>
  );
};
```

### With interpolation (dynamic values)

```jsx
// Key: "explore.results_found": "{{count}} movie{{plural}} found"
t("explore.results_found", { count: 42, plural: "s" })
// → "42 movies found"

// Key: "watch.resuming_from": "Resuming from {{percent}}%"
t("watch.resuming_from", { percent: 65 })
// → "Resuming from 65%"
```

---

## 4. Add a language switcher

```jsx
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="kin">Kinyarwanda</option>
    </select>
  );
};
```

---

## 5. For the translator

Hand `kin.json` to your translator. Every key has an empty string `""` — they fill in the Kinyarwanda translation next to each key. The structure mirrors `en.json` exactly so they can compare side by side.

**Example:**
```json
// en.json
"nav.home": "Home"

// kin.json — translator fills in:
"nav.home": "Ahabanza"
```

---

## Key naming convention

```
category.key_name

nav.home          → navigation items
search.placeholder → search bar text
movie.save        → movie detail page
player.play       → video player controls
explore.clear_all → explore/filter page
history.resume    → watch history page
errors.not_found  → error messages
footer.copyright  → footer text
about.*           → about page
privacy.*         → privacy policy page
terms.*           → terms & conditions page
```
