import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Copy, Check } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function ChatAi({ problem, messages, setMessages }) {
  const [copied, setCopied] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSubmit = async (data) => {
    const updatedMessages = [
      ...messages,
      {
        role: "user",
        parts: [{ text: data.message }],
      },
    ];

    setMessages(updatedMessages);
    reset();

    try {
      const response = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,
        title: problem.title,
        description: problem.description,
        testCases: problem.visibleTestCases,
        startCode: problem.startCode,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: response.data.message }],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: "Error from AI Chatbot" }],
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[80vh] min-h-125">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble bg-base-200 text-base-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const code = String(children).replace(/\n$/, "");
                    const match = /language-(\w+)/.exec(className || "");

                    const handleCopy = async () => {
                      await navigator.clipboard.writeText(code);

                      setCopied(code);

                      setTimeout(() => {
                        setCopied("");
                      }, 2000);
                    };

                    return !inline && match ? (
                      <div className="relative">
                        <button
                          onClick={handleCopy}
                          className="absolute right-3 top-3 btn btn-xs z-10"
                        >
                          {copied === code ? (
                            <>
                              <Check size={14} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy
                            </>
                          )}
                        </button>

                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.parts[0].text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sticky bottom-0 p-4 bg-base-100 border-t"
      >
        <div className="flex items-center">
          <input
            placeholder="Ask me anything"
            className="input input-bordered flex-1"
            {...register("message", { required: true, minLength: 2 })}
          />
          <button
            type="submit"
            className="btn btn-ghost ml-2"
            disabled={errors.message}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;
