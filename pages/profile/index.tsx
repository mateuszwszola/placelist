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
        <h1 className="text-2xl">My Profile</h1>

        <div>
          <h3>{session.user.name || 'User'}</h3>
          {session.user.image && (
            <img src={session.user.image} alt={`${session.user.name || 'User'} avatar`} />
          )}
        </div>
      </main>
    </Layout>
  );
}

export default Profile;
