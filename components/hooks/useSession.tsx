import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
} from "react";
import { v4 as uuid } from "uuid";

interface SessionContextProps {
  sessionId: string;
  availableSessions: string[];
  setSessionId: Dispatch<SetStateAction<string>>;
  setAvailableSessions: Dispatch<SetStateAction<string[]>>;
}

export const SessionContext = createContext({} as SessionContextProps);

export const SessionProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [sessionId, setSessionId] = useState<string>("");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  const init = async () => {
    const request = await fetch("/api/memory/list");
    const sessions = await request.json();
    setAvailableSessions(sessions);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        availableSessions,
        setSessionId,
        setAvailableSessions,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default function useSession() {
  const { sessionId, setSessionId, availableSessions, setAvailableSessions } =
    useContext(SessionContext);

  const createNewSession = async () => {
    const newSessionId = uuid();
    setSessionId(newSessionId);
    setAvailableSessions((prev) => [newSessionId, ...prev]);
    return newSessionId;
  };

  const selectSession = async (session: string) => {
    setSessionId(session);
  };

  const setSessionStatus = async (session: string, status: boolean) => {
    const response = await fetch(
      `/api/memory/${session}/status?state=${status ? "active" : "inactive"}`
    );
    if (response.status !== 200) {
      const { error } = await response.json();
      throw new Error(error);
    }
  };

  return {
    sessionId,
    availableSessions,
    createNewSession,
    selectSession,
    setSessionStatus,
  };
}
