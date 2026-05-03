param(
    [string]$BaseUrl = "https://agcauto-eg.com/cars/",
    [string]$OutputFile = "p:\CARS\onyx-inventory.js"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-Html {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    return (Invoke-WebRequest -Uri $Url -UseBasicParsing -Headers @{ "User-Agent" = "Mozilla/5.0 Onyx Inventory Bot" }).Content
}

function Normalize-Text {
    param([string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return ""
    }

    $normalized = [regex]::Replace($Text, "<br\s*/?>", " ", "IgnoreCase")
    $normalized = [regex]::Replace($normalized, "<[^>]+>", " ")
    $normalized = [System.Net.WebUtility]::HtmlDecode($normalized)
    $normalized = [regex]::Replace($normalized, "\s+", " ").Trim()
    return $normalized
}

function Get-AbsoluteUrl {
    param(
        [string]$Url,
        [string]$FallbackBase
    )

    if ([string]::IsNullOrWhiteSpace($Url)) {
        return $null
    }

    if ($Url.StartsWith("http", [System.StringComparison]::OrdinalIgnoreCase)) {
        return $Url
    }

    return ([System.Uri]::new([System.Uri]::new($FallbackBase), $Url)).AbsoluteUri
}

function Get-PriceRange {
    param([string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return $null
    }

    $matches = [regex]::Matches($Text, '(?i)(\d{1,3}(?:,\d{3})+|\d{4,})(?=\s*EGP)')
    if ($matches.Count -eq 0) {
        return $null
    }

    $values = @()
    foreach ($match in $matches) {
        $digits = ($match.Groups[1].Value -replace "[^\d]", "")
        if ($digits.Length -gt 0) {
            $values += [int64]$digits
        }
    }

    if ($values.Count -eq 0) {
        return $null
    }

    return [PSCustomObject]@{
        min = ($values | Measure-Object -Minimum).Minimum
        max = ($values | Measure-Object -Maximum).Maximum
        display = $Text
    }
}

function Get-PriceLabel {
    param(
        [string]$Html,
        [string]$Title
    )

    $patterns = @(
        '(?is)BOOK\s*NOW(?<block>.*?)(?:CAR\s*EXTERIOR|CAR\s*INTERIOR|CAR\s*DETAILS)',
        '(?is)OFFICIAL\s*PRICE(?<block>.*?)(?:CAR\s*EXTERIOR|CAR\s*INTERIOR|CAR\s*DETAILS)'
    )

    foreach ($pattern in $patterns) {
        $match = [regex]::Match($Html, $pattern)
        if (-not $match.Success) {
            continue
        }

        $candidate = Normalize-Text $match.Groups['block'].Value
        if ($Title) {
            $candidate = [regex]::Replace($candidate, [regex]::Escape($Title), '', 'IgnoreCase')
        }

        $candidate = [regex]::Replace($candidate, '^(BOOK\s*NOW|OFFICIAL\s*PRICE)\s*', '', 'IgnoreCase').Trim()
        if ($candidate -match 'EGP') {
            return $candidate
        }
    }

    return ''
}

function Get-BrandName {
    param(
        [string]$Title,
        [string]$Url
    )

    if ($Title -match '^(MG)\d') {
        return 'MG'
    }

    foreach ($brand in @('BAIC', 'BYD', 'CHANGAN', 'CHERY', 'CITROEN', 'GEELY', 'HAVAL', 'JAC', 'JETOUR', 'KYC', 'MG', 'NISSAN', 'PROTON', 'RENAULT', 'SUZUKI', 'TOYOTA')) {
        if ($Title.StartsWith($brand, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $brand
        }
    }

    $path = ([System.Uri]$Url).AbsolutePath.TrimEnd('/')
    foreach ($segment in ($path -split '/')) {
        if ($segment -in @('baic','byd','changan','chery','citroen','geely','haval','jac','jetour','kyc','mg','nissan','proton','renault','suzuki','toyota')) {
            return $segment.ToUpperInvariant()
        }
    }

    return (($Title -split '\s+')[0]).ToUpperInvariant()
}

function Get-SectionBlock {
    param(
        [string]$Html,
        [string]$Heading
    )

    $pattern = "(?is)<h[1-6][^>]*>\s*$([regex]::Escape($Heading))\s*</h[1-6]>(.*?)(?=<h[1-6][^>]*>|$)"
    $match = [regex]::Match($Html, $pattern)
    if ($match.Success) {
        return $match.Groups[1].Value
    }

    return ""
}

function Get-CarData {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url
    )

    $html = Get-Html -Url $Url

    $titleMatch = [regex]::Match($html, "(?is)<h1[^>]*>(.*?)</h1>")
    $title = Normalize-Text $titleMatch.Groups[1].Value

    $priceText = Get-PriceLabel -Html $html -Title $title

    $detailsBlock = Get-SectionBlock -Html $html -Heading "CAR DETAILS"
    $detailsText = Normalize-Text $detailsBlock
    $detailsText = [regex]::Replace($detailsText, "MORE FROM.*$", "").Trim()

    $imagePattern = @'
(?is)<img[^>]+src=["''](?<src>[^"'']+)["''][^>]*>
'@.Trim()
    $imageMatches = [regex]::Matches($html, $imagePattern)
    $images = New-Object System.Collections.Generic.List[string]

    foreach ($match in $imageMatches) {
        $imageUrl = Get-AbsoluteUrl -Url $match.Groups['src'].Value -FallbackBase $Url
        if (-not $imageUrl) {
            continue
        }

        if ($imageUrl -match '/(Logo|cropped-Logo|flags|translatepress|placeholder|avatar)' -or $imageUrl -match 'data:image') {
            continue
        }

        if (-not $images.Contains($imageUrl)) {
            $images.Add($imageUrl)
        }
    }

    $slug = (($Url.TrimEnd('/') -split '/')[-1]).Trim()
    $brand = Get-BrandName -Title $title -Url $Url
    $priceRange = Get-PriceRange -Text $priceText

    return [PSCustomObject]@{
        slug = $slug
        title = $title
        brand = $brand
        url = $Url
        price = $priceRange
        priceLabel = $priceText
        details = $detailsText
        heroImage = ($images | Select-Object -First 1)
        gallery = @($images | Select-Object -First 6)
    }
}

$rootHtml = Get-Html -Url $BaseUrl

$brandPattern = @'
(?i)href=["''](?<href>https://agcauto-eg\.com/cars/(?!sedan/|suv/|44-2/|hatchback/|pick-up/|minivan/)[^"'']+/)["'']
'@.Trim()
$brandUrls = [regex]::Matches($rootHtml, $brandPattern) |
    ForEach-Object { $_.Groups['href'].Value } |
    Sort-Object -Unique

$detailUrls = New-Object System.Collections.Generic.HashSet[string]

$featuredPattern = @'
(?i)href=["''](?<href>https://agcauto-eg\.com/\d{4}/\d{2}/\d{2}/[^"'']+/)["'']
'@.Trim()
[regex]::Matches($rootHtml, $featuredPattern) |
    ForEach-Object { [void]$detailUrls.Add($_.Groups['href'].Value) }

foreach ($brandUrl in $brandUrls) {
    Write-Host "Scanning brand page: $brandUrl"
    $brandHtml = Get-Html -Url $brandUrl
    [regex]::Matches($brandHtml, $featuredPattern) |
        ForEach-Object { [void]$detailUrls.Add($_.Groups['href'].Value) }

    $altPattern = @'
(?i)href=["''](?<href>https://agcauto-eg\.com/cars/[^"'']+/)["'']
'@.Trim()
    [regex]::Matches($brandHtml, $altPattern) |
        ForEach-Object {
            $href = $_.Groups['href'].Value
            if ($href -notmatch '/cars/(sedan|suv|44-2|hatchback|pick-up|minivan|byd|geely|haval|jac|chery|jetour|changan|proton|citroen|renault|baic|kyc|mg|toyota|nissan|suzuki)/?$') {
                [void]$detailUrls.Add($href)
            }
        }
}

$cars = New-Object System.Collections.Generic.List[object]

foreach ($detailUrl in (@($detailUrls) | Sort-Object -Unique)) {
    Write-Host "Scraping vehicle: $detailUrl"
    try {
        $car = Get-CarData -Url $detailUrl
        if ($car.title -and $car.details -and $car.gallery.Count -gt 0) {
            $cars.Add($car)
        }
    }
    catch {
        Write-Warning "Failed to scrape $detailUrl - $($_.Exception.Message)"
    }
}

$orderedCars = $cars |
    Sort-Object brand, title -Unique

$output = "window.OnyxInventory = " + ($orderedCars | ConvertTo-Json -Depth 6) + ";"
[System.IO.File]::WriteAllText($OutputFile, $output, [System.Text.UTF8Encoding]::new($false))

Write-Host "Wrote $($orderedCars.Count) vehicles to $OutputFile"