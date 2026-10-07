import { Wall, Point2D, WallAngle, DiagonalCheck } from '../types/cad';

export interface AngleCalculationResult {
  vertex: Point2D;
  angleDeg: number;
  deviationFrom90Deg: number;
  isCalculatedFromLaser: boolean;
  diagonalDistanceMm?: number;
  v1: Point2D; // vector 1
  v2: Point2D; // vector 2
  armLength: number; // in mm for drawing the arc
}

export class AngleCalculator {
  /**
   * Find vertex where two walls meet and the outward vectors
   */
  public static analyzeWallCorner(w1: Wall, w2: Wall): {
    vertex: Point2D;
    outer1: Point2D;
    outer2: Point2D;
  } | null {
    const points1 = [w1.start, w1.end];
    const points2 = [w2.start, w2.end];

    let minDist = 150; // mm snap tolerance
    let sharedIndex1 = -1;
    let sharedIndex2 = -1;

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const d = Math.hypot(points1[i].x - points2[j].x, points1[i].y - points2[j].y);
        if (d < minDist) {
          minDist = d;
          sharedIndex1 = i;
          sharedIndex2 = j;
        }
      }
    }

    if (sharedIndex1 !== -1 && sharedIndex2 !== -1) {
      // Shared vertex found
      const vertex = points1[sharedIndex1];
      const outer1 = points1[1 - sharedIndex1];
      const outer2 = points2[1 - sharedIndex2];
      return { vertex, outer1, outer2 };
    }

    // If not touching directly, compute virtual intersection of the two lines
    const p1 = w1.start;
    const p2 = w1.end;
    const p3 = w2.start;
    const p4 = w2.end;

    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) > 1e-4) {
      const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
      const interX = p1.x + t * (p2.x - p1.x);
      const interY = p1.y + t * (p2.y - p1.y);
      const vertex = { x: Math.round(interX), y: Math.round(interY) };

      // pick the further endpoints from intersection
      const d1Start = Math.hypot(p1.x - interX, p1.y - interY);
      const d1End = Math.hypot(p2.x - interX, p2.y - interY);
      const outer1 = d1Start > d1End ? p1 : p2;

      const d2Start = Math.hypot(p3.x - interX, p3.y - interY);
      const d2End = Math.hypot(p4.x - interX, p4.y - interY);
      const outer2 = d2Start > d2End ? p3 : p4;

      return { vertex, outer1, outer2 };
    }

    return null;
  }

  /**
   * Calculate exact angle between two walls
   */
  public static calculateAngle(
    w1: Wall,
    w2: Wall,
    diagonalChecks: DiagonalCheck[] = []
  ): AngleCalculationResult | null {
    const corner = this.analyzeWallCorner(w1, w2);
    if (!corner) return null;

    const { vertex, outer1, outer2 } = corner;

    // Vectors from vertex along walls
    const v1 = { x: outer1.x - vertex.x, y: outer1.y - vertex.y };
    const v2 = { x: outer2.x - vertex.x, y: outer2.y - vertex.y };

    const len1 = Math.hypot(v1.x, v1.y);
    const len2 = Math.hypot(v2.x, v2.y);
    if (len1 < 10 || len2 < 10) return null;

    // Check if there is an existing laser diagonal check connecting outer1 and outer2
    let laserDiagonal: DiagonalCheck | undefined;
    for (const d of diagonalChecks) {
      const match1 = (Math.hypot(d.p1.x - outer1.x, d.p1.y - outer1.y) < 200 && Math.hypot(d.p2.x - outer2.x, d.p2.y - outer2.y) < 200);
      const match2 = (Math.hypot(d.p2.x - outer1.x, d.p2.y - outer1.y) < 200 && Math.hypot(d.p1.x - outer2.x, d.p1.y - outer2.y) < 200);
      if (match1 || match2) {
        laserDiagonal = d;
        break;
      }
    }

    let angleDeg: number;
    let isCalculatedFromLaser = false;
    let diagonalDistanceMm: number | undefined;

    // 1. If laser diagonal is measured, use Law of Cosines: c² = a² + b² - 2ab cos(C)
    // cos(C) = (a² + b² - c²) / (2ab)
    if (laserDiagonal && laserDiagonal.measuredLength > 0) {
      const a = w1.measuredLength || len1;
      const b = w2.measuredLength || len2;
      const c = laserDiagonal.measuredLength;

      const cosVal = (a * a + b * b - c * c) / (2 * a * b);
      const clampedCos = Math.max(-1, Math.min(1, cosVal));
      angleDeg = (Math.acos(clampedCos) * 180) / Math.PI;
      isCalculatedFromLaser = true;
      diagonalDistanceMm = c;
    } else {
      // 2. Vector dot product calculation
      const dot = v1.x * v2.x + v1.y * v2.y;
      const cosVal = dot / (len1 * len2);
      const clampedCos = Math.max(-1, Math.min(1, cosVal));
      angleDeg = (Math.acos(clampedCos) * 180) / Math.PI;

      // If both walls were measured by laser, mark as laser validated
      if (w1.isMeasuredWithLaser && w2.isMeasuredWithLaser) {
        isCalculatedFromLaser = true;
      }
    }

    angleDeg = Math.round(angleDeg * 10) / 10;
    const deviationFrom90Deg = Math.round((angleDeg - 90) * 10) / 10;

    return {
      vertex,
      angleDeg,
      deviationFrom90Deg,
      isCalculatedFromLaser,
      diagonalDistanceMm,
      v1,
      v2,
      armLength: Math.min(600, Math.min(len1, len2) * 0.25),
    };
  }

  /**
   * Recalculates all registered wall angles in the project when any wall length or laser reading changes
   */
  public static updateProjectAngles(
    walls: Wall[],
    existingAngles: WallAngle[],
    diagonals: DiagonalCheck[]
  ): WallAngle[] {
    const updated: WallAngle[] = [];

    for (const ang of existingAngles) {
      const w1 = walls.find((w) => w.id === ang.wall1Id);
      const w2 = walls.find((w) => w.id === ang.wall2Id);
      if (!w1 || !w2) continue;

      const calc = this.calculateAngle(w1, w2, diagonals);
      if (calc) {
        updated.push({
          ...ang,
          vertex: calc.vertex,
          angleDeg: calc.angleDeg,
          deviationFrom90Deg: calc.deviationFrom90Deg,
          isCalculatedFromLaser: calc.isCalculatedFromLaser,
          diagonalDistanceMm: calc.diagonalDistanceMm,
        });
      }
    }

    return updated;
  }
}
