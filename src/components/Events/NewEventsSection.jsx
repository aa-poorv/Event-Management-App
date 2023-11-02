import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { max: 3 }],
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    // here when we pass queryFn to directly than query passes an object into the fetchEvents function that contains information related to the event.
    // Whereas in FindEventsSection we have a anonymous function that call fetchEvents function so useQuery only pass to initial anonymous function and in called one we can pass what we want.
    staleTime: 5000, // until what time from last fetch request you cannot refetch same request again by default it is 0.
    // gcTime: 5000, // It is time until which fetched data is stored in cache. after that data is flushed and on rerender we need to resend
    // the fetch request
  });

  let content;

  if (isPending) {
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
      id='new-events-section'
    >
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
