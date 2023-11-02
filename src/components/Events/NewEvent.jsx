import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createNewEvent, queryClient } from "../../util/http";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import ErrorBlock from "../UI/ErrorBlock";

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      // invalidQueries invalidate queries whose key have "events" in it.
      queryClient.invalidateQueries({ queryKey: ["events"] }); // can also add exact: true to only invalidate queries with exactly same query key.
      // As Navigation doesn't refetch the query b/c react query doesn't know that the query data connected to query is outdated
      // so to avoid this situation we manually invalidate the query data and refetch the query data to get the correct and fresh query data.
      navigate("/events");
    },
    // navigate will be called inside onSuccess hook instead of inside handleSubmit b/c in handleSubmit it will not wait
    // to redirect until, the form is submitted So we will not be able to see the loading or any error notification
    // feedback by useQuery, therefore navigate will be called without depending on if mutation is successful or not in handleSubmit.
  });
  // mutate is used to send send this useMutate request anywhere in the function.

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting..."}
        {!isPending && (
          <>
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
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title='Failed to create event'
          message={
            error.info?.message ||
            "Failed to create event.  Please check your inputs and try again later."
          }
        />
      )}
    </Modal>
  );
}
