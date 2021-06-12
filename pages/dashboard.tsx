import { Review } from '@prisma/client';
import { signIn, useSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useMutation } from 'react-query';
import axios, { AxiosError } from 'axios';
import DisplayError from 'components/DisplayError';

const AddReview = (): JSX.Element => {
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();
  const addReviewMutation = useMutation<Review, AxiosError, Partial<Review>>((newReview) =>
    axios
      .post<Review, { review: Review }>('/api/reviews', newReview)
      .then((response) => response.review)
  );

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
      <Link href="/">Go to homepage</Link>
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
          <label>
            Country:
            <select name="country" id="country">
              <option value="poland">Poland</option>
              <option value="usa">USA</option>
              <option value="australia">Australia</option>
            </select>
          </label>
          {/* TODO: City will change based on selected country */}
          <label>
            City:
            <select name="city" id="city">
              <option value="warsaw">Warsaw</option>
              <option value="new-york">New York</option>
              <option value="sydney">Sydney</option>
            </select>
          </label>
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
    return signIn();
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <AddReview />
    </div>
  );
};

export default Dashboard;
