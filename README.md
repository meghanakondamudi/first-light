# First Light

First Light is a clean, static morning briefing for Tenali and Geneva, with curated headlines, two daily essays, and a technology policy signal.

## Run locally

Because this is a dependency-free static site, open `index.html` in a browser or serve the folder with any static server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

This can be hosted directly from the repository root:

1. Create a GitHub repository and push this folder.
2. In **Settings → Pages**, select **Deploy from a branch**.
3. Choose the `main` branch and the `/ (root)` folder.

The current content is intentionally local mock content. The headline data is in `app.js`; replace the `stories` array with data from your preferred RSS/news service, and add weather API responses in the same file when you are ready to make it live. Respect each publication's terms and link readers to the original articles rather than copying article text.
