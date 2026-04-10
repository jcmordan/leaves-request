import { FormTextInput } from "@/components/forms";
import { FormSection } from "./FormSection";
import { useTranslations } from "next-intl";

/**
 * Form section for employee identity and contact information.
 *
 * @param {IdentitySectionProps} props - The component props.
 * @returns {JSX.Element} The rendered IdentitySection component.
 */
export const IdentitySection = () => {
  const tc = useTranslations("common");
  return (
    <FormSection title="Identity & Contact">
      <div className="grid grid-cols-2 gap-4 w-full">
        <FormTextInput
          name="fullName"
          label={tc("fullName")}
          placeholder="John Doe"
          required
        />
        <FormTextInput
          name="email"
          label={tc("email")}
          placeholder="john.doe@company.com"
        />
        <FormTextInput
          name="employeeCode"
          label={tc("employeeCode")}
          placeholder="EMP001"
          required
        />
        <FormTextInput
          name="an8"
          label={tc("an8")}
          placeholder="1234567"
          required
        />
        <FormTextInput
          name="nationalId"
          label={tc("nationalId")}
          placeholder="ID-12345"
          required
        />
      </div>
    </FormSection>
  );
};
