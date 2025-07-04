# Set the working directory
$directory = ".\sv2"
Set-Location -Path $directory

# Get all PNG files that match the naming pattern
Get-ChildItem -Filter "x_0000s_*.png" | ForEach-Object {
    $originalName = $_.Name

    # Use regex to extract the suffix (e.g., o8)
    if ($originalName -match "x_0000s_\d+_(x\d+)\.png") {
        $newName = "$($matches[1]).png"

        # Rename the file
        Rename-Item -Path $_.FullName -NewName $newName
    }
}
