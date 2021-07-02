import { AxiosError } from 'axios';
import Alert from '@reach/alert';

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

  return <Alert>{errorMessage}</Alert>;
};

export default DisplayError;
