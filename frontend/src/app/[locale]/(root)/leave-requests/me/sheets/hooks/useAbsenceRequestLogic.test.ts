import { renderHook } from "@testing-library/react";
import { useAbsenceRequestLogic } from "./useAbsenceRequestLogic";
import { useWatch, useFormContext } from "react-hook-form";
import { useFragment } from "@/__generated__";
import { calculateEndDate } from "../../utils/BusinessDaysUtils";
import { CalculationType } from "@/__generated__/graphql";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("react-hook-form", () => ({
  useWatch: vi.fn(),
  useFormContext: vi.fn(),
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
  ABSENCE_TYPES_QUERY_FRAGMENT: {},
}));

vi.mock("../../utils/BusinessDaysUtils", () => ({
  calculateEndDate: vi.fn(),
}));

describe("useAbsenceRequestLogic", () => {
  const mockHolidays = ["2026-04-14"];
  const mockAbsenceTypes = {
    nodes: [
      {
        id: "1",
        parentId: null,
        name: "Vacaciones",
        requiresDoctor: false,
        requiresAttachment: false,
        deductsFromBalance: true,
        calculationType: CalculationType.WorkingDays,
        maxDaysPerYear: 26,
      },
      {
        id: "2",
        parentId: null,
        name: "Licencia Médica",
        requiresDoctor: true,
        requiresAttachment: true,
        deductsFromBalance: false,
        calculationType: CalculationType.CalendarDays,
        maxDaysPerYear: 0,
      },
      {
        id: "3",
        parentId: "2",
        name: "Sub Licencia",
        requiresDoctor: false, // Override parent
        requiresAttachment: false,
        deductsFromBalance: false,
        calculationType: CalculationType.CalendarDays,
      }
    ],
  };

  const mockSetValue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormContext as any).mockReturnValue({
      control: {},
      setValue: mockSetValue,
    });
    (useFragment as any).mockReturnValue(mockAbsenceTypes);
    (calculateEndDate as any).mockReturnValue(new Date("2026-04-20"));
  });

  it("should identify sick leave correctly from parent", () => {
    (useWatch as any).mockImplementation(({ name }: { name: string }) => {
      if (name === "absenceTypeId") return "2"; // Medical
      return null;
    });

    const { result } = renderHook(() =>
      useAbsenceRequestLogic(mockHolidays, {} as any),
    );

    expect(result.current.isSickLeave).toBe(true);
  });

  it("should identify sick leave correctly from sub-type", () => {
    (useWatch as any).mockImplementation(({ name }: { name: string }) => {
      if (name === "absenceTypeId") return "2";
      if (name === "absenceSubTypeId") return "3"; // Sub Licencia (requiresDoctor: false)
      return null;
    });

    const { result } = renderHook(() =>
      useAbsenceRequestLogic(mockHolidays, {} as any),
    );

    // Should be false because sub-type overrides parent
    expect(result.current.isSickLeave).toBe(false);
  });

  it("should calculate end date using holidays for WorkingDays", () => {
    (useWatch as any).mockImplementation(({ name }: { name: string }) => {
      if (name === "absenceTypeId") return "1"; // Vacations
      if (name === "startDate") return new Date("2026-04-13");
      if (name === "requestedDays") return 5;
      return null;
    });

    renderHook(() =>
      useAbsenceRequestLogic(mockHolidays, {} as any),
    );

    expect(calculateEndDate).toHaveBeenCalledWith(
      expect.any(Date),
      5,
      mockHolidays,
      CalculationType.WorkingDays,
    );
  });

  it("should calculate end date WITHOUT holidays for CalendarDays", () => {
    (useWatch as any).mockImplementation(({ name }: { name: string }) => {
      if (name === "absenceTypeId") return "2"; // Medical
      if (name === "startDate") return new Date("2026-04-13");
      if (name === "requestedDays") return 5;
      return null;
    });

    renderHook(() =>
      useAbsenceRequestLogic(mockHolidays, {} as any),
    );

    expect(calculateEndDate).toHaveBeenCalledWith(
      expect.any(Date),
      5,
      [], // Empty holidays for calendar days
      CalculationType.CalendarDays,
    );
  });

  it("should return null for endDate if startDate or requestedDays is missing", () => {
    (useWatch as any).mockImplementation(({ name }: { name: string }) => {
      if (name === "absenceTypeId") return "1";
      if (name === "startDate") return null;
      if (name === "requestedDays") return null;
      return null;
    });

    const { result } = renderHook(() =>
      useAbsenceRequestLogic(mockHolidays, {} as any),
    );

    expect(result.current.endDate).toBeNull();
  });

  it("should return correct sub-types for selected parent type", () => {
    (useWatch as any).mockImplementation(({ name }: { name: string }) => {
      if (name === "absenceTypeId") return "2";
      return null;
    });

    const { result } = renderHook(() =>
      useAbsenceRequestLogic(mockHolidays, {} as any),
    );

    expect(result.current.subTypes).toHaveLength(1);
    expect(result.current.subTypes[0].label).toBe("Sub Licencia");
  });

  it("should use maxDaysPerYear as fallback for totalUnits", () => {
    (useWatch as any).mockImplementation(({ name }: { name: string }) => {
      if (name === "absenceTypeId") return "1";
      if (name === "requestedDays") return null;
      return null;
    });

    const { result } = renderHook(() =>
      useAbsenceRequestLogic(mockHolidays, {} as any),
    );

    expect(result.current.totalUnits).toBe(26);
  });

  it("should handle null absenceTypesRef gracefully", () => {
    (useFragment as any).mockReturnValue(null);
    
    const { result } = renderHook(() =>
      useAbsenceRequestLogic(mockHolidays, null),
    );

    expect(result.current.parentTypes).toHaveLength(0);
    expect(result.current.calculationType).toBe(CalculationType.CalendarDays);
  });

  it("should sync endDate with form state when it changes", () => {
    const expectedEndDate = new Date("2026-04-20");
    (useWatch as any).mockImplementation(({ name }: { name: string }) => {
      if (name === "startDate") return new Date("2026-04-13");
      if (name === "requestedDays") return 5;
      return null;
    });

    renderHook(() => useAbsenceRequestLogic(mockHolidays, {} as any));

    expect(mockSetValue).toHaveBeenCalledWith("endDate", expectedEndDate);
  });
});

