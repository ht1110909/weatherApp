const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3000;
require ('dotenv').config();

const apiKey = process.env.WEATHER_API_KEY;

const server = http.createServer(async (req, res) => {
    // Handle API routes
    if (req.url.startsWith('/api/weather') && req.method === 'GET') {
        const url = new URL(req.url, `http://localhost:${port}`);
        const countryCode = url.searchParams.get('countryCode');
        const cityName = url.searchParams.get('cityName');
        const stateCode = url.searchParams.get('stateCode') || '';
        
        try {
            if (!countryCode) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Country code is required'}));
                return;
            }

            if(!cityName){
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'City name is required'}));
                return;
            }
            
            // Get location data
            const locationData = await fetchLatitude(countryCode, cityName, stateCode, 1);
            
            if (!locationData || locationData.length === 0) {
                res.writeHead(404, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Location not found'}));
                return;
            }
            
            // Get weather data
            const { lat, lon } = locationData[0];
            const weatherData = await fetchWeatherData(lat, lon);
            
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                location: locationData[0],
                weather: weatherData
            }));
            
        } catch (error) {
            console.error('API Error:', error);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Internal server error'}));
        }
        return;
    }
    
    // Handle static files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if(err.code == 'ENOENT') {
                fs.readFile('./404.html', (err, data) => {
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(data, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Sorry, check with the site admin for error: ${err.code} ..\n`);
            }
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(data, 'utf-8');
        }
    });
});

const fetchLatitude = async (countryCode, cityName, stateCode = '', limit = 1) => {
    // Validate required parameters
    if (!countryCode) {
        throw new Error('Country code is required');
    }
    if(!cityName){
        throw new Error ('City name is required');
    }
    if (!apiKey) {
        throw new Error('API key is required');
    }

    // Build the query string
    let query = '';
    query += cityName;
    
    if (stateCode) {
        query += `,${stateCode}`;
    }
    query += `,${countryCode}`;

    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${apiKey}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching latitude data:', error);
        throw error;
    }
};

/* const testFetchLatitude = async () => {
    try { 
        const data = await fetchLatitude('US', 'New York', '', 1);
        console.log('Test fetchLatitude result:', data);
    }
    catch (error) {
        console.error('Test fetchLatitude error:', error);
    }
};

testFetchLatitude(); */

const fetchWeatherData = async (lat, lon, exclude = '') => {
    // Validate required parameters
    if (lat === undefined || lat === null) {
        throw new Error('Latitude is required');
    }
    if (lon === undefined || lon === null) {
        throw new Error('Longitude is required');
    }
    if (!apiKey) {
        throw new Error('API key is required');
    }

    try {
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        if (exclude) {
            url += `&exclude=${exclude}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

server.listen(port, (error) => {
    if (error) {
        return console.log('Error occurred:', error);
    } else{
        console.log(`Server is running on http://localhost:${port}`);
    }
});