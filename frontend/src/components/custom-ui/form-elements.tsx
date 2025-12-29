import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../../components/ui/button";

export const FieldDescription = ({ description }: { description: string }) => {
  return (
    <p className="text-[10px] italic text-slate-500 dark:text-slate-400">
      {description}
    </p>
  );
};

export const FieldErrorMessage = ({ message }: { message: string }) => {
  return (
    <em role="alert" className="text-red-500 text-[10px]">
      {message}
    </em>
  );
};

export const PasswordVisibilityToggle = ({
  showPassword,
  setShowPassword,
}: {
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  );
};

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements: boolean;
}

/**
 * Password Strength Indicator Component
 * Shows real-time validation checklist for password requirements
 */
export const PasswordStrengthIndicator = ({
  password,
  showRequirements,
}: PasswordStrengthIndicatorProps) => {
  if (!showRequirements || !password) return null;

  const requirements = [
    {
      test: password.length >= 8,
      label: "Pelo menos 8 caracteres",
    },
    {
      test: /[a-z]/.test(password),
      label: "Uma letra minúscula",
    },
    {
      test: /[A-Z]/.test(password),
      label: "Uma letra maiúscula",
    },
    {
      test: /\d/.test(password),
      label: "Um número",
    },
    {
      test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      label: "Um caractere especial",
    },
  ];

  return (
    <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Requisitos da senha:
      </h4>
      <div className="space-y-1">
        {requirements.map((check, index) => (
          <div key={index} className="flex items-center space-x-2">
            {check.test ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-slate-400" />
            )}
            <span
              className={`text-xs ${
                check.test
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
}

/**
 * Password Match Indicator Component
 * Shows if password and confirmation match
 */
export const PasswordMatchIndicator = ({
  password,
  confirmPassword,
}: PasswordMatchIndicatorProps) => {
  if (!confirmPassword) return null;

  const passwordsMatch = password === confirmPassword;

  return (
    <div className="flex items-center space-x-2">
      {passwordsMatch ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
      <span
        className={`text-sm ${
          passwordsMatch
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {passwordsMatch ? "As senhas coincidem" : "As senhas não coincidem"}
      </span>
    </div>
  );
};

/**
 * Password Input With Toggle Component
 * Reusable password input with visibility toggle and error display
 */
interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  placeholder?: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error?: string;
  className?: string;
}

import type { LucideIcon } from "lucide-react";

export const InputLabel = ({
  label,
  Icon,
  iconClassName = "",
}: {
  label: string;
  Icon: LucideIcon;
  iconClassName?: string;
}) => {
  return (
    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${iconClassName}`} />
      {label}
    </label>
  );
};

export const PasswordInputWithToggle = ({
  value,
  onChange,
  onBlur,
  placeholder = "Digite sua senha",
  showPassword,
  setShowPassword,
  error,
  className = "",
}: PasswordInputProps) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`h-12 text-base border-slate-200 dark:border-slate-600 focus:border-primary focus:ring-primary/20 pr-12 ${
            error ? "border-red-500 focus:border-red-500" : ""
          } ${className}`}
        />
        <PasswordVisibilityToggle
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export const SubmitButton = ({
  disabled,
  submitting,
  submittingText,
  text,
  buttonType = "submit",
  variant = "default",
}: {
  disabled: boolean;
  submitting: boolean;
  submittingText: string;
  text: string;
  buttonType: "submit" | "button";
  variant?: "default" | "outline";
}) => {
  return (
    <Button
      variant={variant}
      type={buttonType}
      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {submittingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
};
