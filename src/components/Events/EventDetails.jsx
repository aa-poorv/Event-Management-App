import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isError, isPending } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const handleStartDelete = () => {
    setIsDeleting(true);
  };

  const handleStopDelete = () => {
    setIsDeleting(false);
  };

  const {
    mutate,
    isPending: deletePending,
    isError: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
        // This doesn't refetch the query request just after we run invalidate queries on the deleting event that caused the error.
        // Therefore it will not be refetch immediately but when it is required or rerendered.
      });
      navigate("/events");
    },
  });

  const onClickHandler = () => {
    mutate({ id });
  };
  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          {deleteError && (
            <ErrorBlock
              title='Deleting event error'
              message='Internal deleting event error'
            />
          )}
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone.
          </p>
          <div className='form-actions'>
            {deletePending && <p>Deleting, please wait..</p>}
            {!deletePending && (
              <>
                <button
                  onClick={handleStopDelete}
                  className='button-text'
                >
                  Cancel
                </button>
                <button
                  onClick={onClickHandler}
                  className='button'
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link
          to='/events'
          className='nav-item'
        >
          View all Events
        </Link>
      </Header>
      <article id='event-details'>
        {isPending && <p>Event Loading...</p>}
        {isError && (
          <ErrorBlock
            title='Given event not found'
            message='Please give valid event'
          />
        )}
        {data && (
          <>
            <header>
              <h1>{data.title}</h1>
              <nav>
                <button onClick={handleStartDelete}>Delete</button>
                <Link to='edit'>Edit</Link>
              </nav>
            </header>
            <div id='event-details-content'>
              <img
                src={`http://localhost:3000/${data.image}`}
                alt={`${data.title} image is not available`}
              />
              <div id='event-details-info'>
                <div>
                  <p id='event-details-location'>{data.location}</p>
                  <time
                    dateTime={`Todo-DateT$Todo-Time`}
                  >{`${data.time} @ ${data.date}`}</time>
                </div>
                <p id='event-details-description'> {data.description} </p>
              </div>
            </div>
          </>
        )}
      </article>
    </>
  );
}
