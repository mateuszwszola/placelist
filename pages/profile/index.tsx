import Layout from 'components/Layout';
import { useSession } from 'next-auth/client';
import Head from 'next/head';

function Profile(): JSX.Element {
  const [session, loading] = useSession();

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
        <title>My Profile - Place List</title>
      </Head>

      <main className="py-8 px-2 max-w-screen-xl mx-auto">
        <h1 className="text-xl sm:text-3xl">My Profile</h1>

        <div className="mt-8 flex items-center">
          {session.user.image && (
            <img
              className="rounded-full w-24"
              src={session.user.image}
              alt={`${session.user.name || 'User'} avatar`}
            />
          )}
          <h3 className="text-lg sm:text-2xl ml-4">{session.user.name || 'User'}</h3>
        </div>
      </main>
    </Layout>
  );
}

export default Profile;
