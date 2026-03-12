$API_URL = "http://localhost:3000/api"

Write-Host "Registering user..." -ForegroundColor Green
$registerBody = @{
    email    = "admin@cinema.com"
    password = "Admin123!@"
    fullName = "Cinema Admin"
    phone    = "0123456789"
    dob      = "1990-01-01"
    gender   = "male"
} | ConvertTo-Json

Invoke-WebRequest -Uri "$API_URL/auth/register" -Method POST -Headers @{"Content-Type" = "application/json" } -Body $registerBody -UseBasicParsing -ErrorAction SilentlyContinue

Write-Host "Logging in..." -ForegroundColor Green
$loginBody = @{
    email    = "admin@cinema.com"
    password = "Admin123!@"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "$API_URL/auth/login" -Method POST -Headers @{"Content-Type" = "application/json" } -Body $loginBody -UseBasicParsing
$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.token

Write-Host "Adding movies..." -ForegroundColor Green

$movies = @(
    @{
        title        = "Interstellar"
        overview     = "A team of astronauts travel through a wormhole near Saturn"
        poster       = "public\MV5BMjExMjkwNTQ0Nl5BMl5BanBnXkFtZTcwNTY0OTk1Mw@@._V1_.jpg"
        backdrop_path = "https://image.tmdb.org/t/p/w1280/b45BM6Ysz3YjpRWenZY97AnYVJV.jpg"
        release_date = "2014-11-07"
        runtime      = 169
        duration     = 169
        genre        = "Khoa hoc vien tuong,Kich tinh"
        rating       = 8.6
        adult        = $false
        popularity   = 85
        status       = "showing"
    },
    @{
        title        = "The Shawshank Redemption"
        overview     = "Two imprisoned men bond over a number of years"
        poster       = "https://image.tmdb.org/t/p/w500/q6y0aYMMP2PR8yC660exqNvxayZ.jpg"
        backdrop_path = "https://image.tmdb.org/t/p/w1280/hb3Z56PrP2weHmeRzsaXO0HQtKL.jpg"
        release_date = "1994-10-14"
        runtime      = 142
        duration     = 142
        genre        = "Kich tinh"
        rating       = 9.3
        adult        = $false
        popularity   = 80
        status       = "showing"
    },
    @{
        title        = "Joker"
        overview     = "A failed comedian turns to crime"
        poster       = "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8vDhodVnKEU.jpg"
        backdrop_path = "https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1vMYh5QSuoJ.jpg"
        release_date = "2019-10-04"
        runtime      = 122
        duration     = 122
        genre        = "Kich tinh,Toi pham"
        rating       = 8.4
        adult        = $false
        popularity   = 88
        status       = "showing"
    },
    @{
        title        = "Dune"
        overview     = "Paul Atreides travels to a dangerous planet"
        poster       = "https://image.tmdb.org/t/p/w500/d5NXSklXo96JOVj2XwpVzm9Ot7h.jpg"
        backdrop_path = "https://image.tmdb.org/t/p/w1280/z8Ub6qADxiVwhaypSmXR9xKcSwE.jpg"
        release_date = "2021-10-22"
        runtime      = 166
        duration     = 166
        genre        = "Khoa hoc vien tuong,Hanh dong,Phieu luu"
        rating       = 8.0
        adult        = $false
        popularity   = 92
        status       = "showing"
    },
    @{
        title        = "The Matrix"
        overview     = "A computer hacker learns about reality"
        poster       = "/thumb-1920-385304.jpg"
        backdrop_path = "/thumb-1920-385304.jpg"
        release_date = "1999-03-31"
        runtime      = 136
        duration     = 136
        genre        = "Khoa hoc vien tuong,Hanh dong"
        rating       = 8.7
        adult        = $false
        popularity   = 78
        status       = "showing"
    },
    @{
        title        = "Inception"
        overview     = "A skilled thief steals corporate secrets"
        poster       = "https://image.tmdb.org/t/p/w500/9gk7adHYeDMNNGP+G5oXj82huSh.jpg"
        backdrop_path = "https://image.tmdb.org/t/p/w1280/fEzroK9awQwB6G5X8rK5kgryvhQ.jpg"
        release_date = "2010-07-16"
        runtime      = 148
        duration     = 148
        genre        = "Hanh dong,Khoa hoc vien tuong,Kinh di tam ly"
        rating       = 8.8
        adult        = $false
        popularity   = 90
        status       = "showing"
    }
)

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

$movieIds = @()
foreach ($movie in $movies) {
    $movieBody = $movie | ConvertTo-Json
    try {
        $movieResponse = Invoke-WebRequest -Uri "$API_URL/movies" -Method POST -Headers $headers -Body $movieBody -UseBasicParsing
        $movieData = $movieResponse.Content | ConvertFrom-Json
        $movieIds += $movieData.data._id
        Write-Host "Added: $($movie.title)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error adding movie: $($movie.title)" -ForegroundColor Red
    }
}

Write-Host "Adding theaters..." -ForegroundColor Green
$theaters = @(
    @{
        name     = "CineMax Hanoi"
        location = "Tay Ho, Hanoi"
        city     = "Hanoi"
        address  = "123 Lac Long Quan Street"
        rooms    = @(
            @{
                roomNumber   = "A"
                seatCapacity = 100
                seatTypes    = @{
                    standard = 80
                    vip      = 15
                    couple   = 5
                }
            }
        )
    }
)

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
        Write-Host "Error adding theater" -ForegroundColor Red
    }
}

Write-Host "Adding showtimes..." -ForegroundColor Green
if ($movieIds.Count -gt 0 -and $theaterIds.Count -gt 0) {
    $showtimes = @(
        @{
            movieId   = $movieIds[0]
            theaterId = $theaterIds[0]
            roomId    = "A"
            date      = "2026-03-15"
            time      = "14:00"
            basePrice = 100000
            seatTypes = @{
                standard = 100000
                vip      = 150000
                couple   = 200000
            }
        },
        @{
            movieId   = $movieIds[1]
            theaterId = $theaterIds[0]
            roomId    = "A"
            date      = "2026-03-15"
            time      = "19:00"
            basePrice = 100000
            seatTypes = @{
                standard = 100000
                vip      = 150000
                couple   = 200000
            }
        },
        @{
            movieId   = $movieIds[2]
            theaterId = $theaterIds[0]
            roomId    = "A"
            date      = "2026-03-16"
            time      = "19:30"
            basePrice = 100000
            seatTypes = @{
                standard = 100000
                vip      = 150000
                couple   = 200000
            }
        }
    )
    
    foreach ($showtime in $showtimes) {
        $showtimeBody = $showtime | ConvertTo-Json -Depth 10
        try {
            Invoke-WebRequest -Uri "$API_URL/showtimes" -Method POST -Headers $headers -Body $showtimeBody -UseBasicParsing | Out-Null
            Write-Host "Added showtime" -ForegroundColor Green
        }
        catch {
            Write-Host "Error adding showtime" -ForegroundColor Red
        }
    }
}

Write-Host "`nDone! Refresh http://localhost:5173" -ForegroundColor Yellow
