import { defineWorkflow, type WorkflowStepsFileDefinition } from '@lunnoa/client';

/** A workflow from `lunnoa/workflows/` as plain data a client component can take as props. */
export interface AppWorkflow {
  slug: string;
  name: string;
  description?: string;
  /** Manually Run fields declared in the file. */
  inputs: Array<{ id: string; label: string; inputType: string; required: boolean; options?: string[] }>;
  /** Key of the last step. The page shows its output. */
  resultKey?: string;
}

/**
 * Reads a steps-format definition file. JSON imports type `"format": "steps"` as a plain
 * string, so the file is passed as `unknown`; `defineWorkflow` checks its shape at runtime.
 */
export function appWorkflow(file: unknown): AppWorkflow {
  const definition = defineWorkflow(file as WorkflowStepsFileDefinition);
  if (definition.format !== 'steps') {
    throw new Error(`${definition.slug}: appWorkflow reads steps-format files only.`);
  }
  return {
    slug: definition.slug,
    name: definition.name,
    description: definition.description,
    inputs: (definition.trigger.inputs ?? []).map((field) => ({
      id: String(field.id),
      label: String(field.label ?? field.id),
      inputType: String(field.inputType ?? 'text'),
      required: Boolean(field.required),
      options: Array.isArray(field.selectOptions)
        ? field.selectOptions.map((option: { value?: string }) => String(option.value))
        : undefined,
    })),
    resultKey: definition.steps.at(-1)?.key,
  };
}
