import { WeightSettings } from './WeightSettings';
import { ColorFilter } from './ColorFilter';
import { RankSizeToggle } from './RankSizeToggle';
import { Search } from './Search';
import type { GraphConfig } from '../../types/config';
import type { GraphNode } from '../../types/nodes';
import './Controls.css';

interface ControlsProps {
  config: GraphConfig;
  onConfigChange: (config: GraphConfig) => void;
  nodes: GraphNode[];
  onNodeSelect: (node: GraphNode | null, associatedNodes: Array<{node: GraphNode, weight: number}>) => void;  // Updated signature
  onNodeAndAssociatedSelect: (node: GraphNode | null, associatedNodes: Array<{node: GraphNode, weight: number}>) => void;
}


/**
 * Main controls container component
 * Manages weight settings, color filtering, and rank size toggle
 */
export const Controls: React.FC<ControlsProps> = ({ 
  config,
  onConfigChange,
  nodes,
  onNodeSelect,
  onNodeAndAssociatedSelect
}) => {
  return (
    <div className="controls">
      <Search 
        nodes={nodes} 
        onSelect={onNodeSelect}
        onNodeSelect={onNodeAndAssociatedSelect}
      />
      <WeightSettings 
        weightType={config.weightType}
        onWeightTypeChange={(type) => 
          onConfigChange({ ...config, weightType: type })}
      />
      <ColorFilter 
        selectedColors={config.selectedColors || []}
        onColorSelect={(colors) => 
          onConfigChange({ ...config, selectedColors: colors })}
      />
      <RankSizeToggle
        useRankSize={config.useRankSize}
        onToggle={(useRankSize) => 
          onConfigChange({ ...config, useRankSize })}
      />
    </div>
  );
};

// Only export the main Controls component
export type { ControlsProps };