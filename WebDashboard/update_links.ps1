$filesToUpdate = @("public\privacy.html", "public\terms.html")

foreach ($file in $filesToUpdate) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Replace univr.onrender.com with www.aerotwinvr.com
        $content = $content -replace 'https?://univr\.onrender\.com/?', 'https://www.aerotwinvr.com/'
        $content = $content -replace 'univr\.onrender\.com', 'www.aerotwinvr.com'
        
        # Update cookie policy link in footer
        $content = $content -replace '<li><a href="#">Cookie Policy</a></li>', '<li><a href="cookies.html">Cookie Policy</a></li>'
        
        Set-Content -Path $file -Value $content -Encoding UTF8
        Write-Host "Updated $file"
    } else {
        Write-Host "File not found: $file"
    }
}
