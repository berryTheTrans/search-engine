export interface SearchSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  text: string;
  sources: SearchSource[];
  relatedQueries?: string[];
  latency: number;
  timestamp: string;
}

export enum SearchMode {
  SURFACE = 'SURFACE',
  DEEP = 'DEEP', // Represents "Onion/Deep Web" research depth
}

export interface IndexStat {
  name: string;
  value: number;
  total: number;
  color: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}