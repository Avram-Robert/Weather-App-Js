document.addEventListener("DOMContentLoaded", (_event) => {
    alert("After DOM has loaded");

    const rootDiv = document.getElementById('root');

    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'buttons-container';

    rootDiv.appendChild(buttonsContainer);

    const label = document.createElement('label');
    label.setAttribute('for', 'cities');
    label.textContent = 'Select a city';

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('id', 'cities');

    buttonsContainer.appendChild(label);
    buttonsContainer.appendChild(input);

    const spinnerDiv = document.createElement('div');

    spinnerDiv.id = 'spinner';

    spinnerDiv.setAttribute('hidden', '');

    rootDiv.appendChild(spinnerDiv);

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit City';
    submitButton.addEventListener('click', () => {
        loadData();
        setTimeout(function () {
            console.log("World");
        }, 500);
        fetchPexelsImage(input.value);
        submitCity();
        addFavoritesUI();

        console.log("Before setting isSubmitClicked:", isSubmitClicked);
        isSubmitClicked = true;
        console.log("After setting isSubmitClicked:", isSubmitClicked);
    });

    buttonsContainer.appendChild(submitButton);

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Forecast';
    toggleButton.addEventListener('click', toggleForecast);

    buttonsContainer.appendChild(toggleButton);

    const weatherDiv = document.createElement('div');
    weatherDiv.classList.add('weather-container');
    rootDiv.appendChild(weatherDiv);

    const favoriteCitiesSelect = document.createElement('select');
    favoriteCitiesSelect.id = 'favorite-cities-select';

    buttonsContainer.appendChild(favoriteCitiesSelect);

    const addToFavoritesButton = document.createElement('button');
    addToFavoritesButton.textContent = 'Add to Favorites';
    addToFavoritesButton.id = 'favorite-cities-button';

    buttonsContainer.appendChild(addToFavoritesButton);

    const heartIcon = document.createElement('span');
    heartIcon.id = 'heart-icon';

    rootDiv.appendChild(heartIcon);

    addToFavoritesButton.addEventListener('click', addToFavoritesClickHandler);

    let isOneDayView = true;

    function submitCity() {

        fetchTodayWeather();
    }

    function toggleForecast() {

        loadData();
        setTimeout(function () {
            console.log("World");
        }, 500);
        isOneDayView = !isOneDayView;
        if (isOneDayView) {
            fetchTodayWeather();
        } else {
            fetchFiveDayForecast();
        }
    }

    function fetchTodayWeather() {
        fetchWeatherData();
    }

    function fetchFiveDayForecast() {
        const apiKey = 'd53ae344f9b440a296a142059241801';
        const cityName = input.value;

        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=5`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);

                weatherDiv.innerHTML = '';

                for (let day of data.forecast.forecastday) {
                    const dayDiv = document.createElement('div');
                    dayDiv.classList.add('forecast-day');
                    dayDiv.innerHTML = `
                    <h2>${day.date}</h2>
                    <p>Temperature: ${day.day.avgtemp_c} °C</p>
                    <p>Condition: ${day.day.condition.text}</p>
                    <img src="${day.day.condition.icon}" alt="Weather Icon">
                    <!-- Add more forecast information as needed -->
                `;
                    weatherDiv.appendChild(dayDiv);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function fetchWeatherData() {
        const apiKey = 'd53ae344f9b440a296a142059241801';
        const cityName = input.value;

        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);

                weatherDiv.innerHTML = '';

                const todayDiv = document.createElement('div');
                todayDiv.innerHTML = `
                <h2>${data.location.name}, ${data.location.country}</h2>
                <p>Temperature: ${data.current.temp_c} °C</p>
                <p>Condition: ${data.current.condition.text}</p>
                <img src="${data.current.condition.icon}" alt="Weather Icon">
                <!-- Add more weather information as needed -->
            `;

                weatherDiv.appendChild(todayDiv);
            })
            .catch(error => console.error('Error:', error));
    }

    applyAutocomplete();

    function applyAutocomplete() {
        const citiesInput = document.getElementById('cities');
        const datalist = document.getElementById('cities-data');

        if (datalist) {
            datalist.remove();
        }

        const newDatalist = document.createElement('datalist');
        newDatalist.id = 'cities-data';
        citiesInput.setAttribute('list', newDatalist.id);

        citiesInput.after(newDatalist);

        fetchSuggestions();
    }

    function fetchSuggestions() {
        const inputValue = input.value;
        fetchData(`https://api.geoapify.com/v1/geocode/autocomplete?text=${inputValue}&apiKey=acae159080544b8e8e59509c1144fc0c`);
    }

    function fetchData(url) {
        var requestOptions = {
            method: 'GET',
        };

        fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                console.log(result);

                if (result.features) {
                    const cityNames = result.features.map(feature => feature.properties.formatted);
                    renderDatalist(cityNames);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function renderDatalist(cityNames) {
        let datalist = document.getElementById('cities-data');

        let fragment = document.createDocumentFragment();

        for (let cityName of cityNames) {
            let option = document.createElement('option');
            option.value = cityName;
            fragment.appendChild(option);
        }

        datalist.appendChild(fragment);
    }

    addToFavoritesButton.addEventListener('click', addToFavoritesClickHandler);

    function addToFavoritesClickHandler(event) {
        event.preventDefault();

        const cityName = input.value;
        toggleFavorite(cityName);
        updateHeartButton(cityName);
        updateFavoriteCitiesSelect();
    }

    favoriteCitiesSelect.addEventListener('change', function() {
        const selectedCity = this.value;
        fetchWeatherForSelectedCity(selectedCity);
    });

    function fetchWeatherForSelectedCity(selectedCity) {
        fetchPexelsImage(selectedCity);
    
        if (isOneDayView) {
            fetchTodayWeatherForCity(selectedCity);
        } else {
            fetchFiveDayForecastForCity(selectedCity);
        }
    }

    function fetchTodayWeatherForCity(cityName) {
        const apiKey = 'd53ae344f9b440a296a142059241801';
    
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}`;
    
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);

                weatherDiv.innerHTML = '';

                const todayDiv = document.createElement('div');
                todayDiv.innerHTML = `
                    <h2>${data.location.name}, ${data.location.country}</h2>
                    <p>Temperature: ${data.current.temp_c} °C</p>
                    <p>Condition: ${data.current.condition.text}</p>
                    <img src="${data.current.condition.icon}" alt="Weather Icon">
                    <!-- Add more weather information as needed -->
                `;
    
                weatherDiv.appendChild(todayDiv);
            })
            .catch(error => console.error('Error:', error));
    }

    function fetchFiveDayForecastForCity(cityName) {
        const apiKey = 'd53ae344f9b440a296a142059241801';
    
        const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=5`;
    
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);

                weatherDiv.innerHTML = '';

                for (let day of data.forecast.forecastday) {
                    const dayDiv = document.createElement('div');
                    dayDiv.classList.add('forecast-day');
                    dayDiv.innerHTML = `
                        <h2>${day.date}</h2>
                        <p>Temperature: ${day.day.avgtemp_c} °C</p>
                        <p>Condition: ${day.day.condition.text}</p>
                        <img src="${day.day.condition.icon}" alt="Weather Icon">
                        <!-- Add more forecast information as needed -->
                    `;
                    weatherDiv.appendChild(dayDiv);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    input.addEventListener('input', () => {
        applyAutocomplete();
    });

    const favoriteCitiesList = document.createElement('ul');
    favoriteCitiesList.id = 'favorite-cities-list';
    rootDiv.appendChild(favoriteCitiesList);

    function loadData() {
        console.log('loadData function called');
        spinnerDiv.removeAttribute('hidden');
        console.log('Spinner shown');

        fetch('https://www.mocky.io/v2/5185415ba171ea3a00704eed?mocky-delay=500ms')
            .then(response => response.json())
            .then(data => {
                spinnerDiv.setAttribute('hidden', '');
                console.log('Spinner hidden');
                console.log(data);
            })
            .catch(error => {
                spinnerDiv.setAttribute('hidden', '');
                console.error('Error:', error);
            });
    }

    const apiBackground = 'XQy4sB2Ww0SQBfDusDjGqaap7H7AJZvJ7IJaxgM9D4e9oN5oUymsqm27';

    function fetchPexelsImage(cityName) {
        const apiUrl = `https://api.pexels.com/v1/search?query=${cityName}&per_page=1`;

        fetch(apiUrl, {
            headers: {
                'Authorization': apiBackground,
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const imageUrl = data.photos[0].src.original;
                applyBackgroundImage(imageUrl);
            })
            .catch(error => console.error('Error fetching Pexels image:', error));
    }

    function applyBackgroundImage(imageUrl) {
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundPosition = 'center center';
    }

    function toggleFavorite(cityName) {
        const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];

        const index = favoriteCities.indexOf(cityName);
        if (index === -1) {
            favoriteCities.push(cityName);
        } else {
            favoriteCities.splice(index, 1);
        }
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));

        updateFavoriteCitiesList();
        updateHeartButton(cityName);
    }

    function updateFavoriteCitiesList() {
        const favoriteCitiesList = document.getElementById('favorite-cities-list');
        favoriteCitiesList.innerHTML = '';
    
        const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
        favoriteCities.forEach(cityName => {
            const listItem = document.createElement('li');
            listItem.textContent = cityName;

            const heartButton = document.createElement('button');
            heartButton.textContent = '❤️';
            heartButton.addEventListener('click', () => {
                toggleFavorite(cityName);
            });
    
            listItem.appendChild(heartButton);
            favoriteCitiesList.appendChild(listItem);
        });
    }
    

    async function updateFavoriteCitiesSelect() {
        const favoriteCitiesSelect = document.getElementById('favorite-cities-select');
        favoriteCitiesSelect.innerHTML = '';
    
        const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];

        favoriteCities.forEach(cityName => {
            const option = document.createElement('option');
            option.value = cityName;
            option.textContent = cityName;
            favoriteCitiesSelect.appendChild(option);
        });
    }

    async function updateHeartButton(cityName) {
        const datalist = document.getElementById('cities-data');
        const options = datalist.getElementsByTagName('option');
    
        for (let option of options) {
            if (option.value === cityName) {
                const heartIcon = document.getElementById('heart-icon');
                if (heartIcon) {
                    const isFavorite = (JSON.parse(localStorage.getItem('favoriteCities')) || []).includes(cityName);
                    heartIcon.textContent = isFavorite ? '❤️' : '';
                    heartIcon.style.color = isFavorite ? 'red' : '';
                }
                break;
            }
        }
    }

    updateFavoriteCitiesList();
    updateFavoriteCitiesSelect();
    updateHeartButton(input.value);

    const cityName = 'Nature';
    fetchPexelsImage(cityName);
});
