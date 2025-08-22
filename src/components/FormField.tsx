import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "date" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({ label, name, type = "text", placeholder, required, options, value, onChange, error, className, ...props }, ref) => {
    const fieldId = `field-${name}`;

    const renderField = () => {
      switch (type) {
        case "textarea":
          return (
            <Textarea
              id={fieldId}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                "min-h-[100px] bg-form-surface border-input-border focus:border-input-focus",
                error && "border-destructive focus:border-destructive"
              )}
              {...props}
            />
          );
        case "select":
          return (
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger className={cn(
                "bg-form-surface border-input-border focus:border-input-focus",
                error && "border-destructive"
              )}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        default:
          return (
            <Input
              ref={ref as React.Ref<HTMLInputElement>}
              id={fieldId}
              name={name}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(
                "bg-form-surface border-input-border focus:border-input-focus",
                error && "border-destructive focus:border-destructive"
              )}
              {...props}
            />
          );
      }
    };

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {renderField()}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;