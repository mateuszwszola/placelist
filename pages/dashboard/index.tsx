import '@reach/combobox/styles.css';
import axios from 'axios';
import type { AxiosError } from 'axios';
import Layout from 'components/Layout';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import { useQuery } from 'react-query';
import type { TReviewWithAuthor } from 'pages/place/[id]';
import DisplayError from 'components/DisplayError';

const Dashboard = (): React.ReactNode => {
  const [session, loading] = useSession();
  const {
    isLoading,
    error,
    data: reviews,
  } = useQuery<TReviewWithAuthor[], AxiosError>(
    ['reviews', 'user'],
    () => {
      return axios
        .get<{ reviews: TReviewWithAuthor[] }>('/api/reviews/user')
        .then((response) => response.data.reviews);
    },
    {
      enabled: !!session,
    }
  );

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
        <title>Dashboard - Place List</title>
      </Head>

      <main className="max-w-screen-lg mx-auto">
        <div className="mt-4 flex justify-between">
          <h1 className="text-2xl ml-4">Dashboard</h1>

          <Link href="/dashboard/new-review">
            <a className="py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 active:bg-blue-600">
              New Review
            </a>
          </Link>
        </div>
        <div>
          <h2>My Reviews</h2>
          {error && (
            <p>
              <DisplayError error={error} />
            </p>
          )}
          {isLoading ? (
            <p className="text-center">Loading...</p>
          ) : reviews?.length === 0 ? (
            <p className="text-center">No reviews</p>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center space-y-4 divide-y-2 divide-gray-100">
              {reviews?.map((review) => (
                <div className="w-full max-w-xl py-4" key={review.id}>
                  <div className="flex justify-between">
                    <div className="flex space-x-2">
                      {review.author.image && (
                        <img
                          src={review.author.image}
                          className="rounded-full w-8 h-8"
                          alt={`${review.author.name}'s avatar`}
                        />
                      )}
                      <div>
                        <h3 className="text-lg m-0">{review.author.name || 'User'}</h3>
                        <p className="text-xs text-gray-600">
                          {new Date(review.createdAt).toUTCString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 text-sm font-semibold text-gray-700">
                      {review.cost && <p>Cost: {review.cost}/10</p>}
                      {review.safety && <p>Safety: {review.safety}/10</p>}
                      {review.fun && <p>Fun: {review.fun}/10</p>}
                    </div>
                  </div>
                  {review.comment && <p className="mt-4">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
