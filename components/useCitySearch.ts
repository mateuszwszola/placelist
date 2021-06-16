import * as React from 'react';
import axios from 'axios';
import { useThrottle } from 'react-use';

type CitySearchResult = {
  ['_embedded']: {
    ['city:item']: {
      ['full_name']: string;
      ['geoname_id']: number;
    };
  };
};

type CitySearchResponseData = {
  ['_embedded']: {
    ['city:search-results']: CitySearchResult[];
  };
};

type City = {
  fullName: string;
  id: number;
};

export const formatResponseData = (data: CitySearchResponseData): City[] => {
  return data['_embedded']['city:search-results'].map((item: CitySearchResult) => {
    const { full_name, geoname_id } = item['_embedded']['city:item'];
    return {
      fullName: full_name,
      id: geoname_id,
    };
  });
};

export const CITIES_ROOT_API_URL = 'https://api.teleport.org/api/cities';

const cache: { [key: string]: City[] } = {};

export function fetchCities(value: string): Promise<City[]> {
  if (cache[value]) {
    return Promise.resolve(cache[value]);
  }
  return axios
    .get(`${CITIES_ROOT_API_URL}/?search=${value}&embed=city:search-results/city:item&limit=10`)
    .then((res) => {
      const results = formatResponseData(res.data);
      cache[value] = results;
      return results;
    });
}

function useCitySearch(searchTerm: string): City[] {
  const throttledSearchTerm = useThrottle(searchTerm);
  const [cities, setCities] = React.useState<City[]>([]);

  React.useEffect(() => {
    if (throttledSearchTerm.trim() === '') return;

    let isMounted = true;

    fetchCities(throttledSearchTerm.toLowerCase())
      .then((cities) => {
        if (isMounted) setCities(cities);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      isMounted = false;
    };
  }, [throttledSearchTerm]);

  return cities;
}

export default useCitySearch;
