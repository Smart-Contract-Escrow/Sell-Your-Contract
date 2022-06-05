import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { LoadingContext, EventsContext } from "./contexts/contexts";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <MyApp />
  </React.StrictMode>
);

function MyApp() {
  const [loading, setLoading] = React.useState(false);
  const [checks, setChecks] = React.useState({
    transContract: false,
    readyForBuyer: false,
    paymentSent: false
  });
  return (
    <LoadingContext.Provider value={[loading, setLoading]}>
      <EventsContext.Provider value={[checks, setChecks]}>
        <App />
      </EventsContext.Provider>
    </LoadingContext.Provider>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
