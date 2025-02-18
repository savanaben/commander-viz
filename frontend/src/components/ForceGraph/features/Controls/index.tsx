import { WeightSettings } from './WeightSettings';
import { ColorFilter } from './ColorFilter';
import { RankSizeToggle } from './RankSizeToggle';
import { Search } from './Search';
import { TribeFilter } from './TribeFilter';
import type { GraphConfig } from '../../types/config';
import type { GraphNode } from '../../types/nodes';
import type { GraphData } from '../../types/config';
import { DateRangeFilter } from './DateRangeFilter';
import { ForceGraphMethods } from 'react-force-graph-2d';
import { RefObject } from 'react';
import './Controls.css';

interface ControlsProps {
  config: GraphConfig;
  onConfigChange: (config: GraphConfig) => void;
  nodes: GraphNode[];
  data: GraphData;
  graphRef: RefObject<ForceGraphMethods>;
}

/**
 * Main controls container component
 * Manages weight settings, color filtering, and rank size toggle
 */
export const Controls: React.FC<ControlsProps> = ({ 
  config,
  onConfigChange,
  nodes,
  data,
  graphRef
}) => {
  return (
    <div className="controls">
      <Search 
        nodes={nodes}
        data={data}
        config={config}
        graphRef={graphRef}
      />
      <DateRangeFilter
        nodes={nodes}
        dateRange={config.dateRange}
        onDateRangeChange={(range) => 
          onConfigChange({ ...config, dateRange: range })}
      />
      <TribeFilter nodes={nodes} />
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