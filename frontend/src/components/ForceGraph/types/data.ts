/**
 * Type definitions for JSON data files
 */

import { GraphNode } from './nodes';
import { GraphLink } from './links';

export interface NodesData {
  [key: string]: GraphNode;
}

export interface EdgesData {
  [key: string]: GraphLink;
}