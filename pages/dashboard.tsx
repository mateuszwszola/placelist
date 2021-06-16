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
import useCitySearch from 'components/useCitySearch';

const AddReview = (): JSX.Element => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [citySearchTerm, setCitySearchTerm] = React.useState('');
  const cities = useCitySearch(citySearchTerm);
  const selectedCityValue = React.useRef('');
  const addReviewMutation = useMutation<Review, AxiosError, Partial<Review>>((newReview) =>
    axios
      .post<{ review: Review }>('/api/reviews', newReview)
      .then((response) => response.data.review)
  );

  const handleCitySearchTermChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setCitySearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    // Find selected city
    const selectedLocation = cities.find(
      (city) => city.fullName.toLowerCase() === selectedCityValue.current.toLowerCase()
    );

    if (selectedLocation) {
      formData.set('locationId', String(selectedLocation.id));
    }

    const values = Object.fromEntries(formData.entries());

    addReviewMutation.mutate(values, {
      onSuccess: (data) => {
        router.push(`/place/${data.placeId}`);
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
            <h4>Choose location</h4>
            <Combobox
              aria-labelledby="Cities"
              onSelect={(value) => {
                selectedCityValue.current = value;
              }}
            >
              <ComboboxInput
                autoComplete="off"
                className="w-80"
                onChange={handleCitySearchTermChange}
                name="location"
                id="location"
                placeholder="Start typing"
              />
              {cities && (
                <ComboboxPopover>
                  {cities.length > 0 ? (
                    <ComboboxList>
                      {cities.map((city) => (
                        <ComboboxOption key={city.id} value={city.fullName} />
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
