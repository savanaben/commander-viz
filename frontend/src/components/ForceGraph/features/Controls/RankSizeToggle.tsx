import React from 'react';

interface RankSizeToggleProps {
  useRankSize: boolean;
  onToggle: (useRankSize: boolean) => void;
}

export const RankSizeToggle: React.FC<RankSizeToggleProps> = ({ 
  useRankSize, 
  onToggle 
}) => {
  return (
    <div className="control-section">
      <label className="control-label">
        <input
          type="checkbox"
          checked={useRankSize}
          onChange={(e) => onToggle(e.target.checked)}
        />
        Size by Popularity
      </label>
    </div>
  );
};