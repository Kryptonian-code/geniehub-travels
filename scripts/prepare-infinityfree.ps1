param(
    [string]$OutputRoot = "deploy",
    [string]$ApiBaseUrl = "/api",
    [string]$UploadsPublicPath = "/api/uploads/",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$deployRoot = Join-Path $projectRoot $OutputRoot
$publicHtmlRoot = Join-Path $deployRoot "public_html"
$databaseRoot = Join-Path $deployRoot "database"
$apiSource = Join-Path $projectRoot "api"
$distRoot = Join-Path $projectRoot "dist"
$schemaSource = Join-Path $projectRoot "xampp\\schema.sql"
$guideSource = Join-Path $projectRoot "docs\\INFINITYFREE_DEPLOY.md"
$envExampleSource = Join-Path $projectRoot ".env.example"
$apiConfigTarget = Join-Path $publicHtmlRoot "api\\config.php"
$uploadsTarget = Join-Path $publicHtmlRoot "api\\uploads"

if (-not $SkipBuild) {
    Write-Step "Building frontend for shared hosting"
    Push-Location $projectRoot
    try {
        $previousApiBase = $env:VITE_API_BASE_URL
        $env:VITE_API_BASE_URL = $ApiBaseUrl
        npm.cmd run build
    }
    finally {
        if ($null -eq $previousApiBase) {
            Remove-Item Env:\VITE_API_BASE_URL -ErrorAction SilentlyContinue
        }
        else {
            $env:VITE_API_BASE_URL = $previousApiBase
        }
        Pop-Location
    }
}
else {
    Write-Step "Skipping frontend build and reusing the existing dist folder"
}

Write-Step "Preparing deploy folder"
if (Test-Path $deployRoot) {
    Remove-Item -LiteralPath $deployRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $publicHtmlRoot -Force | Out-Null
New-Item -ItemType Directory -Path $databaseRoot -Force | Out-Null

Write-Step "Copying frontend build into deploy/public_html"
Copy-Item -Path (Join-Path $distRoot "*") -Destination $publicHtmlRoot -Recurse -Force

Write-Step "Copying PHP API into deploy/public_html/api"
Copy-Item -Path $apiSource -Destination $publicHtmlRoot -Recurse -Force

if (-not (Test-Path $uploadsTarget)) {
    New-Item -ItemType Directory -Path $uploadsTarget -Force | Out-Null
}

Get-ChildItem -Path $uploadsTarget -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne ".gitkeep" } |
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

if (-not (Test-Path (Join-Path $uploadsTarget ".gitkeep"))) {
    New-Item -ItemType File -Path (Join-Path $uploadsTarget ".gitkeep") -Force | Out-Null
}

Write-Step "Rewriting copied API config for shared hosting defaults"
$apiConfig = Get-Content $apiConfigTarget -Raw
$uploadsPublicPathEscaped = $UploadsPublicPath.Replace("\", "\\")
$replacement = "'uploads_public_path' => '$uploadsPublicPathEscaped'"
$apiConfig = $apiConfig -replace "'uploads_public_path' => '.*?'", $replacement
Set-Content -Path $apiConfigTarget -Value $apiConfig -Encoding UTF8

Write-Step "Adding shared hosting rewrite rules"
$rootHtaccess = @"
Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
</IfModule>
"@

$apiHtaccess = @"
Options -Indexes

<IfModule mod_headers.c>
Header set X-Content-Type-Options "nosniff"
</IfModule>
"@

Set-Content -Path (Join-Path $publicHtmlRoot ".htaccess") -Value $rootHtaccess -Encoding UTF8
Set-Content -Path (Join-Path $publicHtmlRoot "api\\.htaccess") -Value $apiHtaccess -Encoding UTF8

Write-Step "Copying database schema and deployment guide"
Copy-Item -Path $schemaSource -Destination (Join-Path $databaseRoot "schema.sql") -Force
Copy-Item -Path $guideSource -Destination (Join-Path $deployRoot "INFINITYFREE_DEPLOY.md") -Force
Copy-Item -Path $envExampleSource -Destination (Join-Path $deployRoot ".env.example") -Force

Write-Step "Shared hosting package ready"
Write-Host "Upload this folder to your host:" -ForegroundColor Green
Write-Host "  $publicHtmlRoot"
Write-Host ""
Write-Host "Also included:"
Write-Host "  $(Join-Path $databaseRoot 'schema.sql')"
Write-Host "  $(Join-Path $deployRoot 'INFINITYFREE_DEPLOY.md')"
Write-Host ""
Write-Host "Build used VITE_API_BASE_URL=$ApiBaseUrl"
Write-Host "Copied API uploads_public_path=$UploadsPublicPath"
