import { Review } from '@prisma/client';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useMutation } from 'react-query';
import axios, { AxiosError } from 'axios';
import DisplayError from 'components/DisplayError';
import Layout from 'components/Layout';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox';
import '@reach/combobox/styles.css';
import { useThrottle } from 'react-use';

const CITIES_API_URL = 'https://api.teleport.org/api/cities';

type CitySearchResult = {
  ['matching_full_name']: string;
};

type CitySearchResponseData = {
  ['_embedded']: {
    ['city:search-results']: CitySearchResult[];
  };
};

type City = {
  fullName: string;
};

const formatResponseData = (data: CitySearchResponseData): City[] => {
  return data['_embedded']['city:search-results'].map((item: CitySearchResult) => ({
    fullName: item['matching_full_name'],
  }));
};

const cache: { [key: string]: City[] } = {};

function fetchCities(value: string): Promise<City[]> {
  if (cache[value]) {
    return Promise.resolve(cache[value]);
  }
  return axios.get(`${CITIES_API_URL}/?search=${value}&limit=10`).then((res) => {
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

    fetchCities(throttledSearchTerm.toLowerCase()).then((cities) => {
      if (isMounted) setCities(cities);
    });

    return () => {
      isMounted = false;
    };
  }, [throttledSearchTerm]);

  return cities;
}

const AddReview = (): JSX.Element => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();
  const addReviewMutation = useMutation<Review, AxiosError, Partial<Review>>((newReview) =>
    axios
      .post<Review, { review: Review }>('/api/reviews', newReview)
      .then((response) => response.review)
  );
  const [citySearchTerm, setCitySearchTerm] = React.useState('');
  const cities = useCitySearch(citySearchTerm);

  const handleCitySearchTermChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setCitySearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const values = Object.fromEntries(formData.entries());
    addReviewMutation.mutate(values, {
      onSuccess: () => {
        router.push(`/p/${values.country}/${values.city}`);
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <h2 className="text-xl text-center">Add review</h2>
      {addReviewMutation.error && (
        <div role="alert" className="text-center flex flex-col">
          <p className="text-red-500">
            <DisplayError error={addReviewMutation.error} />
          </p>
        </div>
      )}
      <form ref={formRef} onSubmit={handleSubmit} className="mt-4">
        <fieldset className="flex flex-col" disabled={addReviewMutation.isLoading}>
          <div>
            <h4>City search</h4>
            <Combobox aria-labelledby="Cities">
              <ComboboxInput
                className="w-80"
                onChange={handleCitySearchTermChange}
                name="city"
                id="city"
                placeholder="Type a city"
              />
              {cities && (
                <ComboboxPopover>
                  {cities.length > 0 ? (
                    <ComboboxList>
                      {cities.map((city) => (
                        <ComboboxOption key={city.fullName} value={city.fullName} />
                      ))}
                    </ComboboxList>
                  ) : (
                    <span>No results found</span>
                  )}
                </ComboboxPopover>
              )}
            </Combobox>
          </div>
          <label>
            Cost:
            <input type="range" min={0} max={10} name="cost" id="cost" />
          </label>
          <label>
            Safety:
            <input type="range" min={0} max={10} name="safety" id="safety" />
          </label>
          <label>
            Fun:
            <input type="range" min={0} max={10} name="fun" id="fun" />
          </label>
          <textarea className="border border-gray-400" name="comment" id="comment" />

          <button className="bg-blue-400 text-white px-4 py-2 mt-2" type="submit">
            {addReviewMutation.isLoading ? 'Loading...' : 'Add review'}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

const Dashboard = (): React.ReactNode => {
  const [session, loading] = useSession();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!session?.user) {
    return (
      <Layout>
        <p>You are not authenticated</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl ml-4">Dashboard</h1>

      <AddReview />
    </Layout>
  );
};

export default Dashboard;
