import '@reach/combobox/styles.css';
import axios from 'axios';
import type { AxiosError } from 'axios';
import Layout from 'components/Layout';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import type { TReviewWithAuthor } from 'pages/place/[id]';
import DisplayError from 'components/DisplayError';
import { Place, Review } from '@prisma/client';

type TReviewWithAuthorAndPlace = TReviewWithAuthor & {
  place: Pick<Place, 'id' | 'city' | 'adminDivision' | 'country'>;
};

interface ISingleReviewProps {
  review: TReviewWithAuthorAndPlace;
  onDelete: () => void;
  isLoading: boolean;
}

const SingleReview = ({ review, onDelete, isLoading }: ISingleReviewProps): JSX.Element => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus cancel button, every time user clicks delete
  React.useEffect(() => {
    if (cancelButtonRef.current && isDeleting) {
      cancelButtonRef.current.focus();
    }
  }, [cancelButtonRef, isDeleting]);

  const placeFullName = [review.place.city, review.place.adminDivision, review.place.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="w-full max-w-xl">
      <div className="flex justify-end pt-1">
        {isDeleting ? (
          <div className="space-x-2">
            <button
              disabled={isLoading}
              className="text-white bg-red-500 rounded px-2 py-1 font-medium"
              onClick={onDelete}
            >
              {isLoading ? 'Loading...' : 'Are you sure? Delete'}
            </button>
            <button
              ref={cancelButtonRef}
              disabled={isLoading}
              className="border-2 rounded px-2 py-1 font-medium"
              onClick={() => setIsDeleting(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button className="text-gray-500 hover:text-red-500" onClick={() => setIsDeleting(true)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="sr-only">Delete</span>
          </button>
        )}
      </div>

      <div className="py-4 px-2">
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
              <p className="text-xs text-gray-600">{new Date(review.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex space-x-2 text-sm font-semibold text-gray-700">
            {review.cost && <p>Cost: {review.cost}/10</p>}
            {review.safety && <p>Safety: {review.safety}/10</p>}
            {review.fun && <p>Fun: {review.fun}/10</p>}
          </div>
        </div>
        <Link href={`/place/${review.place.id}`}>
          <a className="text-blue-500 italic text-sm">{placeFullName}</a>
        </Link>

        {review.comment && <p className="mt-4">{review.comment}</p>}
      </div>
    </div>
  );
};

const Dashboard = (): React.ReactNode => {
  const [session, loading] = useSession();
  const queryClient = useQueryClient();
  const {
    isLoading,
    error,
    data: reviews,
  } = useQuery<TReviewWithAuthorAndPlace[], AxiosError>(
    ['reviews', 'user'],
    () => {
      return axios
        .get<{ reviews: TReviewWithAuthorAndPlace[] }>('/api/reviews/user')
        .then((response) => response.data.reviews);
    },
    {
      enabled: !!session,
    }
  );
  const deleteReviewMutation = useMutation<Review, AxiosError, number>(
    (reviewId) => axios.delete(`/api/reviews/${reviewId}`).then((response) => response.data.review),
    {
      onSuccess: (reviewId) => {
        queryClient.invalidateQueries(['reviews', 'user']);
        queryClient.invalidateQueries(['reviews', { placeId: reviewId }]);
      },
      onError: () => {
        // On error, reset mutation after 5 seconds
        setTimeout(() => {
          deleteReviewMutation.reset();
        }, 5000);
      },
    }
  );

  const handleReviewDelete = React.useCallback(
    (reviewId: number) => () => {
      deleteReviewMutation.mutate(reviewId);
    },
    [deleteReviewMutation]
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

          <div className="text-center text-red-500">
            {deleteReviewMutation.error && <DisplayError error={deleteReviewMutation.error} />}
            {error && <DisplayError error={error} />}
          </div>

          {isLoading ? (
            <p className="text-center">Loading...</p>
          ) : reviews?.length === 0 ? (
            <p className="text-center">No reviews</p>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center space-y-4 divide-y-2 divide-gray-100">
              {reviews?.map((review) => {
                return (
                  <SingleReview
                    key={review.id}
                    review={review}
                    onDelete={handleReviewDelete(review.id)}
                    isLoading={deleteReviewMutation.isLoading}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
