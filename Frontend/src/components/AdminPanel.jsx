import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

// Zod schema matching the problem schema exactly (lowercase languages)
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.enum([
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
  ]),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        explanation: z.string().min(1, "Explanation is required"),
      }),
    )
    .min(1, "At least one visible test case required"),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      }),
    )
    .min(1, "At least one hidden test case required"),
  startCode: z
    .array(
      z.object({
        language: z.enum(["python", "c++", "java", "c", "javascript"]), // Fixed case
        initialCode: z.string().min(1, "Initial code is required"),
      }),
    )
    .length(5, "All Languages required"),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["python", "c++", "java", "c", "javascript"]), // Fixed case
        completeCode: z.string().min(1, "Complete code is required"),
      }),
    )
    .length(5, "All languages required"),
});

export default function AdminPanel() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "easy",
      tags: "array",
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      hiddenTestCases: [{ input: "", output: "" }],
      // Fixed default values to match the lowercase schema
      startCode: [
        { language: "python", initialCode: "" },
        { language: "c++", initialCode: "" },
        { language: "java", initialCode: "" },
        { language: "c", initialCode: "" },
        { language: "javascript", initialCode: "" },
      ],

      referenceSolution: [
        { language: "python", completeCode: "" },
        { language: "c++", completeCode: "" },
        { language: "java", completeCode: "" },
        { language: "c", completeCode: "" },
        { language: "javascript", completeCode: "" },
      ],
    },
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: "visibleTestCases",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddenTestCases",
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post("/problem/create", data);
      alert("Problem created Successfully");
      navigate("/");
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Basic Information --- */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                {...register("title")}
                className={`input input-bordered w-full ${
                  errors.title ? "input-error" : ""
                }`}
                placeholder="Enter problem title"
              />
              {errors.title && (
                <span className="text-error text-sm mt-1">
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                {...register("description")}
                className={`textarea textarea-bordered h-32 w-full ${
                  errors.description ? "textarea-error" : ""
                }`}
                placeholder="Problem description"
              />
              {errors.description && (
                <span className="text-error text-sm mt-1">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Difficulty</span>
                </label>
                <select
                  {...register("difficulty")}
                  className={`select select-bordered w-full ${
                    errors.difficulty ? "select-error" : ""
                  }`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {errors.difficulty && (
                  <span className="text-error text-sm mt-1">
                    {errors.difficulty.message}
                  </span>
                )}
              </div>

              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Tag</span>
                </label>
                <select
                  {...register("tags")}
                  className={`select select-bordered w-full ${
                    errors.tags ? "select-error" : ""
                  }`}
                >
                  <option value="array">Array</option>
                  <option value="string">String</option>
                  <option value="linkedList">Linked List</option>
                  <option value="stack">Stack</option>
                  <option value="queue">Queue</option>
                  <option value="hashTable">Hash Table</option>
                  <option value="twoPointers">Two Pointers</option>
                  <option value="slidingWindow">Sliding Window</option>
                  <option value="binarySearch">Binary Search</option>
                  <option value="sorting">Sorting</option>
                  <option value="recursion">Recursion</option>
                  <option value="backtracking">Backtracking</option>
                  <option value="greedy">Greedy</option>
                  <option value="dp">Dynamic Programming</option>
                  <option value="tree">Tree</option>
                  <option value="binaryTree">Binary Tree</option>
                  <option value="bst">Binary Search Tree</option>
                  <option value="heap">Heap</option>
                  <option value="trie">Trie</option>
                  <option value="graph">Graph</option>
                  <option value="dfs">DFS</option>
                  <option value="bfs">BFS</option>
                  <option value="bitManipulation">Bit Manipulation</option>
                  <option value="math">Math</option>
                  <option value="prefixSum">Prefix Sum</option>
                </select>
                {errors.tags && (
                  <span className="text-error text-sm mt-1">
                    {errors.tags.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Test Cases --- */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>

          {/* Visible Test Cases */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Visible Test Cases</h3>
              <button
                type="button"
                onClick={() =>
                  appendVisible({ input: "", output: "", explanation: "" })
                }
                className="btn btn-sm btn-primary"
              >
                + Add Visible Case
              </button>
            </div>

            {errors.visibleTestCases?.root && (
              <span className="text-error text-sm block mb-2">
                {errors.visibleTestCases.root.message}
              </span>
            )}

            {visibleFields.map((field, index) => (
              <div
                key={field.id}
                className="border border-base-300 p-4 rounded-lg space-y-3 bg-base-200/50 relative"
              >
                {visibleFields.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="btn btn-xs btn-error absolute right-2 top-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="form-control pt-4">
                  <input
                    {...register(`visibleTestCases.${index}.input`)}
                    placeholder="Input"
                    className="input input-bordered w-full"
                  />
                  {errors.visibleTestCases?.[index]?.input && (
                    <span className="text-error text-sm mt-1">
                      {errors.visibleTestCases[index].input.message}
                    </span>
                  )}
                </div>
                <div className="form-control">
                  <input
                    {...register(`visibleTestCases.${index}.output`)}
                    placeholder="Output"
                    className="input input-bordered w-full"
                  />
                  {errors.visibleTestCases?.[index]?.output && (
                    <span className="text-error text-sm mt-1">
                      {errors.visibleTestCases[index].output.message}
                    </span>
                  )}
                </div>
                <div className="form-control">
                  <textarea
                    {...register(`visibleTestCases.${index}.explanation`)}
                    placeholder="Explanation"
                    className="textarea textarea-bordered w-full"
                  />
                  {errors.visibleTestCases?.[index]?.explanation && (
                    <span className="text-error text-sm mt-1">
                      {errors.visibleTestCases[index].explanation.message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Hidden Test Cases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: "", output: "" })}
                className="btn btn-sm btn-primary"
              >
                + Add Hidden Case
              </button>
            </div>

            {errors.hiddenTestCases?.root && (
              <span className="text-error text-sm block mb-2">
                {errors.hiddenTestCases.root.message}
              </span>
            )}

            {hiddenFields.map((field, index) => (
              <div
                key={field.id}
                className="border border-base-300 p-4 rounded-lg space-y-3 bg-base-200/50 relative"
              >
                {hiddenFields.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="btn btn-xs btn-error absolute right-2 top-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="form-control pt-4">
                  <input
                    {...register(`hiddenTestCases.${index}.input`)}
                    placeholder="Input"
                    className="input input-bordered w-full"
                  />
                  {errors.hiddenTestCases?.[index]?.input && (
                    <span className="text-error text-sm mt-1">
                      {errors.hiddenTestCases[index].input.message}
                    </span>
                  )}
                </div>
                <div className="form-control">
                  <input
                    {...register(`hiddenTestCases.${index}.output`)}
                    placeholder="Output"
                    className="input input-bordered w-full"
                  />
                  {errors.hiddenTestCases?.[index]?.output && (
                    <span className="text-error text-sm mt-1">
                      {errors.hiddenTestCases[index].output.message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Code Templates --- */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>

          <div className="space-y-6">
            {/* Fixed Map Array to use Objects to avoid toLowerCase ReferenceError */}
            {[
  { label: "Python", value: "python" },
  { label: "C++", value: "c++" },
  { label: "Java", value: "java" },
  { label: "C", value: "c" },
  { label: "JavaScript", value: "javascript" },
].map((lang, index) => (
              <div key={lang.value} className="space-y-2">
                <h3 className="font-medium text-lg">{lang.label}</h3>

                <input
                  type="hidden"
                  value={lang.value}
                  {...register(`startCode.${index}.language`)}
                />
                <input
                  type="hidden"
                  value={lang.value}
                  {...register(`referenceSolution.${index}.language`)}
                />

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Initial Code (Boilerplate)
                    </span>
                  </label>
                  <div
                    className={`bg-base-300 p-2 rounded-lg border ${errors.startCode?.[index]?.initialCode ? "border-error" : "border-transparent"}`}
                  >
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      className="w-full bg-transparent font-mono outline-none resize-y p-2"
                      rows={4}
                      placeholder={`Write initial ${lang.label} code here...`}
                    />
                  </div>
                  {errors.startCode?.[index]?.initialCode && (
                    <span className="text-error text-sm mt-1">
                      {errors.startCode[index].initialCode.message}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Reference Solution</span>
                  </label>
                  <div
                    className={`bg-base-300 p-2 rounded-lg border ${errors.referenceSolution?.[index]?.completeCode ? "border-error" : "border-transparent"}`}
                  >
                    <textarea
                      {...register(`referenceSolution.${index}.completeCode`)}
                      className="w-full bg-transparent font-mono outline-none resize-y p-2"
                      rows={4}
                      placeholder={`Write complete ${lang.label} solution here...`}
                    />
                  </div>
                  {errors.referenceSolution?.[index]?.completeCode && (
                    <span className="text-error text-sm mt-1">
                      {errors.referenceSolution[index].completeCode.message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-success text-white px-8"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Create Problem"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
