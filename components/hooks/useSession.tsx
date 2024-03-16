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
}

export const SessionContext = createContext({} as SessionContextProps);

export const SessionProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [sessionId, setSessionId] = useState<string>("");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const request = await fetch("/api/memory/list");
      const sessions = await request.json();
      setAvailableSessions(sessions);
    };
    init();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        availableSessions,
        setSessionId,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default function useSession() {
  const { sessionId, setSessionId, availableSessions } =
    useContext(SessionContext);

  const createNewSession = async () => {
    setSessionId(uuid());
  };

  const selectSession = async (session: string) => {
    setSessionId(session);
  };

  return {
    sessionId,
    availableSessions,
    createNewSession,
    selectSession,
  };
}
