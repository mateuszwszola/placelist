import '@reach/combobox/styles.css';
import Layout from 'components/Layout';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';

const Dashboard = (): React.ReactNode => {
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
        <title>Dashboard - Place List</title>
      </Head>

      <main className="max-w-screen-lg mx-auto">
        <div className="flex justify-between">
          <h1 className="text-2xl ml-4">Dashboard</h1>

          <Link href="/dashboard/new-review">
            <a className="py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 active:bg-blue-600">
              New Review
            </a>
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default Dashboard;
