import { Review } from '@prisma/client';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import * as React from 'react';
import { useQuery } from 'react-query';

const PlacePage = (): JSX.Element => {
  const router = useRouter();
  const { country, city } = router.query;

  const { data: reviews } = useQuery<Review[]>(['reviews', { country, city }], () => {
    return axios
      .get<{ reviews: Review[] }>('/api/reviews', {
        params: {
          country,
          city,
        },
      })
      .then((response) => response.data.reviews);
  });

  console.log({ reviews });

  return (
    <div>
      <Link href="/">Homepage</Link>
      <h1>Place</h1>
      <p>Country: {country}</p>
      <p>City: {city}</p>
    </div>
  );
};

export default PlacePage;
