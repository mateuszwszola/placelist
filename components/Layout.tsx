import * as React from 'react';
import { signIn, signOut, useSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {
  children: React.ReactNode;
  isLandingPage: boolean;
}

const Layout = ({ children, isLandingPage }: Props): JSX.Element => {
  const [session, loading] = useSession();
  const router = useRouter();

  const handleSignOut = async (): Promise<void> => {
    const { url } = await signOut({ redirect: false, callbackUrl: '/' });
    router.replace(url);
  };

  let navClassnames = 'w-full absolute z-50';

  if (isLandingPage) {
    navClassnames += ' text-white';
  }

  return (
    <>
      <nav className={navClassnames}>
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
      <div className={`${!isLandingPage ? 'pt-20' : ''}`}>{children}</div>
    </>
  );
};

Layout.defaultProps = {
  isLandingPage: false,
};

export default Layout;
