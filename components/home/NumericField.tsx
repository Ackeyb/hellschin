type NumericFieldProps = {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
};

export default function NumericField({ label, unit, value, onChange }: NumericFieldProps) {
  return (
    <label className="numeric-field">
      <span>{label}</span>
      <input
        className="config-input"
        inputMode="numeric"
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
        type="text"
        value={value}
      />
      <span>{unit}</span>
    </label>
  );
}
