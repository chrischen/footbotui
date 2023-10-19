import { useRef, useCallback, useState, useEffect } from "react";
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
import { SessionContext } from "./layouts/appContext";
import { FrontendApi, Configuration, Session, Identity } from "@ory/client";
import {
  ClerkProvider,
  SignedIn,
  SignOutButton,
  SignedOut,
  UserButton,
  RedirectToSignIn,
} from "@clerk/clerk-react";

// Clerk stuff
// if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
//   throw new Error("Missing Publishable Key");
// }
// const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// ORY stuff
const basePath = "http://localhost:4000";
const ory = new FrontendApi(
  new Configuration({
    basePath,
    baseOptions: {
      withCredentials: true,
    },
  })
);

export const AppQuery = graphql`
  query AppQuery($cursor: String, $count: Int) {
    jobs(after: $cursor, first: $count) @connection(key: "AppQuery_jobs") {
      edges {
        node {
          id
          status {
            __typename
            ... on Scheduled {
              log
            }
            ... on Completed {
              success
              log
            }
          }
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
          status {
            __typename
            ... on Scheduled {
              log
            }
            ... on Completed {
              success
              log
            }
          }
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

function Status({ status }) {
  switch (status.__typename) {
    case "Scheduled":
      return (
        <>
          {t`Status`}: {t`Scheduled`}
        </>
      );
    default:
      return (
        <>
          {t`Status`}: {t`Completed`}
        </>
      );
  }
}

const getUserName = (identity?: Identity) =>
  identity?.traits.email || identity?.traits.username;

function App() {
  const [session, setSession] = useState<Session | undefined>();
  const [logoutUrl, setLogoutUrl] = useState<string | undefined>();

  const ref = useLoaderData() as LoaderData<typeof loader>;
  const data = usePreloadedQuery<AppQueryType>(AppQuery, ref);
  const [commitMutation, isMutationInFlight] = useMutation(AppMutation);

  const scheduleDateInput = useRef<HTMLInputElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);
  const fieldInput = useRef<HTMLInputElement>(null);
  const shopInput = useRef<HTMLInputElement>(null);
  const startTimeInput = useRef<HTMLInputElement>(null);
  const endTimeInput = useRef<HTMLInputElement>(null);
  // const { isLoaded, userId, sessionId, getToken } = useAuth();

  // useEffect(() => {
  //   ory
  //     .toSession()
  //     .then(({ data }) => {
  //       // User has a session!
  //       setSession(data);
  //       ory.createBrowserLogoutFlow().then(({ data }) => {
  //         // Get also the logout url
  //         setLogoutUrl(data.logout_url);
  //       });
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       // Redirect to login page
  //       window.location.replace(`${basePath}/ui/login`);
  //     });
  // }, []);

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
          date: dateInput.current?.value,
          startTime: parseInt(startTimeInput.current?.value),
          endTime: parseInt(endTimeInput.current?.value),
          field: fieldInput.current?.value,
          shop: shopInput.current?.value,
        },
        connections: [connectionID],
      };
      commitMutation({
        variables: createJobInput,
      });
    },
    [commitMutation]
  );

  // if (!session) {
  //   // Still loading
  //   return <h1>Loading...</h1>;
  // }

  return (
    <SessionContext.Provider value={{}}>
      <ClerkProvider
        publishableKey={
          "pk_test_c3Rlcmxpbmctc2VhaG9yc2UtMTkuY2xlcmsuYWNjb3VudHMuZGV2JA"
        }
      >
        <SignedIn>
          <h1 className={header}>{t`FootBot`}</h1>
          <p className="mb-4">{t`Advanced Futsal Court Booking System`}</p>
          <p>
            <UserButton />
          </p>
          <div className="grid">
            <div className="mb-4 text-right">
              <form onSubmit={submit()}>
                <label>
                  Date
                  <input
                    className="ml-2 py-2 px-4"
                    type="text"
                    name="scheduleDate"
                    ref={scheduleDateInput}
                    placeholder="2023-07-21 23:59:59.4"
                  />
                </label>
                <br />
                <label>
                  Target Date
                  <input
                    className="ml-2 py-2 px-4"
                    type="text"
                    name="date"
                    ref={dateInput}
                    placeholder="2023-08-20"
                  />
                </label>
                <br />
                <label>
                  Shop
                  <input
                    className="ml-2 py-2 px-4"
                    type="text"
                    name="shop"
                    ref={shopInput}
                    placeholder="2013"
                  />
                </label>
                <br />
                <label>
                  Field
                  <input
                    className="ml-2 py-2 px-4"
                    type="text"
                    name="court"
                    ref={fieldInput}
                    placeholder="912"
                  />
                </label>
                <br />
                <label>
                  Start at
                  <input
                    className="ml-2 py-2 px-4"
                    type="text"
                    name="startTime"
                    ref={startTimeInput}
                    placeholder="1700"
                  />
                </label>
                <br />
                <label>
                  End at
                  <input
                    className="ml-2 py-2 px-4"
                    type="text"
                    name="endTime"
                    ref={endTimeInput}
                    placeholder="2100"
                  />
                </label>
                <br />
                <input className="py-2 px-4" type="submit" value="Schedule" />
                <br />
              </form>
            </div>
          </div>
          {data.jobs.edges?.map((job) => {
            return (
              <div
                key={job?.node?.id}
                className="border-2 border-white rounded-md mb-4 p-4"
              >
                <p className="">
                  {t`Scheduled`}: {job?.node?.id}{" "}
                  <Status status={job?.node?.status} />
                  <code className="text-sm sm:text-base inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 pl-6 overflow-x-scroll whitespace-pre">
                    {job?.node?.status?.log}
                  </code>
                </p>
              </div>
            );
          })}
          <p className="read-the-docs">Powered by Chris Chen</p>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </ClerkProvider>
    </SessionContext.Provider>
  );
}

export default App;
