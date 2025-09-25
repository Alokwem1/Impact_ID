import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../utils/AuthContext";
import RegisterPage from "../auth/RegisterPage.jsx";
import DashboardPage from "../DashboardPage.jsx";

let axe;
try {
  axe = require("jest-axe").axe; // eslint-disable-line
} catch (e) {}

function shellRender(initial = "/register", ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <QueryClientProvider client={qc}>
        <AuthProvider>{ui}</AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("Accessibility smoke (Register & Dashboard)", () => {
  it("RegisterPage has no serious/critical violations", async () => {
    if (!axe) return;
    const { container } = shellRender("/register", <RegisterPage />);
    const results = await axe(container);
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact),
    );
    if (serious.length) {
      console.error(
        "RegisterPage a11y serious violations",
        JSON.stringify(serious, null, 2),
      );
    }
    expect(serious).toHaveLength(0);
  });

  it("DashboardPage scaffold has no serious/critical violations", async () => {
    if (!axe) return;
    // Provide fake auth user so dashboard content renders if it requires auth
    localStorage.setItem("accessToken", "token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1, username: "demo", role: "user" }),
    );
    const { container } = shellRender("/dashboard", <DashboardPage />);
    const results = await axe(container);
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact),
    );
    if (serious.length) {
      console.error(
        "DashboardPage a11y serious violations",
        JSON.stringify(serious, null, 2),
      );
    }
    expect(serious).toHaveLength(0);
  });
});
