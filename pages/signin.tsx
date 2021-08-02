import type { ClientSafeProvider } from 'next-auth/client';
import { getProviders, signIn } from 'next-auth/client';
import type { GetServerSideProps } from 'next';

type SignInProps = { providers: ClientSafeProvider[] };

function SignIn({ providers }: SignInProps): JSX.Element {
  // TODO: Add login with credentials in testing

  return (
    <div>
      <h1>Sign In</h1>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id)}>Sign in with {provider.name}</button>
        </div>
      ))}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};

export default SignIn;
