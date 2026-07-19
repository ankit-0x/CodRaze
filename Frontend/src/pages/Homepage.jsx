import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router"; // Fixed import
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });
  const [search, setSearch] = useState("");
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblems");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/problemsSolvedByUser");
        setSolvedProblems(data);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };
    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); // clear solved problems on logout
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const difficultyMatch =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === "all" || problem.tags === filters.tag;
    const statusMatch =
      filters.status === "all" ||
      solvedProblems.some((sp) => sp._id === problem._id);
    return matchesSearch && difficultyMatch && tagMatch && statusMatch;
  });

  const topics = [
    "all",
    "array",
    "string",
    "linkedList",
    "stack",
    "queue",
    "hashTable",
    "twoPointers",
    "slidingWindow",
    "binarySearch",
    "sorting",
    "recursion",
    "backtracking",
    "greedy",
    "dp",
    "tree",
    "binaryTree",
    "bst",
    "heap",
    "trie",
    "graph",
    "dfs",
    "bfs",
    "bitManipulation",
    "math",
    "prefixSum",
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navigation Bar */}
      <nav className="navbar sticky top-0 z-50 bg-base-100/90 backdrop-blur border-b border-base-300 px-6 shadow-sm">
        <div className="flex-1">
          <NavLink to="/" className="flex items-center">
            <img
              src="/CodRaze_logo.png"
              alt="CodRaze"
              className="h-12 w-auto"
              draggable={false}
            />
          </NavLink>
        </div>

        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="flex items-center gap-3 cursor-pointer rounded-full px-2 py-1">
              <div className="avatar placeholder">
                <div className="flex justify-center items-center bg-primary text-primary-content rounded-full w-10">
                  <span className="font-semibold text-lg">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </label>

            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 w-56 rounded-box bg-base-100 shadow-xl border border-base-300"
            >
              <li className="menu-title font-medium md:block hidden">
                <span>{user?.firstName}</span>
              </li>
              {user.role === "admin" && (
                <li>
                  <NavLink to="/admin">Admin Dashboard</NavLink>
                </li>
              )}

              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Problem Set</h1>

          <p className="text-base-content/70 mt-2">
            Solve coding challenges and improve your DSA skills.
          </p>
        </div>
        {/* Filters */}
        <div className="card bg-base-100 shadow-md border border-base-300 mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl">Filter Problems</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Solved", value: "solved" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() =>
                      setFilters({ ...filters, status: item.value })
                    }
                    className={`btn btn-sm rounded-full ${
                      filters.status === item.value
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Difficulty */}
              <div className="flex flex-wrap gap-2">
                {["all", "easy", "medium", "hard"].map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => setFilters({ ...filters, difficulty })}
                    className={`btn btn-sm rounded-full ${
                      filters.difficulty === difficulty
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </button>
                ))}
              </div>
              {/* Topics */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setFilters({ ...filters, tag: topic })}
                    className={`btn btn-sm rounded-full ${
                      filters.tag === topic ? "btn-secondary" : "btn-outline"
                    }`}
                  >
                    {topic === "all" ? "All" : topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <label className="input input-bordered flex items-center gap-2 w-full md:w-96">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              className="grow"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="btn btn-circle btn-sm"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </label>
        </div>
        {/* Problems List */}
        <div className="space-y-4">
          {filteredProblems.length === 0 ? (
            <div className="hero bg-base-100 rounded-xl shadow">
              <div className="hero-content text-center py-16">
                <div>
                  <h2 className="text-2xl font-bold">No problems found</h2>

                  <p className="text-base-content/70 mt-2">
                    Try another search or change the filters.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              /* Wrapped the card inside a Link component */
              <Link
                key={problem._id}
                to={`/problem/${problem._id}`}
                className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title text-lg font-semibold">
                      {problem.title}
                    </h2>

                    {solvedProblems.some((sp) => sp._id === problem._id) && (
                      <div className="badge badge-warning badge-sm badge-outline gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 11.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Solved
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div
                      className={`badge badge-lg ${getDifficultyBadgeColor(problem.difficulty)}`}
                    >
                      {problem.difficulty}
                    </div>
                    <div className="badge badge-outline badge-lg">
                      {problem.tags}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "badge-success";
    case "medium":
      return "badge-warning";
    case "hard":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

export default Homepage;
