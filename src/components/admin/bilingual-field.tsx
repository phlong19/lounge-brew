import {
  Field,
  Fieldset,
  Input,
  Label,
  Legend,
  Textarea,
} from "@/components/ui/form";
import { Grid } from "@/components/ui/layout";
import { Typography } from "@/components/ui/typography";

type Props = {
  legend: string;
  vietnameseLabel: string;
  englishLabel: string;
  vietnameseValue?: string;
  englishValue?: string;
  vietnamesePlaceholder?: string;
  englishPlaceholder?: string;
  textarea?: boolean;
};
export function BilingualFieldPair({
  legend,
  vietnameseLabel,
  englishLabel,
  vietnameseValue,
  englishValue,
  vietnamesePlaceholder,
  englishPlaceholder,
  textarea,
}: Props) {
  return (
    <Fieldset>
      <Legend>{legend}</Legend>
      <Grid className="md:grid-cols-2" gap="md">
        <Field>
          <Label>
            <Typography as="span" variant="small">
              {vietnameseLabel}
            </Typography>
            {textarea ? (
              <Textarea
                defaultValue={vietnameseValue}
                placeholder={vietnamesePlaceholder}
                readOnly
                className="mt-2"
              />
            ) : (
              <Input
                defaultValue={vietnameseValue}
                placeholder={vietnamesePlaceholder}
                readOnly
                className="mt-2"
              />
            )}
          </Label>
        </Field>
        <Field>
          <Label>
            <Typography as="span" variant="small">
              {englishLabel}
            </Typography>
            {textarea ? (
              <Textarea
                defaultValue={englishValue}
                placeholder={englishPlaceholder}
                readOnly
                className="mt-2"
              />
            ) : (
              <Input
                defaultValue={englishValue}
                placeholder={englishPlaceholder}
                readOnly
                className="mt-2"
              />
            )}
          </Label>
        </Field>
      </Grid>
    </Fieldset>
  );
}
