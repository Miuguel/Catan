export class Hex {
  q: number;
  r: number;
  size: number;

  constructor(q: number, r: number, size: number) {
    this.q = q;
    this.r = r;
    this.size = size;
  }

  getPixelPosition() {
    const x = this.size * Math.sqrt(3) * (this.q + this.r / 2);
    const y = this.size * 1.5 * this.r;

    return { x, y };
  }
}