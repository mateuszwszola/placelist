import * as React from 'react';
import { Place, Review } from '@prisma/client';
import Link from 'next/link';
import type { ReviewWithAuthor } from 'pages/place/[id]';
import '@reach/combobox/styles.css';
import { DeleteIcon, EditIcon } from 'components/Icons';

type ReviewWithAuthorAndPlace = ReviewWithAuthor & {
  place: Pick<Place, 'id' | 'city' | 'adminDivision' | 'country'>;
};

interface Props {
  review: ReviewWithAuthorAndPlace;
  onDelete: () => void;
  onSave: (review: Partial<Review>, onSuccess?: (review?: Review) => void) => void;
  isPendingDelete: boolean;
  isPendingSave: boolean;
}

const SingleReview = ({
  review,
  onDelete,
  onSave,
  isPendingDelete,
  isPendingSave,
}: Props): JSX.Element => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  const editFormRef = React.useRef<HTMLFormElement>(null);

  // Focus cancel button
  React.useEffect(() => {
    if (cancelButtonRef.current && (isDeleting || isEditing)) {
      cancelButtonRef.current.focus();
    }
  }, [cancelButtonRef, isDeleting, isEditing]);

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    if (!editFormRef.current) return;
    const formData = new FormData(editFormRef.current);
    const values = Object.fromEntries(formData.entries());

    const { comment, cost, safety, fun } = values;

    if (
      review.comment === comment &&
      review.cost === Number(cost) &&
      review.safety === Number(safety) &&
      review.fun === Number(fun)
    ) {
      // Review not changed
      return setIsEditing(false);
    }

    onSave(
      {
        id: review.id,
        ...values,
      },
      () => {
        setIsEditing(false);
      }
    );
  };

  const placeFullName = [review.place.city, review.place.adminDivision, review.place.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="w-full max-w-xl">
      <div className="flex justify-end pt-1">
        {!isEditing && !isDeleting && (
          <>
            <button
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600 mr-2 duration-75"
              onClick={() => setIsEditing(true)}
            >
              <EditIcon />
            </button>
            <button
              className="text-gray-500 hover:text-red-500 focus:outline-none focus:text-red-500 duration-75"
              onClick={() => setIsDeleting(true)}
            >
              <DeleteIcon />
            </button>
          </>
        )}

        {isDeleting ? (
          <div className="space-x-2 text-sm">
            <button
              disabled={isPendingDelete}
              className="text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded px-2 py-1 font-medium duration-75"
              onClick={onDelete}
            >
              {isPendingDelete ? 'Loading...' : 'Are you sure? Delete'}
            </button>
            <button
              ref={cancelButtonRef}
              disabled={isPendingDelete}
              className="border rounded px-2 py-1 font-medium border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 duration-75"
              onClick={() => setIsDeleting(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          ''
        )}
      </div>

      {isEditing ? (
        <div>
          <form ref={editFormRef} onSubmit={handleSubmit}>
            <div className="flex justify-end text-sm">
              <button
                type="submit"
                disabled={isPendingSave}
                className="text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded px-2 py-1 font-medium duration-75 mr-2"
              >
                {isPendingSave ? 'Loading...' : 'Save'}
              </button>
              <button
                type="button"
                ref={cancelButtonRef}
                disabled={isPendingSave}
                className="border rounded px-2 py-1 font-medium border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 duration-75"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
            <fieldset className="flex flex-col">
              <legend className="text-xs uppercase font-semibold text-gray-500 mb-1">Stats</legend>
              <label>
                Cost:
                <input
                  type="range"
                  min={0}
                  max={10}
                  name="cost"
                  id="cost"
                  defaultValue={review.cost}
                />
              </label>
              <label>
                Safety:
                <input
                  type="range"
                  min={0}
                  max={10}
                  name="safety"
                  id="safety"
                  defaultValue={review.safety}
                />
              </label>
              <label>
                Fun:
                <input
                  type="range"
                  min={0}
                  max={10}
                  name="fun"
                  id="fun"
                  defaultValue={review.fun}
                />
              </label>
            </fieldset>

            <fieldset className="flex flex-col">
              <legend className="text-xs uppercase font-semibold text-gray-500 mb-1">
                Comment
              </legend>
              <textarea
                defaultValue={review.comment || ''}
                className="p-2 border border-gray-200 rounded-sm"
                name="comment"
                id="comment"
                placeholder="Add a comment"
              />
            </fieldset>
          </form>
        </div>
      ) : (
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
                <p className="text-xs text-gray-600">
                  {new Date(review.createdAt).toLocaleString()}
                </p>
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
      )}
    </div>
  );
};

export default SingleReview;
