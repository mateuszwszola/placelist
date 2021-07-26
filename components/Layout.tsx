import * as React from 'react';
import { signIn, signOut, useSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <nav className={navClassnames}>
        <ul className="py-4 px-4 sm:px-6 max-w-screen-2xl mx-auto w-full flex justify-between items-center space-x-2 sm:space-x-4 font-medium text-base md:text-lg">
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
                <Link href="/profile">Profile</Link>
              </li>
              <li>
                <button
                  data-cy="sign-out-btn"
                  className={`py-2 px-4 border-2 rounded-md font-medium ${
                    isLandingPage ? 'border-white' : 'border-black'
                  }`}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button
                  data-cy="sign-in-btn"
                  className={`py-2 px-4 border-2 rounded-md font-medium ${
                    isLandingPage ? 'border-white' : 'border-black'
                  }`}
                  onClick={() => signIn()}
                >
                  Sign In
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className={`flex-1 ${!isLandingPage ? 'pt-20' : ''}`}>{children}</div>

      <footer className="w-full py-4 border-t border-gray-200 flex justify-center items-center bg-white">
        <span>Powered by</span>
        <div className="flex items-center ml-2">
          <span>
            <Image src="/logo.svg" width={30} height={30} />
          </span>
          <span className="ml-1">Place List</span>
        </div>
      </footer>
    </div>
  );
};

Layout.defaultProps = {
  isLandingPage: false,
};

export default Layout;
