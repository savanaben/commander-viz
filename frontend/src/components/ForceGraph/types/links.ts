/**
 * Core link type definitions for the force graph
 */

import { GraphNode } from './nodes';

export interface GraphLink {
    source: string | GraphNode;
    target: string | GraphNode;
    raw_weight: number;
    normalized_weight: number;
    uniqueness_weight: number;
    tribes_weight: number;          
    tribes_simplified_weight: number;
    composite_weight: number;
  }