import { useMemo } from 'react';
import { Button, Group, ScrollArea } from '@mantine/core';
import type { GraphNode } from '../../types/nodes';
import { useGraphStore } from '../../../../store/GraphContext';
import { Accordion } from '../../../Accordion';

interface TribeFilterProps {
  nodes: GraphNode[];
}

export const TribeFilter: React.FC<TribeFilterProps> = ({ nodes }) => {
  const { config, selectedTribe, updateSelectedTribe } = useGraphStore();

  // Filter nodes based on current color and date filters
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // Filter by date range
      const cardDate = new Date(node.released_at);
      const startDate = new Date(config.dateRange.start);
      const endDate = new Date(config.dateRange.end);
      const isInDateRange = cardDate >= startDate && cardDate <= endDate;

      // Filter by color
      const hasSelectedColor = config.selectedColors.length === 0 || (() => {
        // Handle colorless cards
        if (node.colors.length === 0) {
          return config.selectedColors.includes('C');
        }
        // For colored cards, check if ALL of the card's colors are in the selected colors
        return node.colors.every(color => config.selectedColors.includes(color));
      })();

      return isInDateRange && hasSelectedColor;
    });
  }, [nodes, config.dateRange, config.selectedColors]);

  // Calculate tribe popularity across filtered nodes
  const tribePopularity = useMemo(() => {
    const tribeCounts = new Map<string, { total: number, topThree: number }>();
    
    filteredNodes.forEach(node => {
      node.tribes?.forEach((tribe, index) => {
        const counts = tribeCounts.get(tribe.name) || { total: 0, topThree: 0 };
        counts.total += 1;
        // Only increment topThree count if it's in the first 3 positions
        if (index < 3) {
          counts.topThree += 1;
        }
        tribeCounts.set(tribe.name, counts);
      });
    });

    return Array.from(tribeCounts.entries())
      .sort((a, b) => b[1].total - a[1].total) // Sort by total count descending
      .map(([name, counts]) => ({
        name,
        total: counts.total,
        topThree: counts.topThree
      }));
  }, [filteredNodes]);

  return (
    <Accordion title="Tribes">
      <ScrollArea h={160} type="auto" offsetScrollbars>
        <Group gap="xs" wrap="wrap">
          {tribePopularity.map(tribe => (
            <Button
              key={tribe.name}
              size="s"
              variant={selectedTribe === tribe.name ? "filled" : "light"}
              onClick={() => updateSelectedTribe(selectedTribe === tribe.name ? null : tribe.name)}
            >
              {tribe.name} ({tribe.topThree})
            </Button>
          ))}
        </Group>
      </ScrollArea>
    </Accordion>
  );
}; 