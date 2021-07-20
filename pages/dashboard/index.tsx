import '@reach/combobox/styles.css';
import axios from 'axios';
import type { AxiosError } from 'axios';
import Layout from 'components/Layout';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from 'react-query';
import type { ReviewWithAuthor } from 'pages/place/[id]';
import DisplayError from 'components/DisplayError';
import { Place, Review } from '@prisma/client';
import SingleReview from 'components/dashboard/SingleReview';
import useIntersectionObserver from 'utils/useIntersectionObserver';

type ReviewWithAuthorAndPlace = ReviewWithAuthor & {
  place: Pick<Place, 'id' | 'city' | 'adminDivision' | 'country'>;
};

const REVIEWS_PER_PAGE = 20;

const fetchUserReviews = async ({ pageParam = 0 }): Promise<ReviewWithAuthorAndPlace[]> => {
  const skip = pageParam * REVIEWS_PER_PAGE;
  const response = await axios.get<{ reviews: ReviewWithAuthorAndPlace[] }>(
    `/api/reviews/user?offset=${skip}&limit=${REVIEWS_PER_PAGE}`
  );
  return response.data.reviews;
};

const Dashboard = (): React.ReactNode => {
  const [session, loading] = useSession();
  const queryClient = useQueryClient();
  const loadMoreButtonRef = React.useRef<HTMLButtonElement>(null);
  const { data, error, status, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    ['reviews', 'user'],
    fetchUserReviews,
    {
      enabled: !!session,
      getNextPageParam: (lastPage, pages) => {
        const hasNextPageParam = lastPage.length >= REVIEWS_PER_PAGE ? pages.length : false;
        return hasNextPageParam;
      },
    }
  );

  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  const deleteReviewMutation = useMutation<Review, AxiosError, ReviewWithAuthorAndPlace>(
    (review) => axios.delete(`/api/reviews/${review.id}`).then((response) => response.data.review),
    {
      onSuccess: (review) => {
        queryClient.invalidateQueries(['reviews', 'user']);
        queryClient.invalidateQueries(['reviews', { placeId: review.placeId }]);
      },
      onError: () => {
        // On error, reset mutation after 5 seconds
        setTimeout(() => {
          deleteReviewMutation.reset();
        }, 5000);
      },
    }
  );

  const updateReviewMutation = useMutation<Review, AxiosError, Partial<Review>>(
    (review) =>
      axios.put(`/api/reviews/${review.id}`, review).then((response) => response.data.review),
    {
      onSuccess: (review) => {
        queryClient.invalidateQueries(['reviews', 'user']);
        queryClient.invalidateQueries(['reviews', { placeId: review.placeId }]);
      },
      onError: () => {
        // On error, reset mutation after 5 seconds
        setTimeout(() => {
          updateReviewMutation.reset();
        }, 5000);
      },
    }
  );

  const handleReviewDelete = React.useCallback(
    (review: ReviewWithAuthorAndPlace) => () => {
      deleteReviewMutation.mutate(review);
    },
    [deleteReviewMutation]
  );

  const handleReviewSave = React.useCallback(
    (review: Partial<Review>, onSuccess?: () => void) => {
      updateReviewMutation.mutate(review);
      if (onSuccess) onSuccess();
    },
    [updateReviewMutation]
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

  const reviews = data?.pages?.flat() || [];

  return (
    <Layout>
      <Head>
        <title>Dashboard - Place List</title>
      </Head>

      <main className="py-8 px-2 max-w-screen-xl mx-auto">
        <div className="flex justify-between">
          <h1 className="text-2xl">My Reviews</h1>

          <Link href="/dashboard/new-review">
            <a className="py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 active:bg-blue-600">
              New Review
            </a>
          </Link>
        </div>
        <div>
          <div className="text-center text-red-500">
            {deleteReviewMutation.error && <DisplayError error={deleteReviewMutation.error} />}
          </div>

          {status === 'loading' ? (
            <p className="text-center">Loading...</p>
          ) : status === 'error' ? (
            <p className="text-center text-red-500">
              <DisplayError error={error as AxiosError} />
            </p>
          ) : reviews?.length === 0 ? (
            <p className="text-center">No reviews</p>
          ) : (
            <>
              <div className="mt-4 flex flex-col items-center justify-center space-y-4 divide-y-2 divide-gray-100">
                {reviews?.map((review) => {
                  return (
                    <SingleReview
                      key={review.id}
                      review={review}
                      onDelete={handleReviewDelete(review)}
                      onSave={handleReviewSave}
                      isLoading={deleteReviewMutation.isLoading}
                    />
                  );
                })}
              </div>
              <div className="flex justify-center">
                <button
                  ref={loadMoreButtonRef}
                  className={`mt-8 py-2 px-4 border active:border-blue-600 rounded-md hover:text-gray-700 font-semibold ${
                    !isFetchingNextPage && !hasNextPage ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? 'Loading more...'
                    : hasNextPage
                    ? 'Load More'
                    : 'Nothing more to load'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
