import { Review } from '@prisma/client';
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@reach/combobox';
import '@reach/combobox/styles.css';
import axios, { AxiosError } from 'axios';
import DisplayError from 'components/DisplayError';
import Layout from 'components/Layout';
import useCitySearch from 'components/useCitySearch';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useMutation } from 'react-query';
import Link from 'next/link';

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
    <div className="max-w-xl mx-auto">
      {addReviewMutation.error && (
        <div role="alert" className="text-center flex flex-col">
          <p className="text-red-500">
            <DisplayError error={addReviewMutation.error} />
          </p>
        </div>
      )}
      <form ref={formRef} onSubmit={handleSubmit} className="mt-4">
        <fieldset className="flex flex-col space-y-4" disabled={addReviewMutation.isLoading}>
          <div>
            <h4 className="text-xs uppercase font-semibold text-gray-500 mb-1">Choose location</h4>
            <Combobox
              aria-labelledby="Cities"
              onSelect={(value) => {
                selectedCityValue.current = value;
              }}
            >
              <ComboboxInput
                required
                autoComplete="off"
                className="w-full border border-gray-200 px-2 py-1 rounded-sm"
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
          <fieldset className="flex flex-col">
            <legend className="text-xs uppercase font-semibold text-gray-500 mb-1">Stats</legend>
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
          </fieldset>

          <fieldset className="flex flex-col">
            <legend className="text-xs uppercase font-semibold text-gray-500 mb-1">Comment</legend>
            <textarea
              className="p-2 border border-gray-200 rounded-sm"
              name="comment"
              id="comment"
              placeholder="Add a comment"
            />
          </fieldset>

          <button className="bg-blue-400 text-white px-4 py-2 mt-2 rounded-sm" type="submit">
            {addReviewMutation.isLoading ? 'Loading...' : 'Add review'}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

const NewReview = (): React.ReactNode => {
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
      <Head>
        <title>New Review - Place List</title>
      </Head>

      <div className="flex justify-between max-w-screen-lg mx-auto">
        <h1 className="text-2xl ml-4">New Review</h1>

        <Link href="/dashboard">
          <a className="py-2 px-4 border-2 border-blue-500 rounded-lg font-medium hover:bg-blue-500 hover:text-white active:border-blue-600">
            Cancel
          </a>
        </Link>
      </div>

      <AddReview />
    </Layout>
  );
};

export default NewReview;
