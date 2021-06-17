import { AxiosError } from 'axios';

interface Props {
  error: AxiosError;
}

const DisplayError = ({ error }: Props): JSX.Element => {
  let errorMessage;
  if (error.response) {
    errorMessage = error.response.data?.message;
  } else {
    errorMessage = error.message;
  }

  errorMessage = errorMessage || 'Something went wrong... Sorry';

  return <>{errorMessage}</>;
};

export default DisplayError;
