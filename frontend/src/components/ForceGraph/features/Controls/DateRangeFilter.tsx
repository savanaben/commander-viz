// frontend/src/components/ForceGraph/features/Controls/DateRangeFilter.tsx
import React, { useMemo, useState } from 'react';
import { RangeSlider, Stack, Text } from '@mantine/core';
import { GraphNode } from '../../types/nodes';

interface DateRangeFilterProps {
  nodes: GraphNode[];
  dateRange: {
    start: string;
    end: string;
  };
  onDateRangeChange: (range: { start: string; end: string }) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  nodes,
  dateRange,
  onDateRangeChange,
}) => {
  // Set fixed ranges
  const { minYear, maxYear } = useMemo(() => ({
    minYear: 1994,
    maxYear: new Date().getFullYear()
  }), []);

  // Initialize with full ranges
  const [yearRange, setYearRange] = useState<[number, number]>([minYear, maxYear]);
  const [monthRange, setMonthRange] = useState<[number, number]>([0, 11]);

  // Update the parent component with new date range
  const updateDateRange = (years: [number, number], months: [number, number]) => {
    const startDate = new Date(years[0], months[0], 1);
    const endDate = new Date(years[1], months[1] + 1, 0); // Last day of the month
    
    onDateRangeChange({
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  };

  // Handle year range changes
  const handleYearChange = (newYears: [number, number]) => {
    setYearRange(newYears);
    updateDateRange(newYears, monthRange);
  };

  // Handle month range changes
  const handleMonthChange = (newMonths: [number, number]) => {
    setMonthRange(newMonths);
    updateDateRange(yearRange, newMonths);
  };

  // Format month labels
  const formatMonth = (month: number) => {
    return new Date(2000, month).toLocaleString('default', { month: 'short' });
  };

  return (
    <div className="control-group">
      <Stack gap="md">
        <div>
          <Text size="sm" weight={500} mb={8}>Year Range</Text>
          <RangeSlider
            defaultValue={[minYear, maxYear]}
            min={minYear}
            max={maxYear}
            step={1}
            label={(value) => `${value}`}
            marks={[
              { value: minYear, label: minYear.toString() },
              { value: maxYear, label: maxYear.toString() }
            ]}
            size="md"
            thumbSize={16}
            onChangeEnd={handleYearChange}
            minRange={0}
            allowCross={false}
          />
        </div>
        
        <div>
          <Text size="sm" weight={500} mb={8}>Month Range</Text>
          <RangeSlider
            defaultValue={[0, 11]}
            min={0}
            max={11}
            step={1}
            label={formatMonth}
            marks={[
              { value: 0, label: 'Jan' },
              { value: 5, label: 'Jun' },
              { value: 11, label: 'Dec' }
            ]}
            size="md"
            thumbSize={16}
            onChangeEnd={handleMonthChange}
            minRange={0}
            allowCross={false}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', color: '#666' }}>
          <Text size="sm">
            {formatMonth(monthRange[0])} {yearRange[0]}
          </Text>
          <Text size="sm">
            {formatMonth(monthRange[1])} {yearRange[1]}
          </Text>
        </div>
      </Stack>
    </div>
  );
};