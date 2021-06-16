import { Place } from '.prisma/client';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useQuery } from 'react-query';
import { signIn, useSession } from 'next-auth/client';
import { useErrorHandler } from 'react-error-boundary';
import axios from 'axios';
import Layout from 'components/Layout';

const Home = (): JSX.Element => {
  const [session, loading] = useSession();
  const {
    isLoading,
    error,
    data: places,
  } = useQuery<Place[], Error>('places', () =>
    axios.get('/api/places').then((response) => response.data.places)
  );
  useErrorHandler(error);

  return (
    <Layout>
      <div className="min-h-screen px-2 flex flex-col justify-center align-center h-screen">
        <Head>
          <title>Place List - Best places to take a trip</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="py-20 flex-1 flex flex-col justify-center items-center">
          <h1 className="text-6xl">
            <span role="img" aria-label="World emoji">
              🌍
            </span>{' '}
            Take a trip
          </h1>
          <p className="text-2xl mt-2">Find the best places to visit around the world</p>
          {loading ? (
            <p>Loading...</p>
          ) : !session ? (
            <>
              <button
                className="py-2 px-4 bg-blue-500 text-white rounded-lg mt-6 uppercase tracking-wider font-medium hover:bg-blue-600 active:bg-blue-600"
                onClick={() => signIn()}
              >
                Join Placelist
              </button>
            </>
          ) : null}

          <div className="flex items-center justify-center flex-wrap mt-8 max-w-xl mx-auto">
            {isLoading ? (
              <p>Loading...</p>
            ) : places?.length === 0 ? (
              <p>No places found</p>
            ) : (
              <>
                {places?.map((place) => (
                  <Link key={place.id} href={`/place/${place.id}`}>
                    <a className="m-2 p-4 text-left no-underline border border-blue-100 rounded-lg w-1/2">
                      <h2>{place.city}</h2>
                      <p>{place.country}</p>
                    </a>
                  </Link>
                ))}
              </>
            )}
          </div>
        </main>

        <footer className="w-full py-4 border-t border-gray-200 flex justify-center align-center">
          <a href="#" className="flex items-center">
            Powered by{' '}
            <span className="ml-2">
              <Image src="/logo.svg" width={36} height={36} />
            </span>
          </a>
        </footer>
      </div>
    </Layout>
  );
};

export default Home;
