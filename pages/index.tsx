import Head from 'next/head';
import type { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { signIn, useSession } from 'next-auth/client';
import Layout from 'components/Layout';
import { getPlacesWithStatistics } from 'lib/db';
import type { TPlacesWithStats } from 'lib/db';

export const getStaticProps: GetStaticProps = async () => {
  const places = await getPlacesWithStatistics();

  return {
    props: { places },
    revalidate: 1,
  };
};

interface IProps {
  places: TPlacesWithStats[];
}

const Home = ({ places }: IProps): JSX.Element => {
  const [session, loading] = useSession();
  // TODO: React Query: Initial data from static props + infinite scroll

  return (
    <Layout isLandingPage={true}>
      <Head>
        <title>Place List - Best places to take a trip</title>
        <meta name="description" content="Find best places for your next trip" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* HERO */}
        <section className="w-full h-96 relative">
          {/* IMAGE */}
          <Image
            src="https://res.cloudinary.com/dtti654qn/image/upload/v1625261109/placelist/mountains-and-water_pgctpl.jpg"
            layout="fill"
            className="absolute inset-0 object-cover"
          />
          {/* CONTENT */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-2">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-white text-center">
                <span role="img" aria-label="World emoji">
                  🌍
                </span>{' '}
                Take a trip
              </h1>
              <p className="text-2xl mt-4 text-white">
                Find the best places to visit around the world
              </p>
            </div>
            <div>
              {!loading && !session && (
                <>
                  <button
                    className="py-2 px-4 bg-blue-500 uppercase tracking-wider text-white rounded-lg mt-6 font-medium hover:bg-blue-600 active:bg-blue-600"
                    onClick={() => signIn()}
                  >
                    Join Placelist
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <main className="py-16 px-2 flex-1 flex flex-col">
          <h2 className="text-3xl text-center">Popular places</h2>
          <div className="mt-4 w-full text-center">
            {places?.length === 0 ? (
              <p>There are no places. Be the first one to add!</p>
            ) : (
              <div className="flex flex-wrap justify-center items-center">
                {places?.map((place) => (
                  <Link key={place.id} href={`/place/${place.id}`}>
                    <a className="m-2 w-full max-w-xs p-4 text-left no-underline border border-blue-100 rounded-lg">
                      <div>
                        <div className="text-center">
                          <h3 className="text-xl">{place.city}</h3>
                          <h4 className="text-lg">{place.country}</h4>
                        </div>
                        <div className="mt-4 space-y-1">
                          <p>
                            <span role="img" aria-label="bill emoji">
                              💸
                            </span>{' '}
                            Cost {place.averageCost}/10
                          </p>
                          <p>
                            <span role="img" aria-label="helmet emoji">
                              ⛑
                            </span>{' '}
                            Safety {place.averageSafety}/10
                          </p>
                          <p>
                            <span role="img" aria-label="fun emoji">
                              🤪
                            </span>{' '}
                            Fun {place.averageFun}/10
                          </p>
                        </div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
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
