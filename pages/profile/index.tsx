import { Place, Profile, User } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import DisplayError from 'components/DisplayError';
import Layout from 'components/Layout';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import { useQuery } from 'react-query';

type ProfileResponse = {
  profile: User &
    Profile & {
      visitedPlaces: Array<Pick<Place, 'city' | 'country' | 'adminDivision'>>;
    };
};

function ProfilePage(): JSX.Element {
  const [session, loading] = useSession();
  const { data, isLoading, isError, error } = useQuery<ProfileResponse>(
    'profile',
    () => axios.get('/api/profile').then((res) => res.data),
    { enabled: !!session }
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!session?.user) {
    return (
      <Layout>
        <p className="text-center">You are not authenticated</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>My Profile - Place List</title>
      </Head>

      <main className="py-8 px-2 max-w-screen-xl mx-auto">
        <h1 className="text-xl sm:text-3xl">My Profile</h1>

        {isLoading || !data ? (
          <p>Loading...</p>
        ) : isError ? (
          <p className="text-center text-red-500">
            <DisplayError error={error as AxiosError} />
          </p>
        ) : (
          <div>
            <div className="mt-8 flex items-center">
              {data.profile?.image && (
                <img
                  className="rounded-full w-24"
                  src={data.profile.image}
                  alt={`${data.profile?.name || 'User'} avatar`}
                />
              )}
              <h3 className="text-lg sm:text-2xl ml-4">{data.profile?.name || 'User'}</h3>
            </div>
            <div className="mt-6">
              <h4 className="text-lg">Visited Places:</h4>
              {!data.profile.visitedPlaces.length ? (
                <p>Feel free to add your first review</p>
              ) : (
                <ul className="space-y-2">
                  {data.profile.visitedPlaces.map((place, idx) => {
                    const location = [place.city, place.adminDivision, place.country]
                      .filter(Boolean)
                      .join(', ');
                    return <li key={idx}>{location}</li>;
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

export default ProfilePage;
