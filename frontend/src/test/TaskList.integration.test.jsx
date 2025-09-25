import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import TaskList from "../tasks/TaskList.jsx";
import { renderWithProviders } from "./testUtils";

vi.mock("../api/axios", () => {
  const get = vi.fn((url) => {
    if (url.startsWith("/api/tasks/categories")) {
      return Promise.resolve({ data: ["Environment", "Education"] });
    }
    if (url.startsWith("/api/tasks/?")) {
      return Promise.resolve({
        data: [
          {
            id: 1,
            title: "Plant Trees",
            category: "Environment",
            tags: ["eco"],
            difficulty: "beginner",
          },
          {
            id: 2,
            title: "Teach Coding",
            category: "Education",
            tags: ["tech"],
            difficulty: "intermediate",
          },
        ],
      });
    }
    return Promise.resolve({ data: [] });
  });
  return { default: { get } };
});

vi.mock("react-hot-toast", () => ({
  default: Object.assign(() => {}, { success: vi.fn(), error: vi.fn() }),
  __esModule: true,
}));

describe("TaskList integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderList() {
    return renderWithProviders(<TaskList />);
  }

  it("renders tasks and filters by search term", async () => {
    renderList();
    await waitFor(() => {
      expect(screen.getByText("Your Tasks")).toBeInTheDocument();
    });
    expect(screen.getByText("Plant Trees")).toBeInTheDocument();
    expect(screen.getByText("Teach Coding")).toBeInTheDocument();

    // Apply search filter
    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(searchInput, { target: { value: "Plant" } });
    expect(screen.getByText("Plant Trees")).toBeInTheDocument();
    // Second task should be filtered out
    expect(screen.queryByText("Teach Coding")).not.toBeInTheDocument();
  });
});
