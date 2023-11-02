import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { editEvent, fetchEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { mutate } = useMutation({
    mutationFn: editEvent,
    onMutate: async (data) => {
      // It runs just after the mutate function is called inside handleSubmit()
      // Here we are changing query cached data by queryClient and not waiting for response to come.
      // React Query passes the same data to onMutate that is passed to mutate function.
      const newEvent = data.event;

      await queryClient.cancelQueries({ queryKey: ["events", id] });
      // This will block query requests for this key until the mutation is going on b/c query requests
      // can come from different components concurrently.
      const previousEvent = queryClient.getQueryData(["events", id]);
      queryClient.setQueryData(["events", id], newEvent);
      // Changing cached data.
      return { previousEvent }; // This previousEvent value will be returned so that it can be passed and accessed in the onError function.
    },
    onError: (error, data, context) => {
      // context contains value related to previous cached value of event or previousEvent.
      // called in case of a error in the mutation function.
      queryClient.setQueryData(["events", id], context.previousEvent);
    },
    onSettled: () => {
      // It will be called after mutation no matter it failed or succeeded.
      // Just to be sure that cache have same data as backend we invalidate it.
      // So that frontend and backend is always in sync with data.
      queryClient.invalidateQueries(["events", id]);
    },
  });

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 5000,
    // This staleTime is used to not send redundant data fetch
    // to server when using it with loader function of router.
    // So that a fetch query is not send just after loader function is used to fetch data.
  });

  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className='center'>
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title='Failed to load event'
          message={
            error.info?.message ||
            "Failed to load event. Please check your inputs and try again later."
          }
        />
        <div className='form-actions'>
          <Link
            to='../'
            className='button'
          >
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm
        inputData={data}
        onSubmit={handleSubmit}
      >
        <Link
          to='../'
          className='button-text'
        >
          Cancel
        </Link>
        <button
          type='submit'
          className='button'
        >
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
  return queryClient.fetchQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

// This EditEvent page loads instantly after the event page edit button because the loaded data is cached
// in eventDetails Page as useQuery in both pages have same queryKey so it cache the data and reuse the data.
