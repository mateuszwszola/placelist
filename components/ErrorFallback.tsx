import { FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error }: FallbackProps): JSX.Element {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export default ErrorFallback;
