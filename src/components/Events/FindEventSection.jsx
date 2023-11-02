import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { fetchEvents } from "../../util/http";
import LoadingIndicator from "../UI/LoadingIndicator";
import { useState } from "react";
import ErrorBlock from "../UI/ErrorBlock";
import EventItem from "./EventItem";

export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", { searchTerm: searchTerm }],
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    enabled: searchTerm !== undefined,
  });
  // isPending doesn't work here because we don't have the the data when query is disabled so it query waits until
  // query is enabled and data is available until that it shows loading spinner. In this case we use isLoading that
  // loads the spinner until we response from server.
  // By constructing a query key dynamically, React Query can cache (and reuse) different
  // data for different keys based on same Query.

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term to find events</p>;

  if (isLoading) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title='An error occurred'
        message={error.info?.message || "Failed to fetch events"}
      />
    );
  }

  if (data) {
    content = (
      <ul className='events-list'>
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section
      className='content-section'
      id='all-events-section'
    >
      <header>
        <h2>Find your next event!</h2>
        <form
          onSubmit={handleSubmit}
          id='search-form'
        >
          <input
            type='search'
            placeholder='Search events'
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
