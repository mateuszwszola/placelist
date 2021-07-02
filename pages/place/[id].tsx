import * as React from 'react';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { Place, Review, User } from '@prisma/client';
import Layout from 'components/Layout';
import DisplayError from 'components/DisplayError';
import prisma from 'lib/prisma';
import { getPlacesWithStatistics } from 'lib/db';
import type { AxiosError } from 'axios';
import type { ParsedUrlQuery } from 'querystring';
import type { GetStaticPaths, GetStaticProps } from 'next';

export type TReviewWithAuthor = Review & { author: Pick<User, 'name' | 'image'> };

type TParams = ParsedUrlQuery & {
  id: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  // Prerender the first 20 best places
  const places = await getPlacesWithStatistics();

  const paths = places.map((place) => ({
    params: { id: String(place.id) },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params as TParams;

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

const PlacePage = ({ place }: { place: Place }): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;

  const {
    isLoading,
    error,
    data: reviews,
  } = useQuery<TReviewWithAuthor[], AxiosError>(
    ['reviews', { placeId: id }],
    () => {
      return axios
        .get<{ reviews: TReviewWithAuthor[] }>('/api/reviews', {
          params: {
            placeId: id,
          },
        })
        .then((response) => response.data.reviews);
    },
    {
      enabled: !!id,
    }
  );

  const placeFullName = [place.city, place.adminDivision, place.country].filter(Boolean).join(', ');

  return (
    <Layout>
      <Head>
        <title>{placeFullName} - Place List</title>
      </Head>

      <main>
        <div className="pb-8">
          <h1 className="text-2xl ml-4">Place: {placeFullName}</h1>
        </div>
        <div>
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

export default PlacePage;
