import type { NextApiRequest } from 'next';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/client';
import { ErrorHandler } from 'utils/error';

export async function requireUserSession(
  req: NextApiRequest,
  next: (session: Session) => void
): Promise<void> {
  const session = await getSession({ req });
  if (!session?.user) {
    throw new ErrorHandler(401, 'You are not authenticated');
  }
  return next(session);
}
