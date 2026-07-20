import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from "../components/ChatAi";
import Editorial from "../components/Editorial";

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  const [messages, setMessages] = useState([
    { role: "model", parts: [{ text: "Hi, How are you" }] },
    { role: "user", parts: [{ text: "I am Good" }] },
  ]);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(
          `/problem/problemById/${problemId}`,
        );

        const initialCode =
          response.data.startCode.find((sc) => sc.language === selectedLanguage)
            ?.initialCode || "";

        setProblem(response.data);

        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching problem:", error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode =
        problem.startCode.find((sc) => sc.language === selectedLanguage)
          ?.initialCode || "";

      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage,
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab("testcase");
    } catch (error) {
      console.error("Error running code:", error);
      setRunResult({
        success: false,
        error: "Internal server error",
      });
      setLoading(false);
      setActiveRightTab("testcase");
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(
        `/submission/submit/${problemId}`,
        {
          code: code,
          language: selectedLanguage,
        },
      );

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab("result");
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab("result");
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case "javascript":
        return "javascript";

      case "java":
        return "java";

      case "c++":
        return "cpp";

      case "python":
        return "python";

      case "c":
        return "c";

      default:
        return "javascript";
    }
  };

 const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-base-100 overflow-hidden">
      {/* Left Panel */}
      <div className="h-1/2 lg:h-full w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-base-300">
        {/* Left Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-2 sm:px-4 flex-nowrap overflow-x-auto whitespace-nowrap shrink-0 [&::-webkit-scrollbar]:hidden">
          <button
            className={`tab ${activeLeftTab === "description" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("description")}
          >
            Description
          </button>
          <button
            className={`tab ${activeLeftTab === "editorial" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("editorial")}
          >
            Editorial
          </button>
          <button
            className={`tab ${activeLeftTab === "solutions" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("solutions")}
          >
            Solutions
          </button>
          <button
            className={`tab ${activeLeftTab === "submissions" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("submissions")}
          >
            Submissions
          </button>
          <button
            className={`tab ${activeLeftTab === "chatAI" ? "tab-active" : ""}`}
            onClick={() => setActiveLeftTab("chatAI")}
          >
            ChatAI
          </button>
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {problem && (
            <>
              {activeLeftTab === "description" && (
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold">{problem.title}</h1>
                    <div
                      className={`badge badge-sm sm:badge-md badge-outline ${getDifficultyColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty.charAt(0).toUpperCase() +
                        problem.difficulty.slice(1)}
                    </div>
                    <div className="badge badge-sm sm:badge-md badge-primary">
                      {problem.tags}
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                      Examples:
                    </h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="bg-base-200 p-3 sm:p-4 rounded-lg overflow-x-auto">
                          <h4 className="font-semibold mb-2 text-sm sm:text-base">
                            Example {index + 1}:
                          </h4>
                          <div className="space-y-2 text-xs sm:text-sm font-mono whitespace-pre-wrap">
                            <div>
                              <strong>Input:</strong> {example.input}
                            </div>
                            <div>
                              <strong>Output:</strong> {example.output}
                            </div>
                            <div>
                              <strong>Explanation:</strong>{" "}
                              {example.explanation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === "editorial" && (
                <div className="prose max-w-none">
                  <h2 className="text-lg sm:text-xl font-bold mb-4">Editorial</h2>
                  <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                    <Editorial
                      secureUrl={problem.secureUrl}
                      thumbnailUrl={problem.thumbnailUrl}
                      duration={problem.duration}
                    />
                  </div>
                </div>
              )}

              {activeLeftTab === "solutions" && (
                <div>
                  <h2 className="text-lg sm:text-xl font-bold mb-4">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div
                        key={index}
                        className="border border-base-300 rounded-lg overflow-hidden"
                      >
                        <div className="bg-base-200 px-3 sm:px-4 py-2">
                          <h3 className="font-semibold text-sm sm:text-base">
                            {problem?.title} - {solution?.language}
                          </h3>
                        </div>
                        <div className="p-3 sm:p-4 overflow-x-auto">
                          <pre className="bg-base-300 p-3 sm:p-4 rounded text-xs sm:text-sm">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm sm:text-base">
                        Solutions will be available after you solve the problem.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeLeftTab === "submissions" && (
                <div>
                  <h2 className="text-lg sm:text-xl font-bold mb-4">My Submissions</h2>
                  <div className="text-gray-500 overflow-x-auto">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === "chatAI" && (
                <div className="prose max-w-none">
                  <h2 className="text-lg sm:text-xl font-bold mb-4">CHAT with AI</h2>
                  <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed h-full">
                    <ChatAi
                      problem={problem}
                      messages={messages}
                      setMessages={setMessages}
                    ></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="h-1/2 lg:h-full w-full lg:w-1/2 flex flex-col">
        {/* Right Tabs */}
        <div className="tabs tabs-bordered bg-base-200 px-2 sm:px-4 flex-nowrap overflow-x-auto whitespace-nowrap shrink-0 [&::-webkit-scrollbar]:hidden">
          <button
            className={`tab ${activeRightTab === "code" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("code")}
          >
            Code
          </button>
          <button
            className={`tab ${activeRightTab === "testcase" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("testcase")}
          >
            Testcase
          </button>
          <button
            className={`tab ${activeRightTab === "result" ? "tab-active" : ""}`}
            onClick={() => setActiveRightTab("result")}
          >
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeRightTab === "code" && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-2 sm:p-4 border-b border-base-300">
                <div className="flex gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap shrink-0 [&::-webkit-scrollbar]:hidden w-full">
                  {["python", "c++", "java", "c", "javascript"].map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-xs sm:btn-sm shrink-0 ${
                        selectedLanguage === lang ? "btn-primary" : "btn-ghost"
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === "python"
                        ? "Python"
                        : lang === "c++"
                        ? "C++"
                        : lang === "java"
                        ? "Java"
                        : lang === "c"
                        ? "C"
                        : "JavaScript"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 min-h-0 relative">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: "on",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "line",
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: "line",
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-2 sm:p-4 border-t border-base-300 flex justify-between shrink-0">
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveRightTab("testcase")}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`btn btn-outline btn-sm ${
                      loading ? "loading" : ""
                    }`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${
                      loading ? "loading" : ""
                    }`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === "testcase" && (
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Test Results</h3>
              {runResult ? (
                <div
                  className={`alert ${
                    runResult.success ? "alert-success" : "alert-error"
                  } mb-4 text-xs sm:text-sm p-3 sm:p-4`}
                >
                  <div className="w-full">
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold text-sm sm:text-base">✅ All test cases passed!</h4>
                        <p className="mt-2">
                          Runtime: {runResult.runtime + " sec"}
                        </p>
                        <p>Memory: {runResult.memory + " KB"}</p>

                        <div className="mt-4 space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div
                              key={i}
                              className="bg-base-100 p-3 rounded overflow-x-auto"
                            >
                              <div className="font-mono whitespace-pre-wrap">
                                <div>
                                  <strong>Input:</strong> {tc.stdin}
                                </div>
                                <div>
                                  <strong>Expected:</strong>{" "}
                                  {tc.expected_output}
                                </div>
                                <div>
                                  <strong>Output:</strong> {tc.stdout}
                                </div>
                                <div className="text-green-600 mt-1 font-semibold">
                                  {"✓ Passed"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-sm sm:text-base">❌ Error</h4>
                        <div className="mt-4 space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div
                              key={i}
                              className="bg-base-100 p-3 rounded overflow-x-auto"
                            >
                              <div className="font-mono whitespace-pre-wrap">
                                <div>
                                  <strong>Input:</strong> {tc.stdin}
                                </div>
                                <div>
                                  <strong>Expected:</strong>{" "}
                                  {tc.expected_output}
                                </div>
                                <div>
                                  <strong>Output:</strong> {tc.stdout}
                                </div>
                                <div
                                  className={`mt-1 font-semibold ${
                                    tc.status_id == 3
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {tc.status_id == 3 ? "✓ Passed" : "✗ Failed"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm sm:text-base">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

          {activeRightTab === "result" && (
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Submission Result</h3>
              {submitResult ? (
                <div
                  className={`alert ${
                    submitResult.accepted ? "alert-success" : "alert-error"
                  } p-3 sm:p-4 text-xs sm:text-sm`}
                >
                  <div className="w-full">
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-base sm:text-lg">🎉 Accepted</h4>
                        <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                          <p>
                            Test Cases Passed: {submitResult.passedTestCases}/
                            {submitResult.totalTestCases}
                          </p>
                          <p>Runtime: {submitResult.runtime + " sec"}</p>
                          <p>Memory: {submitResult.memory + "KB"} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-base sm:text-lg">
                          ❌ {submitResult.error}
                        </h4>
                        <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                          <p>
                            Test Cases Passed: {submitResult.passedTestCases}/
                            {submitResult.totalTestCases}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm sm:text-base">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;
