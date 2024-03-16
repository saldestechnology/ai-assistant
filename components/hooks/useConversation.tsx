import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

interface Conversation {
  role: string;
  message: string;
}

interface ConversationContextProps {
  conversation: Conversation[];
  setConversation: Dispatch<SetStateAction<Conversation[]>>;
}

export const ConversationContext = createContext(
  {} as ConversationContextProps
);

export function ConversationProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [conversation, setConversation] = useState<Conversation[]>([]);

  return (
    <ConversationContext.Provider
      value={{
        conversation,
        setConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export default function useConversation() {
  const { conversation, setConversation } = useContext(ConversationContext);

  const getConversationBySessionId = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/memory/${sessionId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const messages = await response.json();
      const newConversation = messages.map((message: any) => {
        const role = message.id.includes("HumanMessage") ? "User" : "Jeffrey";
        const content = message.kwargs.content;
        return { role, message: content };
      });
      setConversation(newConversation);
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };

  const updateConversation = (message: Conversation) => {
    setConversation((prev) => [...prev, message]);
  };

  const resetConversation = () => {
    setConversation([]);
  };

  return {
    conversation,
    getConversationBySessionId,
    updateConversation,
    resetConversation,
  };
}
