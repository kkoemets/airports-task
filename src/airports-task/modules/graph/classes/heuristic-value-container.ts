interface ValueContainer {
  [nodeName: string]: number;
}

export class HeuristicValueContainer {
  private _container: ValueContainer = {};

  add(nodeName: string, value: number) {
    this._container[nodeName] = value;
  }

  get(nodeName: string): number | undefined {
    return this._container[nodeName];
  }
}
