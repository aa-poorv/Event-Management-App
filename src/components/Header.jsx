import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  const fetching = useIsFetching();
  // This is used to check if fetching of data is going on anywhere in the app or not. It's value will be
  // greater than 0 if data fetching is in progress anywhere in the app.
  return (
    <>
      <div id='main-header-loading'>{fetching > 0 && <progress />}</div>
      <header id='main-header'>
        <div id='header-title'>
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
