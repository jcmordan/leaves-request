import { render, screen } from "@testing-library/react";
import { useWatch } from "react-hook-form";
import { SubmitAbsentRequestForm, getSubmitRequestSchema } from "./SubmitAbsentRequestForm";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CalculationType } from "@/__generated__/graphql";
import { useAbsenceRequestLogic } from "./hooks/useAbsenceRequestLogic";

// Mock dependencies
vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual("react-hook-form");
  return {
    ...actual as any,
    useWatch: vi.fn(),
  };
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/en/requests",
}));

vi.mock("@apollo/client", () => ({
  gql: (s: any) => s,
  useLazyQuery: vi.fn(() => [vi.fn(), { data: null, loading: false }]),
  useQuery: vi.fn(() => ({ data: null, loading: false, error: null })),
}));

vi.mock("@/__generated__", () => ({
  useFragment: vi.fn(),
  graphql: (s: any) => s,
  ABSENCE_TYPES_QUERY_FRAGMENT: {},
}));

vi.mock("./hooks/useAbsenceRequestLogic", () => ({
  useAbsenceRequestLogic: vi.fn(),
}));

vi.mock("@/app/[locale]/(root)/employees/sheets/hooks/useEmployeeSearch", () => ({
  useEmployeeSearch: vi.fn(() => ({
    onSearch: vi.fn(),
    options: [],
    loading: false,
  })),
}));

vi.mock("./sections/EmployeeSelector", () => ({
  default: () => <div data-testid="employee-selector" />,
}));

vi.mock("./sections/AbsenceCategorySection", () => ({
  AbsenceCategorySection: () => <div data-testid="category-section" />,
}));
vi.mock("./sections/ScheduleSection", () => ({
  ScheduleSection: () => <div data-testid="schedule-section" />,
}));
vi.mock("./sections/MedicalContextSection", () => ({
  MedicalContextSection: () => <div data-testid="medical-section" />,
}));

vi.mock("./sections/AdditionalNotesSection", () => ({
  AdditionalNotesSection: () => <div data-testid="notes-section" />,
}));

const mockAbsenceTypes = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Vacaciones",
    requiresDoctor: false,
    requiresAttachment: false,
    calculationType: CalculationType.WorkingDays,
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Licencia Médica",
    requiresDoctor: true,
    requiresAttachment: true,
    calculationType: CalculationType.CalendarDays,
  },
];

const Wrapper = ({ children, absenceTypes }: { children: React.ReactNode, absenceTypes: any[] }) => {
  const methods = useForm({
    resolver: zodResolver(getSubmitRequestSchema((k) => k, absenceTypes)),
    defaultValues: {
      startDate: new Date(),
      requestedDays: 1,
      reason: "",
    },
  });
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
};

describe("SubmitAbsentRequestForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAbsenceRequestLogic as any).mockReturnValue({
      subTypes: [],
      isSickLeave: false,
      endDate: new Date(),
      totalUnits: 1,
      parentTypes: [],
      selectedType: null,
    });
  });

  it("renders basic sections by default", () => {
    render(
      <Wrapper absenceTypes={mockAbsenceTypes}>
        <SubmitAbsentRequestForm holidays={[]} />
      </Wrapper>
    );

    expect(screen.getByTestId("category-section")).toBeInTheDocument();
    expect(screen.getByTestId("schedule-section")).toBeInTheDocument();
    expect(screen.getByTestId("notes-section")).toBeInTheDocument();
    expect(screen.queryByTestId("medical-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("employee-selector")).not.toBeInTheDocument();
  });

  it("renders employee selector when forSomeoneElse is true", () => {
    vi.mocked(useWatch).mockReturnValue(true);

    render(
      <Wrapper absenceTypes={mockAbsenceTypes}>
        <SubmitAbsentRequestForm holidays={[]} />
      </Wrapper>
    );

    expect(screen.getByTestId("employee-selector")).toBeInTheDocument();
  });

  it("renders medical section when isSickLeave is true", () => {
    (useAbsenceRequestLogic as any).mockReturnValue({
      subTypes: [],
      isSickLeave: true,
      endDate: new Date(),
      totalUnits: 1,
      parentTypes: [],
      selectedType: mockAbsenceTypes[1],
    });

    render(
      <Wrapper absenceTypes={mockAbsenceTypes}>
        <SubmitAbsentRequestForm holidays={[]} />
      </Wrapper>
    );

    expect(screen.getByTestId("medical-section")).toBeInTheDocument();
  });

  describe("Validation Schema (getSubmitRequestSchema)", () => {
    const t = (k: string) => k;

    const validData = {
      startDate: new Date(),
      endDate: new Date(),
      requestedDays: 1,
      reason: "Reason",
    };

    const mockTypeId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

    it("validates attachment requirement", () => {
      const types = [{ id: mockTypeId, requiresAttachment: true }];
      const schema = getSubmitRequestSchema(t, types);

      const result = schema.safeParse({
        ...validData,
        absenceTypeId: mockTypeId,
        file: null,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message === "attachmentRequired")).toBe(true);
      }
    });

    it("validates diagnosis and treating doctor requirement", () => {
      const types = [{ id: mockTypeId, requiresDoctor: true }];
      const schema = getSubmitRequestSchema(t, types);

      const result = schema.safeParse({
        ...validData,
        absenceTypeId: mockTypeId,
        diagnosis: "",
        treatingDoctor: "   ",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.some((i) => i.message === "diagnosisRequired")).toBe(true);
        expect(issues.some((i) => i.message === "treatingDoctorRequired")).toBe(true);
      }
    });

    it("falls back to parent logic if subtype is missing", async () => {
      const schema = getSubmitRequestSchema(t, mockAbsenceTypes);
      
      const result = await schema.safeParseAsync({
        absenceTypeId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        absenceSubTypeId: null,
        startDate: new Date(),
        endDate: new Date(),
        requestedDays: 1,
        reason: "Sick",
        diagnosis: "Cold",
        treatingDoctor: "Dr. Smith",
        file: new File([], "test.pdf"),
      });

      expect(result.success).toBe(true);
    });
  });
});

