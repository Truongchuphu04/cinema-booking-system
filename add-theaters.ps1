$API_URL = "http://localhost:3000/api"

Write-Host "Logging in..." -ForegroundColor Green
$loginBody = @{
    email    = "admin@cinema.com"
    password = "Admin123!@"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" -Method POST -Headers @{"Content-Type" = "application/json" } -Body $loginBody -UseBasicParsing
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token

Write-Host "Login successful" -ForegroundColor Green

Write-Host "`nAdding theaters..." -ForegroundColor Green

$theaters = @(
    @{
        name = "CineMax Ha Noi - Tay Ho"
        location = @{
            city = "Hanoi"
            district = "Tay Ho"
            address = "Floor 4, Tay Ho Commercial Center, 123 Lac Long Quan Street"
        }
        address = "Floor 4, Tay Ho Commercial Center, 123 Lac Long Quan Street, Tay Ho District, Hanoi"
        capacity = 300
        phone = "024-1234-5678"
        email = "hanoi@cinemax.vn"
        facilities = @("IMAX", "Dolby Atmos", "Parking", "Cafe")
        status = "active"
        rooms = @(
            @{ name = "Room 1"; capacity = 100; type = "2D"; status = "active" }
            @{ name = "Room 2"; capacity = 80; type = "3D"; status = "active" }
            @{ name = "Room IMAX"; capacity = 120; type = "IMAX"; status = "active" }
        )
    },
    @{
        name = "CineMax HCMC - Nguyen Hue"
        location = @{
            city = "HCMC"
            district = "District 1"
            address = "Floor 8, CineMax Tower, 456 Nguyen Hue Boulevard"
        }
        address = "Floor 8, CineMax Tower, 456 Nguyen Hue Boulevard, Ben Nghe Ward, District 1, HCMC"
        capacity = 370
        phone = "028-2345-6789"
        email = "hcm.nguyenhue@cinemax.vn"
        facilities = @("4DX", "Dolby Atmos", "VIP Lounge", "Parking", "Restaurant")
        status = "active"
        rooms = @(
            @{ name = "Room 1"; capacity = 100; type = "2D"; status = "active" }
            @{ name = "Room 2"; capacity = 90; type = "3D"; status = "active" }
            @{ name = "Room 4DX"; capacity = 60; type = "4DX"; status = "active" }
            @{ name = "Room VIP"; capacity = 40; type = "2D"; status = "active" }
        )
    },
    @{
        name = "CineMax Da Nang - Han Market"
        location = @{
            city = "Da Nang"
            district = "Hai Chau"
            address = "Floor 5, CineMax Center, 789 Tran Hung Dao Street"
        }
        address = "Floor 5, CineMax Center, 789 Tran Hung Dao Street, Thach Thang Ward, Hai Chau District, Da Nang"
        capacity = 180
        phone = "0236-1234-5678"
        email = "danang@cinemax.vn"
        facilities = @("Standard", "Parking", "Cafe")
        status = "active"
        rooms = @(
            @{ name = "Room 1"; capacity = 100; type = "2D"; status = "active" }
            @{ name = "Room 2"; capacity = 80; type = "2D"; status = "active" }
        )
    },
    @{
        name = "CineMax Can Tho"
        location = @{
            city = "Can Tho"
            district = "Ninh Kieu"
            address = "Floor 6, CineMax Center, 321 Hai Ba Trung Street"
        }
        address = "Floor 6, CineMax Center, 321 Hai Ba Trung Street, An Khanh Ward, Ninh Kieu District, Can Tho"
        capacity = 185
        phone = "0292-1234-5678"
        email = "cantho@cinemax.vn"
        facilities = @("Standard", "Parking", "Cafe")
        status = "active"
        rooms = @(
            @{ name = "Room 1"; capacity = 100; type = "2D"; status = "active" }
            @{ name = "Room 2"; capacity = 85; type = "2D"; status = "active" }
        )
    },
    @{
        name = "CineMax Hai Phong"
        location = @{
            city = "Hai Phong"
            district = "Ngo Quyen"
            address = "Floor 7, CineMax Center, 654 Minh Khai Street"
        }
        address = "Floor 7, CineMax Center, 654 Minh Khai Street, Hong Bang Ward, Ngo Quyen District, Hai Phong"
        capacity = 100
        phone = "0225-1234-5678"
        email = "haiphong@cinemax.vn"
        facilities = @("Standard", "Parking")
        status = "active"
        rooms = @(
            @{ name = "Room 1"; capacity = 100; type = "2D"; status = "active" }
        )
    },
    @{
        name = "CineMax HCM - Binh Thanh"
        location = @{
            city = "HCMC"
            district = "Binh Thanh"
            address = "Floor 3, CineMax Center, 999 Dien Bien Phu Street"
        }
        address = "Floor 3, CineMax Center, 999 Dien Bien Phu Street, Ward 15, Binh Thanh District, HCMC"
        capacity = 200
        phone = "028-3456-7890"
        email = "binhthanh@cinemax.vn"
        facilities = @("Standard", "Parking", "Cafe")
        status = "active"
        rooms = @(
            @{ name = "Room 1"; capacity = 100; type = "2D"; status = "active" }
            @{ name = "Room 2"; capacity = 100; type = "3D"; status = "active" }
        )
    }
)

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$theaterIds = @()
foreach ($theater in $theaters) {
    $theaterBody = $theater | ConvertTo-Json -Depth 10
    
    try {
        $theaterResponse = Invoke-WebRequest -Uri "$API_URL/theaters" -Method POST -Headers $headers -Body $theaterBody -UseBasicParsing
        $theaterData = $theaterResponse.Content | ConvertFrom-Json
        $theaterIds += $theaterData.data._id
        Write-Host "Added: $($theater.name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $($theater.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDone! Theater IDs saved." -ForegroundColor Yellow
Write-Host "Total theaters added: $($theaterIds.Count)" -ForegroundColor Green
