export function getTotalAggregation(selected, options): string {
  if (selected.length > 0) {
    let selectedOptions = options.filter((option) =>
      selected.includes(option.value)
    );
    return ` (${selectedOptions.reduce(
      (total_aggregation, option) => total_aggregation + option.count,
      0
    )})`;
  }
  return '';
}
