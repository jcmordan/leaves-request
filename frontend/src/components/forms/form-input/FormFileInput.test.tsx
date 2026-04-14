import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormFileInput } from "./FormFileInput";
import { useForm, FormProvider } from "react-hook-form";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      attachment: null,
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("FormFileInput", () => {
  it("renders correctly in empty state", () => {
    render(
      <Wrapper>
        <FormFileInput
          name="attachment"
          label="Test File"
          text="Click to upload"
          maxSize="Max 5MB"
        />
      </Wrapper>
    );

    expect(screen.getByText("Test File")).toBeInTheDocument();
    expect(screen.getByText("Click to upload")).toBeInTheDocument();
    expect(screen.getByText("Max 5MB")).toBeInTheDocument();
  });

  it("triggers file input click when container is clicked", () => {
    render(
      <Wrapper>
        <FormFileInput
          name="attachment"
          label="Test File"
          text="Click to upload"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/Test File/i) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");
    
    // Find the container (the one with dashed border)
    const container = screen.getByText("Click to upload").parentElement;
    fireEvent.click(container!);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("displays filename when a file is selected", async () => {
    render(
      <Wrapper>
        <FormFileInput
          name="attachment"
          label="Test File"
          text="Click to upload"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/Test File/i) as HTMLInputElement;
    const file = new File(["hello"], "hello.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("hello.png")).toBeInTheDocument();
    expect(screen.getByText("0.00 MB")).toBeInTheDocument(); // 5 bytes is ~0 MB
  });

  it("clears the file when the clear button is clicked", async () => {
    render(
      <Wrapper>
        <FormFileInput
          name="attachment"
          label="Test File"
          text="Click to upload"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/Test File/i) as HTMLInputElement;
    const file = new File(["hello"], "hello.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });
    
    const clearButton = screen.getByTitle("Clear selection");
    fireEvent.click(clearButton);

    expect(screen.queryByText("hello.png")).not.toBeInTheDocument();
    expect(screen.getByText("Click to upload")).toBeInTheDocument();
  });

  it("shows asterisk when required", () => {
    render(
      <Wrapper>
        <FormFileInput
          name="attachment"
          label="Test File"
          required
          text="Click to upload"
        />
      </Wrapper>
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <Wrapper>
        <FormFileInput
          name="attachment"
          label="Test File"
          disabled
          text="Click to upload"
        />
      </Wrapper>
    );

    const input = screen.getByLabelText(/Test File/i) as HTMLInputElement;
    expect(input).toBeDisabled();
    
    // Check if the container reflects the disabled state (opacity-50)
    // We search for the outer container with the dashed border
    const container = screen.getByText("Click to upload").closest(".border-dashed");
    expect(container).toHaveClass("opacity-50");
  });
});
