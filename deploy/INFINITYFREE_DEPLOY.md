# InfinityFree / cPanel Deployment Guide

This project can be packaged for shared hosting with one command.

## Recommended Command

Run this from the project root after any correction:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-infinityfree.ps1
```

You can also use the npm alias:

```powershell
npm run prepare:infinityfree
```

## What The Script Produces

The script builds a ready-to-upload folder structure:

```text
deploy/
  public_html/
    index.html
    assets/
    api/
    .htaccess
  database/
    schema.sql
  INFINITYFREE_DEPLOY.md
  .env.example
```

## What To Upload

Upload the **contents of `deploy/public_html`** into your hosting account's `public_html` folder.

Do not upload:

- `src`
- `node_modules`
- `tests`
- local `.env`
- local `dist`

## What To Import

Import:

```text
deploy/database/schema.sql
```

into the MySQL database for your hosting account.

## Shared Hosting Flow

1. Run the packaging script.
2. Open `deploy/public_html`.
3. Upload everything inside that folder into your remote `public_html`.
4. Create or select your hosting MySQL database.
5. Import `deploy/database/schema.sql`.
6. Edit `public_html/api/config.php` on the server with your real database credentials.
7. Make sure `public_html/api/uploads` remains writable.
8. Visit the site and test admin login, package pages, contact, uploads, and dashboard flows.

## Important Server File To Edit

After upload, update:

```text
public_html/api/config.php
```

At minimum, confirm:

- `db_host`
- `db_name`
- `db_user`
- `db_pass`
- `uploads_public_path`

For most root-domain shared hosting deployments:

```php
'uploads_public_path' => '/api/uploads/'
```

## If The Site Is In A Subfolder

If you are not deploying to the root of the domain, build with a different API path.

Example:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-infinityfree.ps1 -ApiBaseUrl "/myapp/api" -UploadsPublicPath "/myapp/api/uploads/"
```

## What The Script Already Handles

- runs `vite build`
- creates a fresh `deploy` folder
- copies the frontend build into `deploy/public_html`
- copies the PHP API into `deploy/public_html/api`
- keeps the uploads folder structure
- adds SPA rewrite rules in `.htaccess`
- copies `schema.sql` for database import
- copies this deployment guide into the deploy folder

## After Every Correction

Use the same command again:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-infinityfree.ps1
```

Then upload the refreshed `deploy/public_html` contents again.

## Suggested Verification After Upload

Check these first:

- homepage loads
- admin login works
- client login works
- package detail pages open
- blog pages open
- contact form works
- consultation flow works
- uploads reach `api/uploads`
- images and documents load with the correct URLs

## Notes

- `.env` is intentionally not part of the upload package
- shared hosting builds should rely on the copied frontend build plus `api/config.php`
- if you change your domain structure later, rebuild with the correct `-ApiBaseUrl`
