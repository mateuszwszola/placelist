import type { Review, User } from '@prisma/client';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useQuery } from 'react-query';
import Layout from 'components/Layout';
import DisplayError from 'components/DisplayError';

type ReviewWithAuthor = Review & { author: Pick<User, 'name' | 'image'> };

const PlacePage = (): JSX.Element => {
  const router = useRouter();
  const { id } = router.query;

  const {
    isLoading,
    error,
    data: reviews,
  } = useQuery<ReviewWithAuthor[], AxiosError>(
    ['reviews', { placeId: id }],
    () => {
      return axios
        .get<{ reviews: ReviewWithAuthor[] }>('/api/reviews', {
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

  return (
    <Layout>
      <h1 className="text-2xl ml-4">Place Id: {id}</h1>

      <main>
        <div>
          {error && (
            <p>
              <DisplayError error={error} />
            </p>
          )}
          {isLoading ? (
            <p>Loading...</p>
          ) : reviews?.length === 0 ? (
            <p>No reviews</p>
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
