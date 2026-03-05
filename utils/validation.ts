/**
 * Simple validation utilities — no external dependencies.
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationErrors {
  [field: string]: string;
}

export function validate(
  data: Record<string, unknown>,
  schema: ValidationSchema,
): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `Ce champ est requis`;
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `Minimum ${rules.minLength} caractères`;
        continue;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `Maximum ${rules.maxLength} caractères`;
        continue;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `Format invalide`;
        continue;
      }
    }

    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors[field] = `Minimum ${rules.min}`;
        continue;
      }
      if (rules.max !== undefined && value > rules.max) {
        errors[field] = `Maximum ${rules.max}`;
        continue;
      }
    }

    if (rules.custom) {
      const msg = rules.custom(value);
      if (msg) {
        errors[field] = msg;
      }
    }
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PHONE_PATTERN = /^[+]?[\d\s()-]{8,}$/;
