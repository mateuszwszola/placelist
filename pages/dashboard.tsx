import * as React from 'react';

export default function Dashboard() {
  // const addPlaceMutation = useMutation((newPlace: Place) =>
  //   fetcher('/api/place', { body: newPlace })
  // );

  // const handleSubmit = (e: React.SyntheticEvent) => {
  //   e.preventDefault();
  //   const formData = new FormData(formRef.current);
  //   const values: { city: string; country: string } = Object.fromEntries(formData.entries());
  //   addPlaceMutation.mutate({ ...values });
  // };

  return (
    <div>
      <h1>Dashboard</h1>

      <div>
        <h2>Add review</h2>
        <form onSubmit={() => {}} className="mt-4 flex flex-col">
          <label>
            Country:
            <select name="country" id="country">
              <option value="poland">Poland</option>
              <option value="usa">USA</option>
              <option value="australia">Australia</option>
            </select>
          </label>
          {/* TODO: City will change based on selected country */}
          <label>
            City:
            <select name="city" id="city">
              <option value="warsaw">Warsaw</option>
              <option value="new-york">New York</option>
              <option value="sydney">Sydney</option>
            </select>
          </label>
          <label>
            Cost:
            <input type="range" min={0} max={10} name="cost" id="cost" />
          </label>
          <label>
            Safety:
            <input type="range" min={0} max={10} name="safety" id="safety" />
          </label>
          <label>
            Fun:
            <input type="range" min={0} max={10} name="fun" id="fun" />
          </label>
          <textarea name="comment" id="comment" />

          <button className="bg-blue-400 text-white px-4 py-2 mt-2" type="submit">
            Add review
          </button>
        </form>
      </div>
    </div>
  );
}
