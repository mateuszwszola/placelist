import Layout from 'components/Layout';
import Head from 'next/head';

function Profile(): JSX.Element {
  return (
    <Layout>
      <Head>
        <title>My Profile - Place List</title>
      </Head>

      <main className="py-8 px-2 max-w-screen-xl mx-auto">
        <h1 className="text-2xl">My Profile</h1>
      </main>
    </Layout>
  );
}

export default Profile;
