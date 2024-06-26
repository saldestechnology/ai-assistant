import { FaPenToSquare } from "react-icons/fa6";
import useSession from "./hooks/useSession";
import useConversation from "./hooks/useConversation";
import { useCallback, useEffect } from "react";

export default function SessionList() {
  const {
    sessionId,
    availableSessions,
    createNewSession,
    selectSession,
    setSessionStatus,
  } = useSession();
  const { conversation, resetConversation, getConversationBySessionId } =
    useConversation();

  const deactivateCurrentSession = async () => {
    if (sessionId) {
      await setSessionStatus(sessionId, false);
    }
  };

  const handleSelectSession = async (session: string) => {
    await deactivateCurrentSession();
    selectSession(session);
    resetConversation();
    await getConversationBySessionId(session);
  };

  const handleCreateNewSession = async () => {
    await deactivateCurrentSession();
    resetConversation();
    await createNewSession();
  };

  const watchConversation = useCallback(async () => {
    if (conversation.length > 1) {
      await setSessionStatus(sessionId, true);
    }
  }, [conversation, sessionId, setSessionStatus]);

  useEffect(() => {
    watchConversation();
  }, [conversation, watchConversation]);

  return (
    <aside className="flex flex-col p-4 w-1/5 border-r border-zinc-950 h-full">
      <div className="flex justify-end w-full">
        <button
          type="button"
          title="New chat"
          className="p-2 border bg-black text-white border-none"
          onClick={handleCreateNewSession}
        >
          <FaPenToSquare />
        </button>
      </div>
      <div className="flex flex-col justify-start w-full">
        <h3 className="">Chats</h3>
        <ul className="my-4">
          {availableSessions &&
            availableSessions.map((session, index) => (
              <li
                className="py-2 border  border-zinc-950 border-x-0"
                key={`session-${index}`}
              >
                <button
                  type="button"
                  className="w-full h-full bg-transparent border-none text-left"
                  onClick={async () => await handleSelectSession(session)}
                >
                  {session}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </aside>
  );
}
