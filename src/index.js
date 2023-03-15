import './css/styles.css';

import debounce from 'lodash.debounce';
import Notiflix from 'notiflix/build/notiflix-notify-aio';
import 'notiflix/dist/notiflix-3.2.6.min.css';

const searchInput = document.querySelector('#search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

const BASE_URL = 'https://restcountries.com/v3.1';
const DEBOUNCE_DELAY = 300;

searchInput.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

const searchParams = new URLSearchParams({
  fields: 'name,capital,population,flags,languages',
});

function fetchCountries(name) {
  return fetch(`${BASE_URL}/name/${name}?${searchParams}`).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
}

function onInput(e) {
  const promiseOfCountries = fetchCountries(e.target.value.trim())
    .then(countries => {
      if (countries.length > 10) {
        crearHTML([countryList, countryInfo]);
        return Notiflix.Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      }
      countries = normalizeCountries(countries);

      if (countries.length > 1 && countries.length <= 10) {
        renderCountries(countries);
      } else if (countries.length === 1) {
        renderCountry(countries);
      }
    })
    .catch(error => {
      crearHTML([countryList, countryInfo]);
      Notiflix.Notify.failure('Oops, there is no country with that name');
    });
}

function normalizeCountries(countries) {
  return countries.map(({ name, capital, population, flags, languages }) => ({
    name: name.official,
    capital,
    population,
    flag: flags.svg,
    languages: Object.values(languages),
  }));
}

function renderCountries(countries) {
  const array = [];
  countries.forEach(country => {
    const item = document.createElement('li');
    const img = document.createElement('img');
    img.src = country.flag;
    img.alt = `Flag of ${country.name}`;
    img.width = 25;
    img.height = 15;

    const span = document.createElement('span');
    span.textContent = country.name;
    if (countries.length === 1) {
      span.style.fontSize = '28px';
    }

    item.append(img, span);
    array.push(item);
  });
  crearHTML([countryList, countryInfo]);
  countryList.append(...array);
}

function renderCountry(countries) {
  renderCountries(countries);
  const country = countries[0];
  array = [];
  for (key of ['Capital', 'Population', 'Languages']) {
    const p = document.createElement('p');
    const span = document.createElement('span');
    span.textContent = `${key}: `;

    if (typeof country[key.toLowerCase()] === 'object') {
      p.textContent = country[key.toLowerCase()].join(', ');
    } else {
      p.textContent = country[key.toLowerCase()];
    }

    p.prepend(span);
    array.push(p);
  }

  countryInfo.append(...array);
}

function crearHTML(HTMLElements) {
  HTMLElements.forEach(elem => (elem.innerHTML = ''));
}
