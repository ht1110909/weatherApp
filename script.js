// Frontend JavaScript for weather app

async function getWeather() {
    const location = document.getElementById('location').value.trim();
    const [cityName, countryCode] = location.split(',').map(part => part.trim());

    if (!countryCode) {
        alert('Please enter a country code');
        return;
    }

    if (!cityName) {
        alert('Please enter a city name');
        return;
    }
    
    try {
        // Show loading state
        const button = document.getElementById('fetch-weather');
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;
        
        // Make API call to our server
        const response = await fetch(`/api/weather?countryCode=${encodeURIComponent(countryCode)}&cityName=${encodeURIComponent(cityName)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch weather data');
        }
        
        // Display the weather data
        displayWeatherData(data);
        changeBackground(data);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching weather data: ' + error.message);
    } finally {
        // Reset button state
        const button = document.getElementById('fetch-weather');
        button.textContent = 'Get Weather';
        button.disabled = false;
    }
}

function displayWeatherData(data) {
    const { location, weather } = data;
    
    // Create or update weather display
    let weatherDisplay = document.getElementById('weather-display');
    if (!weatherDisplay) {
        weatherDisplay = document.createElement('div');
        weatherDisplay.id = 'weather-display';
        document.getElementById('weather-container').appendChild(weatherDisplay);
    }
    
    weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2>Weather for ${location.name}, ${location.country}</h2>
            <div class="temperature">
                <span class="temp-main">${weather.main.temp}°C</span>
                <span class="temp-desc">${weather.weather[0].description}</span>
            </div>
            <div class="weather-details">
                <p><strong>Feels like:</strong> ${weather.main.feels_like}°C</p>
                <p><strong>Humidity:</strong> ${weather.main.humidity}%</p>
                <p><strong>Pressure:</strong> ${weather.main.pressure} hPa</p>
                <p><strong>Wind Speed:</strong> ${weather.wind.speed} m/s</p>
                <p><strong>Lowest Temp:</strong> ${weather.main.temp_min}°C</p>
                <p><strong>Highest Temp:</strong> ${weather.main.temp_max}°C</p>
            </div>
        </div>
    `;
}

function changeBackground(data){
    const { location, weather } = data;

    const temp = weather.main.temp;
    const main = weather.weather[0].main;
    let bgColor = '#87CEEB'; // Default sky blue

    if(temp <= 0){
        bgColor = '#E0F7FA'; // Light icy blue
    }
    else if(temp > 0 && temp <= 15){
        bgColor = '#ADD8E6'; // Light blue
    }
    else if(temp > 15 && temp <= 30){
        bgColor = '#90EE90'; // Light green
    }
    else{
        bgColor = '#FFB6C1'; // Light pink
    }

    document.body.style.backgroundColor = bgColor;
}

// Add event listener for Enter key on input field
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('location');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getWeather();
            }
        });
    }
});
