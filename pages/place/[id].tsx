import * as React from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useInfiniteQuery } from 'react-query';
import { Place, Review, User } from '@prisma/client';
import Layout from 'components/Layout';
import DisplayError from 'components/DisplayError';
import prisma from 'lib/prisma';
import { getPlacesWithStatistics } from 'lib/db';
import type { AxiosError } from 'axios';
import type { ParsedUrlQuery } from 'querystring';
import type { GetStaticPaths, GetStaticProps } from 'next';
import useIntersectionObserver from 'utils/useIntersectionObserver';

export type ReviewWithAuthor = Review & { author: Pick<User, 'name' | 'image'> };

export const getStaticPaths: GetStaticPaths = async () => {
  // Prerender the first 20 best places
  const places = await getPlacesWithStatistics();

  const paths = places.map((place) => ({
    params: { id: String(place.id) },
  }));

  return { paths, fallback: 'blocking' };
};

type Params = ParsedUrlQuery & {
  id: string;
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as Params;

  const place = await prisma.place.findUnique({
    where: { id: Number(id) },
  });

  if (!place) {
    return {
      notFound: true,
    };
  }

  return {
    props: { place },
  };
};

const REVIEWS_PER_PAGE = 20;

const PlacePage = ({ place }: { place: Place }): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;
  const loadMoreButtonRef = React.useRef<HTMLButtonElement>(null);
  const { data, status, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
    ReviewWithAuthor[],
    AxiosError
  >(
    ['reviews', { placeId: id }],
    async ({ pageParam = 0 }) => {
      const response = await axios.get<{ reviews: ReviewWithAuthor[] }>('/api/reviews', {
        params: {
          placeId: id,
          offset: pageParam * REVIEWS_PER_PAGE,
          limit: REVIEWS_PER_PAGE,
        },
      });
      return response.data.reviews;
    },
    {
      enabled: !!id,
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length >= REVIEWS_PER_PAGE ? pages.length : undefined;
      },
    }
  );

  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  const placeFullName = [place.city, place.adminDivision, place.country].filter(Boolean).join(', ');

  const reviews = data?.pages?.flat() || [];

  return (
    <Layout>
      <Head>
        <title>{placeFullName} - Place List</title>
      </Head>

      <main className="py-8 px-2 max-w-screen-xl mx-auto">
        <h1 className="text-xl sm:text-3xl">Place: {placeFullName}</h1>

        <div>
          {status === 'loading' ? (
            <p className="text-center">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">
              <DisplayError error={error} />
            </p>
          ) : reviews?.length === 0 ? (
            <p className="text-center">No reviews</p>
          ) : (
            <>
              <div className="mt-8 flex flex-col items-center justify-center space-y-4 divide-y-2 divide-gray-100">
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
                        <p>Cost: {review.cost}/10</p>
                        <p>Safety: {review.safety}/10</p>
                        <p>Fun: {review.fun}/10</p>
                      </div>
                    </div>
                    {review.comment && <p className="mt-4">{review.comment}</p>}
                  </div>
                ))}
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

export default PlacePage;
