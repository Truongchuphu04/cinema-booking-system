$API_URL = "http://localhost:3000/api"

$loginBody = @{
    email = "admin@cinema.com"
    password = "Admin123!@"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $loginBody -UseBasicParsing
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Fetching theaters..." -ForegroundColor Green
$theatersResponse = Invoke-WebRequest -Uri "$API_URL/theaters" -Method GET -Headers $headers -UseBasicParsing
$theatersData = $theatersResponse.Content | ConvertFrom-Json
$theaters = $theatersData.data

Write-Host "Updating theaters with rooms..." -ForegroundColor Green

foreach ($theater in $theaters) {
    $updateBody = @{
        name = $theater.name
        address = $theater.address
        location = @{
            city = $theater.location.city
            district = $theater.location.district
            address = $theater.location.address
        }
        capacity = $theater.capacity
        phone = $theater.phone
        email = $theater.email
        facilities = $theater.facilities
        rooms = @(
            @{
                name = "Room 1"
                capacity = 100
                type = "2D"
                status = "active"
            }
        )
    } | ConvertTo-Json -Depth 10
    
    Invoke-WebRequest -Uri "$API_URL/theaters/$($theater._id)" -Method PUT -Headers $headers -Body $updateBody -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    Write-Host "Updated: $($theater.name)" -ForegroundColor Green
}

Write-Host "Waiting 1 second..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

Write-Host "Fetching movies..." -ForegroundColor Green
$moviesResponse = Invoke-WebRequest -Uri "$API_URL/movies?limit=10" -Method GET -Headers $headers -UseBasicParsing
$moviesData = $moviesResponse.Content | ConvertFrom-Json
$movies = $moviesData.data

Write-Host "Fetching updated theaters with rooms..." -ForegroundColor Green
$theatersResponse2 = Invoke-WebRequest -Uri "$API_URL/theaters" -Method GET -Headers $headers -UseBasicParsing
$theatersData2 = $theatersResponse2.Content | ConvertFrom-Json
$theaters2 = $theatersData2.data

Write-Host "Adding showtimes..." -ForegroundColor Green

$addedCount = 0
for ($i = 0; $i -lt $movies.Count -and $i -lt $theaters2.Count; $i++) {
    if ($theaters2[$i].rooms -and $theaters2[$i].rooms.Count -gt 0) {
        $showtime = @{
            movieId = $movies[$i]._id
            theaterId = $theaters2[$i]._id
            roomId = $theaters2[$i].rooms[0]._id
            date = "2026-03-1$($i+5)"
            time = "19:00"
            price = 100000
            totalSeats = 100
            availableSeats = 100
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$API_URL/showtimes" -Method POST -Headers $headers -Body $showtime -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 201) {
            Write-Host "Added showtime for $($movies[$i].title)" -ForegroundColor Green
            $addedCount++
        }
    }
}

Write-Host "Done: $addedCount showtimes added" -ForegroundColor Yellow
