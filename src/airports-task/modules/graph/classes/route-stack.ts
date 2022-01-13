export interface RouteStackValue {
  node: string;
  distance: number;
  pathVia: string[];
  combinedHeuristic: number;
}

export class RouteStack {
  private _stack = [] as RouteStackValue[];

  get stack(): RouteStackValue[] {
    return [...this._stack];
  }

  add(value: RouteStackValue) {
    this._stack.push(value);
  }

  pop() {
    this._stack.pop();
  }

  toString() {
    if (!this._stack.length) {
      return '';
    }
    return [...this._stack]
      .reverse()
      .map(({ node }) => node)
      .reduce((previousValue, currentValue) => {
        if (!previousValue) {
          return currentValue;
        }
        return `${previousValue}->${currentValue}`;
      }, '');
  }
}
