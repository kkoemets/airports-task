import { binaryInsert } from 'binary-insert';

export interface PriorityQueueValue {
  node: string;
  distance: number;
  pathVia: string[];
  combinedHeuristic: number;
}

export class PriorityQueue {
  private _queue = [] as PriorityQueueValue[];

  add(value: PriorityQueueValue) {
    return binaryInsert(
      this._queue,
      value,
      (a, b) => a.combinedHeuristic - b.combinedHeuristic,
    );
  }

  shift(): PriorityQueueValue {
    return this._queue.shift();
  }

  size(): number {
    return this._queue.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }
}
