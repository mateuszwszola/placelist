import * as React from 'react';
import { signIn, signOut, useSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props): JSX.Element => {
  const [session, loading] = useSession();
  const router = useRouter();

  const handleSignOut = async (): Promise<void> => {
    const { url } = await signOut({ redirect: false, callbackUrl: '/' });
    router.replace(url);
  };

  return (
    <>
      <nav className={`w-full absolute z-20${router.pathname === '/' ? ' text-white' : ''}`}>
        <ul className="py-4 px-6 max-w-screen-2xl mx-auto w-full flex justify-between items-center space-x-4">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li className="flex-1" />
          {loading ? (
            <li>Loading...</li>
          ) : session ? (
            <>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
              <li>
                <button onClick={handleSignOut}>Sign Out</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button onClick={() => signIn()}>Sign In</button>
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className={`${router.pathname !== '/' ? 'pt-20' : ''}`}>{children}</div>
    </>
  );
};

export default Layout;
