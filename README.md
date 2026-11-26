# moduportugal.eu

Static site for MODU (HOUSE 05, Unipessoal Lda). Plain HTML, CSS and JavaScript, no build step.
Hosted on Cloudflare (Workers static assets, config in `wrangler.jsonc`): every push to `main` is published automatically.

## Structure

- `index.html` home
- `start/` Strategy Call form, then Calendly
- `supplier-form/` supplier intake form
- `privacy/` privacy notice
- `404.html` not-found page
- `css/site.css`, `js/site.js` shared styles and behaviour
- `assets/` fonts, images, video
- `apps-script/` Google Apps Script that receives each form (Google Sheets + email alert)
- `_headers`, `_redirects` Cloudflare Pages config

## Cloudflare Pages settings

- Framework preset: None
- Build command: (empty)
- Build output directory: `/`

## Forms

Each form posts to a Google Apps Script web app. After deploying a script, paste its URL in
`js/site.js` (`ENDPOINTS.client` / `ENDPOINTS.supplier`).

Install, for each script:
1. Open the Google Sheet (client form: "MODU - Potenciais Clientes", supplier form: "MODU | Supplier Registry").
2. Extensions > Apps Script. Delete the sample code and paste the matching `.gs` file.
3. Save. Select the function `setup` and click Run. Approve the permissions (Sheets and email).
4. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy.
5. Copy the Web app URL (ends in `/exec`) and send it to be added to `js/site.js`.
