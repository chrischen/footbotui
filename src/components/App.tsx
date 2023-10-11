import { useRef, useCallback } from "react";
import { css, cx } from "@linaria/core";
import { t } from "@lingui/macro";
import { useLoaderData } from "react-router-dom";
import {
  graphql,
  usePreloadedQuery,
  useMutation,
  ConnectionHandler,
} from "react-relay";
import { AppQuery as AppQueryType } from "../__generated__/AppQuery.graphql";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "./index.css";
import "../global/static.css";

export const AppQuery = graphql`
  query AppQuery($cursor: String, $count: Int) {
    jobs(after: $cursor, first: $count) @connection(key: "AppQuery_jobs") {
      edges {
        node {
          id
        }
      }
    }
  }
`;
const AppMutation = graphql`
  mutation AppMutation(
    $time: JsDate!
    $attempts: Int!
    $interval: Int!
    $form: FormInput!
    $connections: [ID!]!
  ) {
    createJob(
      input: {
        time: $time
        attempts: $attempts
        interval: $interval
        form: $form
      }
    ) {
      jobEdge @appendEdge(connections: $connections) {
        node {
          id
        }
      }
    }
  }
`;
// Component-styles and using @apply to abstract tailwind styles is discouraged.
// Abstractions should always be at the component level–not at the style level.
const header = css`
  text-transform: uppercase;
  font-size: 3em;
  @apply font-bold py-10 px-4;
`;

function App() {
  const ref = useLoaderData() as LoaderData<typeof loader>;
  const data = usePreloadedQuery<AppQueryType>(AppQuery, ref);
  const [commitMutation, isMutationInFlight] = useMutation(AppMutation);

  const scheduleDateInput = useRef<HTMLInputElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);
  const fieldInput = useRef<HTMLInputElement>(null);
  const startTimeInput = useRef<HTMLInputElement>(null);
  const endTimeInput = useRef<HTMLInputElement>(null);
  const submit = useCallback(
    () => (e) => {
      e.preventDefault();
      const connectionID = ConnectionHandler.getConnectionID(
        "root",
        "AppQuery_jobs"
      );
      const createJobInput = {
        time: new Date(scheduleDateInput.current?.value),
        attempts: 5,
        interval: 30,
        form: {
          date: new Date(dateInput.current?.value),
          startTime: parseInt(startTimeInput.current?.value),
          endTime: parseInt(endTimeInput.current?.value),
          field: "123",
          shop: "2013",
        },
        connections: [connectionID],
      };
      commitMutation({
        variables: createJobInput,
      });
    },
    [commitMutation]
  );
  console.log(data);
  return (
    <>
      <h1 className={header}>{t`FootBot`}</h1>
      <p className="mb-4">{t`Advanced Futsal Court Booking System`}</p>
      <div className="mb-4">
        <form onSubmit={submit()}>
          <input
            type="text"
            name="date"
            ref={scheduleDateInput}
            placeholder="4/13/2023"
          />
          <input
            type="text"
            name="date"
            ref={dateInput}
            placeholder="5/13/2023"
          />
          <input type="text" name="court" ref={fieldInput} placeholder="215" />
          <input
            type="text"
            name="startTime"
            ref={startTimeInput}
            placeholder="1700"
          />
          <input
            type="text"
            name="endTime"
            ref={endTimeInput}
            placeholder="2100"
          />
          <input type="submit" value="Schedule" />
        </form>
      </div>
      {data.jobs.edges?.map((job) => {
        return (
          <div className="border-2 border-white rounded-md mb-4 p-4">
            <p className="">
              {t`Scheduled`}: {job?.node?.id}
            </p>
          </div>
        );
      })}
      <p className="read-the-docs">Powered by Chris Chen</p>
    </>
  );
}

export default App;
