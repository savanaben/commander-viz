import React from 'react';
import { SimpleGrid, Image, Box, Text } from '@mantine/core';
import type { GraphNode } from '../ForceGraph/types/nodes';
import { useGraphStore } from '../../store/GraphContext';
import './Sidebar.css';

interface AssociatedCardsProps {
  selectedNode: GraphNode;
  associatedNodes: Array<{node: GraphNode, weight: number}>;
}

export const AssociatedCards: React.FC<AssociatedCardsProps> = ({
  selectedNode,
  associatedNodes
}) => {
  const { config } = useGraphStore();

  // Filter associated nodes based on current config
  const filteredNodes = associatedNodes.filter(({ node }) => {
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

  // Sort filtered nodes by weight
  const sortedNodes = [...filteredNodes].sort((a, b) => b.weight - a.weight);

  // Calculate columns based on sidebar width
  const sidebarWidth = config.sidebarWidth || 600;
  const cardWidth = 200; // Minimum card width
  const columns = Math.floor(sidebarWidth / cardWidth);

  return (
    <Box className="associated-cards">
      <Box className="selected-card">
        <div className="selected-card-title">
          {selectedNode.name || selectedNode.id}
        </div>
        <Image
          src={selectedNode.image_uris.normal}
          alt={selectedNode.name}
          fit="contain"
          className="card-image"
        />
      </Box>
      <SimpleGrid 
        cols={columns}
        spacing="xs"
        verticalSpacing="xs"
        className="associated-cards-grid"
      >
        {sortedNodes.map(({ node, weight }) => (
          <Box key={node.id} className="card-item" pos="relative">
            <Image
              src={node.image_uris.normal}
              alt={node.name}
              fit="contain"
              className="card-image"
            />
            <Text 
              className="card-weight"
              size="sm"
              fw={700}
            >
              {weight.toFixed(2)}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};