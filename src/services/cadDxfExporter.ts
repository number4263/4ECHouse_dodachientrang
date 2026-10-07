import {
  ProjectData,
  Wall,
  CurvedWall,
  Opening,
  Column,
  Staircase,
  MepElement,
  LandscapeElement,
  ElevSectEntity,
  DiagonalCheck,
  Room,
  WallAngle,
} from '../types/cad';
import { AngleCalculator } from './angleCalculator';

export class CadDxfExporter {
  public static generateDxf(project: ProjectData): string {
    const lines: string[] = [];

    const add = (code: number, value: string | number) => {
      lines.push(code.toString());
      lines.push(value.toString());
    };

    // 1. HEADER SECTION
    add(0, 'SECTION');
    add(2, 'HEADER');
    add(9, '$ACADVER');
    add(1, 'AC1015'); // AutoCAD 2000/2002 DXF version - maximum compatibility
    add(9, '$INSUNITS');
    add(70, 4); // 4 = Millimeters
    add(9, '$MEASUREMENT');
    add(70, 1); // 1 = Metric
    add(9, '$LUNITS');
    add(70, 2); // Decimal
    add(9, '$LUPREC');
    add(70, 0); // 0 decimals for mm in architectural drawings
    add(0, 'ENDSEC');

    // 2. TABLES SECTION (LAYERS & STYLES)
    add(0, 'SECTION');
    add(2, 'TABLES');

    // Layer table
    add(0, 'TABLE');
    add(2, 'LAYER');
    add(70, 16);

    const layers = [
      { name: '0', color: 7, ltype: 'CONTINUOUS' },
      { name: 'A-WALL', color: 7, ltype: 'CONTINUOUS' }, // White/Black: Cut Walls
      { name: 'A-WALL-CRV', color: 2, ltype: 'CONTINUOUS' }, // Yellow: Curved Walls
      { name: 'A-DOOR', color: 1, ltype: 'CONTINUOUS' }, // Red: Doors
      { name: 'A-GLAZ', color: 4, ltype: 'CONTINUOUS' }, // Cyan: Windows/Glazing
      { name: 'A-COLU', color: 3, ltype: 'CONTINUOUS' }, // Green: Columns
      { name: 'A-STRS', color: 30, ltype: 'CONTINUOUS' }, // Orange: Staircases
      { name: 'E-POWR', color: 1, ltype: 'CONTINUOUS' }, // Red: Electrical & DB Panel
      { name: 'P-SANR', color: 5, ltype: 'CONTINUOUS' }, // Blue: Plumbing & Drainage
      { name: 'M-HVAC', color: 4, ltype: 'CONTINUOUS' }, // Cyan: Air conditioning
      { name: 'F-PROT', color: 10, ltype: 'CONTINUOUS' }, // Fire protection
      { name: 'A-PLNT', color: 82, ltype: 'CONTINUOUS' }, // Green: Landscape & Trees
      { name: 'A-ELEV', color: 6, ltype: 'CONTINUOUS' }, // Magenta: Elevation & Slabs
      { name: 'A-DIMS', color: 2, ltype: 'CONTINUOUS' }, // Yellow: Dimensions
      { name: 'A-ROOM', color: 6, ltype: 'CONTINUOUS' }, // Magenta: Room names & area
      { name: 'A-DIAG', color: 5, ltype: 'DASHED' },     // Blue: Diagonal laser checks
      { name: 'A-NOTE', color: 8, ltype: 'CONTINUOUS' }, // Gray: Notes
    ];

    for (const lyr of layers) {
      add(0, 'LAYER');
      add(2, lyr.name);
      add(70, 0);
      add(62, lyr.color);
      add(6, lyr.ltype);
    }
    add(0, 'ENDTAB');

    // Text Style Table
    add(0, 'TABLE');
    add(2, 'STYLE');
    add(70, 1);
    add(0, 'STYLE');
    add(2, 'STANDARD');
    add(70, 0);
    add(40, 0.0);
    add(41, 1.0);
    add(50, 0.0);
    add(71, 0);
    add(42, 250.0);
    add(3, 'arial.ttf');
    add(4, '');
    add(0, 'ENDTAB');

    add(0, 'ENDSEC'); // END TABLES

    // 3. BLOCKS SECTION
    add(0, 'SECTION');
    add(2, 'BLOCKS');
    add(0, 'ENDSEC');

    // 4. ENTITIES SECTION
    add(0, 'SECTION');
    add(2, 'ENTITIES');

    // Render Walls
    for (const wall of project.walls) {
      this.writeWallDxf(wall, add);
    }

    // Render Openings (Doors & Windows)
    for (const op of project.openings) {
      const wall = project.walls.find((w) => w.id === op.wallId);
      if (wall) {
        this.writeOpeningDxf(wall, op, add);
      }
    }

    // Render Curved Walls
    if (project.curvedWalls) {
      for (const cw of project.curvedWalls) {
        this.writeCurvedWallDxf(cw, add);
      }
    }

    // Render Columns
    for (const col of project.columns) {
      this.writeColumnDxf(col, add);
    }

    // Render Staircases
    if (project.staircases) {
      for (const st of project.staircases) {
        this.writeStaircaseDxf(st, add);
      }
    }

    // Render MEP Elements
    if (project.mepElements) {
      for (const mep of project.mepElements) {
        this.writeMepDxf(mep, add);
      }
    }

    // Render Landscape Elements
    if (project.landscapeElements) {
      for (const ls of project.landscapeElements) {
        this.writeLandscapeDxf(ls, add);
      }
    }

    // Render Elevation & Section entities
    if (project.elevSectEntities) {
      for (const es of project.elevSectEntities) {
        this.writeElevSectDxf(es, add);
      }
    }

    // Render Dimensions for all walls
    for (const wall of project.walls) {
      this.writeWallDimensionDxf(wall, add);
    }

    // Render Diagonal Laser Checks
    for (const diag of project.diagonalChecks) {
      this.writeDiagonalDxf(diag, add);
    }

    // Render Measured Wall Angles
    if (project.angles) {
      for (const ang of project.angles) {
        this.writeAngleDxf(ang, project.walls, add);
      }
    }

    // Render Rooms (Labels & Area)
    for (const room of project.rooms) {
      this.writeRoomDxf(room, project.walls, add);
    }

    // Title Block & Info Stamp (Góc bản vẽ hiện trạng)
    this.writeTitleBlockDxf(project, add);

    add(0, 'ENDSEC'); // END ENTITIES

    // 5. EOF
    add(0, 'EOF');

    return lines.join('\r\n');
  }

  // Draw wall as parallel double lines representing inner and outer face (or thick polyline)
  private static writeWallDxf(wall: Wall, add: (c: number, v: string | number) => void) {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;

    const halfT = wall.thickness / 2;
    const nx = (-dy / len) * halfT;
    const ny = (dx / len) * halfT;

    // Face 1
    const p1x = Math.round(wall.start.x + nx);
    const p1y = Math.round(wall.start.y + ny);
    const p2x = Math.round(wall.end.x + nx);
    const p2y = Math.round(wall.end.y + ny);

    // Face 2
    const p3x = Math.round(wall.start.x - nx);
    const p3y = Math.round(wall.start.y - ny);
    const p4x = Math.round(wall.end.x - nx);
    const p4y = Math.round(wall.end.y - ny);

    // Write Face 1 Line
    this.writeLine(p1x, p1y, p2x, p2y, 'A-WALL', add);
    // Write Face 2 Line
    this.writeLine(p3x, p3y, p4x, p4y, 'A-WALL', add);

    // End caps if isolated
    this.writeLine(p1x, p1y, p3x, p3y, 'A-WALL', add);
    this.writeLine(p2x, p2y, p4x, p4y, 'A-WALL', add);
  }

  // Draw Door or Window in DXF
  private static writeOpeningDxf(wall: Wall, op: Opening, add: (c: number, v: string | number) => void) {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const wallLen = Math.hypot(dx, dy);
    if (wallLen < 1) return;

    const ux = dx / wallLen;
    const uy = dy / wallLen;
    const halfT = wall.thickness / 2;
    const nx = -uy * halfT;
    const ny = ux * halfT;

    // Opening start and end points on wall centerline
    const startMm = op.distanceFromStart;
    const endMm = op.distanceFromStart + op.width;

    const osx = wall.start.x + ux * startMm;
    const osy = wall.start.y + uy * startMm;
    const oex = wall.start.x + ux * endMm;
    const oey = wall.start.y + uy * endMm;

    if (op.type.startsWith('door')) {
      // Door jamb lines (A-DOOR)
      this.writeLine(osx + nx, osy + ny, osx - nx, osy - ny, 'A-DOOR', add);
      this.writeLine(oex + nx, oey + ny, oex - nx, oey - ny, 'A-DOOR', add);

      // Door leaf (cánh cửa mở 90 độ)
      const leafNx = op.swingInside ? nx * 2 : -nx * 2;
      const leafNy = op.swingInside ? ny * 2 : -ny * 2;
      const leafLen = op.width;
      const swingUx = op.swingInside ? -uy : uy;
      const swingUy = op.swingInside ? ux : -ux;

      const leafEndX = osx + swingUx * leafLen;
      const leafEndY = osy + swingUy * leafLen;

      this.writeLine(osx, osy, leafEndX, leafEndY, 'A-DOOR', add);

      // Swing arc approximate polyline
      const steps = 8;
      let prevX = leafEndX;
      let prevY = leafEndY;
      for (let i = 1; i <= steps; i++) {
        const t = (i / steps) * (Math.PI / 2);
        // interpolate from swing position to closed position (oex, oey)
        const angle = (op.swingInside ? 1 : -1) * (Math.PI / 2 - t);
        const curX = osx + Math.cos(angle) * (ux * op.width) - Math.sin(angle) * (uy * op.width);
        const curY = osy + Math.sin(angle) * (ux * op.width) + Math.cos(angle) * (uy * op.width);
        this.writeLine(prevX, prevY, curX, curY, 'A-DOOR', add);
        prevX = curX;
        prevY = curY;
      }
    } else {
      // Window (A-GLAZ): Draw sill lines and double glass line
      this.writeLine(osx + nx, osy + ny, osx - nx, osy - ny, 'A-GLAZ', add);
      this.writeLine(oex + nx, oey + ny, oex - nx, oey - ny, 'A-GLAZ', add);
      this.writeLine(osx + nx * 0.4, osy + ny * 0.4, oex + nx * 0.4, oey + ny * 0.4, 'A-GLAZ', add);
      this.writeLine(osx - nx * 0.4, osy - ny * 0.4, oex - nx * 0.4, oey - ny * 0.4, 'A-GLAZ', add);
    }
  }

  // Draw Column
  private static writeColumnDxf(col: Column, add: (c: number, v: string | number) => void) {
    const hw = col.width / 2;
    const hd = col.depth / 2;
    const rad = (col.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const corners = [
      { x: -hw, y: -hd },
      { x: hw, y: -hd },
      { x: hw, y: hd },
      { x: -hw, y: hd },
    ].map((pt) => ({
      x: Math.round(col.x + pt.x * cos - pt.y * sin),
      y: Math.round(col.y + pt.x * sin + pt.y * cos),
    }));

    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      this.writeLine(corners[i].x, corners[i].y, corners[next].x, corners[next].y, 'A-COLU', add);
    }

    // Concrete cross hatch
    this.writeLine(corners[0].x, corners[0].y, corners[2].x, corners[2].y, 'A-COLU', add);
    this.writeLine(corners[1].x, corners[1].y, corners[3].x, corners[3].y, 'A-COLU', add);
  }

  // Draw Architectural Dimension Line in DXF
  private static writeWallDimensionDxf(wall: Wall, add: (c: number, v: string | number) => void) {
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const len = Math.hypot(dx, dy);
    if (len < 100) return;

    const offsetMm = 450; // offset dimension line from wall
    const nx = (-dy / len) * offsetMm;
    const ny = (dx / len) * offsetMm;

    const dimP1x = Math.round(wall.start.x + nx);
    const dimP1y = Math.round(wall.start.y + ny);
    const dimP2x = Math.round(wall.end.x + nx);
    const dimP2y = Math.round(wall.end.y + ny);

    // Dimension line
    this.writeLine(dimP1x, dimP1y, dimP2x, dimP2y, 'A-DIMS', add);

    // Extension lines
    this.writeLine(Math.round(wall.start.x), Math.round(wall.start.y), dimP1x, dimP1y, 'A-DIMS', add);
    this.writeLine(Math.round(wall.end.x), Math.round(wall.end.y), dimP2x, dimP2y, 'A-DIMS', add);

    // Architectural tick marks (45° slant slashes)
    const tickLen = 60;
    const tickUx = Math.SQRT1_2 * tickLen;
    const tickUy = Math.SQRT1_2 * tickLen;
    this.writeLine(dimP1x - tickUx, dimP1y - tickUy, dimP1x + tickUx, dimP1y + tickUy, 'A-DIMS', add);
    this.writeLine(dimP2x - tickUx, dimP2y - tickUy, dimP2x + tickUx, dimP2y + tickUy, 'A-DIMS', add);

    // Dimension Text
    const midX = Math.round((dimP1x + dimP2x) / 2);
    const midY = Math.round((dimP1y + dimP2y) / 2);
    const displayLen = wall.measuredLength ? Math.round(wall.measuredLength) : Math.round(len);
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const textAngle = angleDeg > 90 || angleDeg < -90 ? angleDeg + 180 : angleDeg;

    this.writeText(midX, midY + 50, `${displayLen}`, 160, textAngle, 'A-DIMS', add);
  }

  // Draw Diagonal Check
  private static writeDiagonalDxf(diag: DiagonalCheck, add: (c: number, v: string | number) => void) {
    this.writeLine(
      Math.round(diag.p1.x),
      Math.round(diag.p1.y),
      Math.round(diag.p2.x),
      Math.round(diag.p2.y),
      'A-DIAG',
      add
    );
    const midX = Math.round((diag.p1.x + diag.p2.x) / 2);
    const midY = Math.round((diag.p1.y + diag.p2.y) / 2);
    this.writeText(midX, midY, `CHEO: ${Math.round(diag.measuredLength)}mm`, 140, 0, 'A-DIAG', add);
  }

  // Draw Angle Measurement Arc & Text in DXF
  private static writeAngleDxf(ang: WallAngle, walls: Wall[], add: (c: number, v: string | number) => void) {
    const w1 = walls.find((w) => w.id === ang.wall1Id);
    const w2 = walls.find((w) => w.id === ang.wall2Id);
    if (!w1 || !w2) return;

    const corner = AngleCalculator.analyzeWallCorner(w1, w2);
    if (!corner) return;

    const v = corner.vertex;
    const o1 = corner.outer1;
    const o2 = corner.outer2;

    const a1 = Math.atan2(o1.y - v.y, o1.x - v.x);
    const a2 = Math.atan2(o2.y - v.y, o2.x - v.x);

    let diff = a2 - a1;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;

    const radius = 350; // mm
    const midA = a1 + diff / 2;
    const labelX = Math.round(v.x + Math.cos(midA) * (radius + 200));
    const labelY = Math.round(v.y + Math.sin(midA) * (radius + 200));

    // Approximate arc with lines in DXF
    const steps = 6;
    let prevX = Math.round(v.x + Math.cos(a1) * radius);
    let prevY = Math.round(v.y + Math.sin(a1) * radius);
    for (let i = 1; i <= steps; i++) {
      const curA = a1 + (diff * i) / steps;
      const curX = Math.round(v.x + Math.cos(curA) * radius);
      const curY = Math.round(v.y + Math.sin(curA) * radius);
      this.writeLine(prevX, prevY, curX, curY, 'A-DIMS', add);
      prevX = curX;
      prevY = curY;
    }

    const angleText = `${ang.angleDeg.toFixed(1)}%%d`; // %%d is AutoCAD degree symbol
    this.writeText(labelX, labelY, angleText, 140, 0, 'A-DIMS', add);
  }

  // Draw Room Label & Area
  private static writeRoomDxf(room: Room, walls: Wall[], add: (c: number, v: string | number) => void) {
    // calculate centroid from attached walls
    const pts: { x: number; y: number }[] = [];
    for (const wid of room.wallIds) {
      const w = walls.find((item) => item.id === wid);
      if (w) {
        pts.push(w.start);
        pts.push(w.end);
      }
    }
    if (pts.length === 0) return;

    const avgX = Math.round(pts.reduce((acc, p) => acc + p.x, 0) / pts.length);
    const avgY = Math.round(pts.reduce((acc, p) => acc + p.y, 0) / pts.length);

    this.writeText(avgX, avgY + 120, room.name.toUpperCase(), 240, 0, 'A-ROOM', add);
    this.writeText(avgX, avgY - 120, `S = ${room.area.toFixed(1)} m2`, 180, 0, 'A-ROOM', add);
  }

  // Standard Vietnamese Architectural Title Block
  private static writeTitleBlockDxf(project: ProjectData, add: (c: number, v: string | number) => void) {
    // Find bounding box of project
    let minX = 0, minY = 0, maxX = 6000, maxY = 6000;
    if (project.walls.length > 0) {
      minX = Math.min(...project.walls.flatMap((w) => [w.start.x, w.end.x])) - 1500;
      minY = Math.min(...project.walls.flatMap((w) => [w.start.y, w.end.y])) - 1800;
      maxX = Math.max(...project.walls.flatMap((w) => [w.start.x, w.end.x])) + 1500;
      maxY = Math.max(...project.walls.flatMap((w) => [w.start.y, w.end.y])) + 1500;
    }

    const stampX = maxX - 3200;
    const stampY = minY;
    const stampW = 3200;
    const stampH = 1400;

    // Stamp box border
    this.writeLine(stampX, stampY, stampX + stampW, stampY, '0', add);
    this.writeLine(stampX + stampW, stampY, stampX + stampW, stampY + stampH, '0', add);
    this.writeLine(stampX + stampW, stampY + stampH, stampX, stampY + stampH, '0', add);
    this.writeLine(stampX, stampY + stampH, stampX, stampY, '0', add);

    // Inner dividing lines
    this.writeLine(stampX, stampY + 450, stampX + stampW, stampY + 450, '0', add);
    this.writeLine(stampX, stampY + 900, stampX + stampW, stampY + 900, '0', add);

    // Texts inside Title Block
    this.writeText(stampX + 100, stampY + 1150, 'HỒ SƠ KHẢO SÁT HIỆN TRẠNG KIẾN TRÚC', 220, 0, '0', add);
    this.writeText(stampX + 100, stampY + 950, `CÔNG TRÌNH: ${project.name}`, 180, 0, '0', add);
    this.writeText(stampX + 100, stampY + 680, `CHỦ ĐẦU TƯ: ${project.clientName || 'Gia đình'}`, 160, 0, '0', add);
    this.writeText(stampX + 100, stampY + 520, `ĐỊA ĐIỂM: ${project.address || 'Hiện trạng'}`, 160, 0, '0', add);
    this.writeText(stampX + 100, stampY + 280, `NGƯỜI ĐO (LASER): ${project.surveyor || 'KTS. Khảo sát'}`, 150, 0, '0', add);
    this.writeText(stampX + 1800, stampY + 280, `NGÀY ĐO: ${project.surveyDate}`, 150, 0, '0', add);
    this.writeText(stampX + 100, stampY + 100, 'BẢN VẼ: MẶT BẰNG HIỆN TRẠNG (TỶ LỆ 1/50 - ĐƠN VỊ: MM)', 150, 0, '0', add);
  }

  // Primitive DXF Helpers
  // Draw Curved Wall in DXF (A-WALL-CRV)
  private static writeCurvedWallDxf(cw: CurvedWall, add: (c: number, v: string | number) => void) {
    const steps = 16;
    let prevX = cw.start.x;
    let prevY = cw.start.y;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      // Quadratic bezier approximation
      const curX = (1 - t) * (1 - t) * cw.start.x + 2 * (1 - t) * t * cw.controlPoint.x + t * t * cw.end.x;
      const curY = (1 - t) * (1 - t) * cw.start.y + 2 * (1 - t) * t * cw.controlPoint.y + t * t * cw.end.y;
      this.writeLine(prevX, prevY, curX, curY, 'A-WALL-CRV', add);
      prevX = curX;
      prevY = curY;
    }
    const midX = (cw.start.x + 2 * cw.controlPoint.x + cw.end.x) / 4;
    const midY = (cw.start.y + 2 * cw.controlPoint.y + cw.end.y) / 4;
    this.writeText(midX, midY, `R${cw.radius}`, 150, 0, 'A-WALL-CRV', add);
  }

  // Draw Staircase in DXF (A-STRS)
  private static writeStaircaseDxf(st: Staircase, add: (c: number, v: string | number) => void) {
    const rad = (st.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rw = st.runWidth;
    const len = st.totalLength;

    // Outer boundary of staircase
    const corners = [
      { x: 0, y: 0 },
      { x: rw, y: 0 },
      { x: rw, y: len },
      { x: 0, y: len },
    ].map((pt) => ({
      x: Math.round(st.position.x + pt.x * cos - pt.y * sin),
      y: Math.round(st.position.y + pt.x * sin + pt.y * cos),
    }));

    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      this.writeLine(corners[i].x, corners[i].y, corners[next].x, corners[next].y, 'A-STRS', add);
    }

    // Step tread lines
    const stepCount = Math.max(3, st.stepCount || 19);
    const treadDist = len / stepCount;
    for (let i = 1; i < stepCount; i++) {
      const yOffset = i * treadDist;
      const p1 = {
        x: Math.round(st.position.x + 0 * cos - yOffset * sin),
        y: Math.round(st.position.y + 0 * sin + yOffset * cos),
      };
      const p2 = {
        x: Math.round(st.position.x + rw * cos - yOffset * sin),
        y: Math.round(st.position.y + rw * sin + yOffset * cos),
      };
      this.writeLine(p1.x, p1.y, p2.x, p2.y, 'A-STRS', add);
    }

    // Walking path arrow line
    const startWalk = {
      x: Math.round(st.position.x + (rw / 2) * cos - 200 * sin),
      y: Math.round(st.position.y + (rw / 2) * sin + 200 * cos),
    };
    const endWalk = {
      x: Math.round(st.position.x + (rw / 2) * cos - (len - 300) * sin),
      y: Math.round(st.position.y + (rw / 2) * sin + (len - 300) * cos),
    };
    this.writeLine(startWalk.x, startWalk.y, endWalk.x, endWalk.y, 'A-STRS', add);
    this.writeText(startWalk.x + 50, startWalk.y, `${stepCount} BAC`, 130, st.rotation, 'A-STRS', add);
  }

  // Draw MEP Element in DXF (E-POWR / P-SANR / M-HVAC / F-PROT)
  private static writeMepDxf(mep: MepElement, add: (c: number, v: string | number) => void) {
    let layer = 'E-POWR';
    if (mep.category.includes('water') || mep.category.includes('drain')) layer = 'P-SANR';
    else if (mep.category.includes('ac')) layer = 'M-HVAC';
    else if (mep.category.includes('fire')) layer = 'F-PROT';

    const r = 100;
    this.writeCircle(mep.position.x, mep.position.y, r, layer, add);
    const label = mep.label || mep.category.toUpperCase();
    this.writeText(mep.position.x + r + 20, mep.position.y, label, 110, 0, layer, add);
  }

  // Draw Landscape in DXF (A-PLNT)
  private static writeLandscapeDxf(ls: LandscapeElement, add: (c: number, v: string | number) => void) {
    this.writeCircle(ls.position.x, ls.position.y, ls.radius, 'A-PLNT', add);
    // Tree trunk
    this.writeCircle(ls.position.x, ls.position.y, Math.round(ls.radius * 0.15), 'A-PLNT', add);
    if (ls.name) {
      this.writeText(ls.position.x, ls.position.y - ls.radius - 80, ls.name, 120, 0, 'A-PLNT', add);
    }
  }

  // Draw Elevation & Section Entity in DXF (A-ELEV)
  private static writeElevSectDxf(es: ElevSectEntity, add: (c: number, v: string | number) => void) {
    if (es.type === 'level_marker') {
      const lineLen = 3000;
      this.writeLine(es.x, es.y, es.x + lineLen, es.y, 'A-ELEV', add);
      this.writeText(es.x + 100, es.y + 80, es.levelText || '+0.000', 160, 0, 'A-ELEV', add);
    } else {
      // Box rectangle for slabs or railings
      const x1 = es.x;
      const y1 = es.y;
      const x2 = es.x + es.width;
      const y2 = es.y + es.height;
      this.writeLine(x1, y1, x2, y1, 'A-ELEV', add);
      this.writeLine(x2, y1, x2, y2, 'A-ELEV', add);
      this.writeLine(x2, y2, x1, y2, 'A-ELEV', add);
      this.writeLine(x1, y2, x1, y1, 'A-ELEV', add);
      if (es.material) {
        this.writeText((x1 + x2) / 2, y1 + 50, es.material, 120, 0, 'A-ELEV', add);
      }
    }
  }

  // Circle helper
  private static writeCircle(
    cx: number,
    cy: number,
    radius: number,
    layer: string,
    add: (c: number, v: string | number) => void
  ) {
    add(0, 'CIRCLE');
    add(8, layer);
    add(10, Math.round(cx));
    add(20, Math.round(cy));
    add(30, 0);
    add(40, Math.round(radius));
  }

  private static writeLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    layer: string,
    add: (c: number, v: string | number) => void
  ) {
    add(0, 'LINE');
    add(8, layer);
    add(10, Math.round(x1));
    add(20, Math.round(y1));
    add(30, 0);
    add(11, Math.round(x2));
    add(21, Math.round(y2));
    add(31, 0);
  }

  private static writeText(
    x: number,
    y: number,
    text: string,
    height: number,
    rotation: number,
    layer: string,
    add: (c: number, v: string | number) => void
  ) {
    add(0, 'TEXT');
    add(8, layer);
    add(10, Math.round(x));
    add(20, Math.round(y));
    add(30, 0);
    add(40, height);
    add(1, text);
    add(50, Math.round(rotation));
    add(7, 'STANDARD');
  }
}
