import type { ComponentPropsWithRef } from "react";

import { controlStyles, typographyStyles } from "@/lib/ui/styles";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function Form({ className, ...props }: ComponentPropsWithRef<"form">) {
  return (
    <form className={cn("flex min-w-0 flex-col gap-5", className)} {...props} />
  );
}
export function Field({ className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)} {...props} />
  );
}
export function Label({
  className, children, required = false, optionalLabel, ...props
}: ComponentPropsWithRef<"label"> & { required?: boolean; optionalLabel?: string }) {
  return (
    <label className={cn(typographyStyles.small, "font-semibold", className)} {...props}>
      {children}
      {required ? <Typography as="span" variant="inline" tone="danger" aria-hidden="true" className="ml-1">*</Typography> : optionalLabel ? <Typography as="span" variant="inline" className="font-normal"> ({optionalLabel})</Typography> : null}
    </label>
  );
}
export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return (
    <input
      className={cn(controlStyles, "min-h-11", className)}
      {...props}
    />
  );
}
export function Textarea({
  className,
  ...props
}: ComponentPropsWithRef<"textarea">) {
  return (
    <textarea
      className={cn(controlStyles, "min-h-32 resize-y", className)}
      {...props}
    />
  );
}

export function Fieldset({
  className,
  ...props
}: ComponentPropsWithRef<"fieldset">) {
  return <fieldset className={cn("min-w-0 space-y-3", className)} {...props} />;
}
export function Legend({
  className,
  ...props
}: ComponentPropsWithRef<"legend">) {
  return (
    <legend className={cn(typographyStyles.caption, className)} {...props} />
  );
}
