import * as React from 'react';
import { Place } from '@prisma/client';
import Link from 'next/link';
import type { ReviewWithAuthor } from 'pages/place/[id]';
import '@reach/combobox/styles.css';

type ReviewWithAuthorAndPlace = ReviewWithAuthor & {
  place: Pick<Place, 'id' | 'city' | 'adminDivision' | 'country'>;
};

interface Props {
  review: ReviewWithAuthorAndPlace;
  onDelete: () => void;
  isLoading: boolean;
}

const SingleReview = ({ review, onDelete, isLoading }: Props): JSX.Element => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus cancel button, every time user clicks delete
  React.useEffect(() => {
    if (cancelButtonRef.current && isDeleting) {
      cancelButtonRef.current.focus();
    }
  }, [cancelButtonRef, isDeleting]);

  const placeFullName = [review.place.city, review.place.adminDivision, review.place.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="w-full max-w-xl">
      <div className="flex justify-end pt-1">
        {isDeleting ? (
          <div className="space-x-2">
            <button
              disabled={isLoading}
              className="text-white bg-red-500 rounded px-2 py-1 font-medium"
              onClick={onDelete}
            >
              {isLoading ? 'Loading...' : 'Are you sure? Delete'}
            </button>
            <button
              ref={cancelButtonRef}
              disabled={isLoading}
              className="border-2 rounded px-2 py-1 font-medium"
              onClick={() => setIsDeleting(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button className="text-gray-500 hover:text-red-500" onClick={() => setIsDeleting(true)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="sr-only">Delete</span>
          </button>
        )}
      </div>

      <div className="py-4 px-2">
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {review.author.image && (
              <img
                src={review.author.image}
                className="rounded-full w-8 h-8"
                alt={`${review.author.name}'s avatar`}
              />
            )}
            <div>
              <h3 className="text-lg m-0">{review.author.name || 'User'}</h3>
              <p className="text-xs text-gray-600">{new Date(review.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex space-x-2 text-sm font-semibold text-gray-700">
            <p>Cost: {review.cost}/10</p>
            <p>Safety: {review.safety}/10</p>
            <p>Fun: {review.fun}/10</p>
          </div>
        </div>
        <Link href={`/place/${review.place.id}`}>
          <a className="text-blue-500 italic text-sm">{placeFullName}</a>
        </Link>

        {review.comment && <p className="mt-4">{review.comment}</p>}
      </div>
    </div>
  );
};

export default SingleReview;
