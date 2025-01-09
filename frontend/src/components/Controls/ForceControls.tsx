import { GraphConfig } from '../../types/graph';

interface ForceControlsProps {
  config: GraphConfig;
  onConfigChange: (config: GraphConfig) => void;
}

const ForceControls = ({ config, onConfigChange }: ForceControlsProps) => {
  const handleChange = (key: keyof GraphConfig, value: number | string | null) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="force-controls">
      <h3>Force Controls</h3>
      
      {/* Node Forces */}
      <div className="control-section">
        <h4>Node Forces</h4>
        <div className="control-group">
          <label>
            Charge Strength
            <span className="value-display">{config.chargeStrength}</span>
            <input
              type="range"
              min="-1000"
              max="1000"
              step="10"
              value={config.chargeStrength}
              onChange={(e) => handleChange('chargeStrength', Number(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Collision Strength
            <span className="value-display">{config.collisionStrength}</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.collisionStrength}
              onChange={(e) => handleChange('collisionStrength', Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Link Forces */}
      <div className="control-section">
        <h4>Link Forces</h4>
        <div className="control-group">
          <label>
            Link Distance
            <span className="value-display">{config.linkDistance}</span>
            <input
              type="range"
              min="10"
              max="3000"
              step="5"
              value={config.linkDistance}
              onChange={(e) => handleChange('linkDistance', Number(e.target.value))}
            />
          </label>
        </div>

        <label>
        Link Strength:
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={config.linkStrength}
          onChange={(e) => onConfigChange({ ...config, linkStrength: Number(e.target.value) })}
        />
      </label>

        <div className="control-group">
          <label>
            Link Spring Strength
            <span className="value-display">{config.linkSpring}</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.linkSpring}
              onChange={(e) => handleChange('linkSpring', Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Global Forces */}
      <div className="control-section">
        <h4>Global Forces</h4>
        <div className="control-group">
          <label>
            Gravity Strength
            <span className="value-display">{config.gravityStrength}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.gravityStrength}
              onChange={(e) => handleChange('gravityStrength', Number(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Center Force
            <span className="value-display">{config.centerForce}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.centerForce}
              onChange={(e) => handleChange('centerForce', Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Visual Scaling */}
      <div className="control-section">
        <h4>Visual Settings</h4>
        <div className="control-group">
          <label>
            Node Size Scale
            <span className="value-display">{config.nodeSizeScale}</span>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={config.nodeSizeScale}
              onChange={(e) => handleChange('nodeSizeScale', Number(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Link Width Scale
            <span className="value-display">{config.linkWidthScale}</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={config.linkWidthScale}
              onChange={(e) => handleChange('linkWidthScale', Number(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Layout Mode
            <select
              value={config.dagMode || 'none'}
              onChange={(e) => handleChange('dagMode', e.target.value === 'none' ? null : e.target.value)}
            >
              <option value="none">Force Directed</option>
              <option value="td">Top Down</option>
              <option value="bu">Bottom Up</option>
              <option value="lr">Left to Right</option>
              <option value="rl">Right to Left</option>
              <option value="radialout">Radial Out</option>
              <option value="radialin">Radial In</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ForceControls;