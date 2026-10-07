import jsPDF from 'jspdf';
import { ProjectData, Wall, CurvedWall, Opening, Column, Staircase } from '../types/cad';

export interface PdfExportOptions {
  paperSize?: 'a4_landscape' | 'a4_portrait' | 'a3_landscape';
  scaleMode?: 'fit' | '1:50' | '1:100';
  showMeasurements?: boolean;
  showRoomLabels?: boolean;
  showWallHatch?: boolean;
  showTitleBlock?: boolean;
  showSchedule?: boolean;
  showNorthArrow?: boolean;
  showColumns?: boolean;
  showStairs?: boolean;
  showOpenings?: boolean;
}

export class PdfExporter {
  /**
   * Remove Vietnamese diacritics to ensure crisp, error-free ASCII rendering in standard PDF fonts
   */
  public static stripVietnamese(str: string): string {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^\x00-\x7F]/g, '');
  }

  public static generateSurveyPdf(project: ProjectData, options: PdfExportOptions = {}): jsPDF {
    const {
      paperSize = 'a4_landscape',
      scaleMode = 'fit',
      showMeasurements = true,
      showRoomLabels = true,
      showWallHatch = true,
      showTitleBlock = true,
      showSchedule = true,
      showNorthArrow = true,
      showColumns = true,
      showStairs = true,
      showOpenings = true,
    } = options;

    // Determine dimensions in mm
    let pageWidth = 297;
    let pageHeight = 210;
    let orientation: 'landscape' | 'portrait' = 'landscape';
    let format: string = 'a4';

    if (paperSize === 'a4_portrait') {
      pageWidth = 210;
      pageHeight = 297;
      orientation = 'portrait';
      format = 'a4';
    } else if (paperSize === 'a3_landscape') {
      pageWidth = 420;
      pageHeight = 297;
      orientation = 'landscape';
      format = 'a3';
    }

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const margin = 10;

    // 1. Draw Outer Border & Grid Boundary
    doc.setDrawColor(30, 41, 59); // slate-800
    doc.setLineWidth(0.6);
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    // Inner Border
    doc.setLineWidth(0.2);
    doc.rect(margin + 1.8, margin + 1.8, pageWidth - margin * 2 - 3.6, pageHeight - margin * 2 - 3.6);

    // 2. Title Block Configuration (Khung tên bản vẽ chuẩn Kiến trúc)
    const tbWidth = orientation === 'portrait' ? pageWidth - margin * 2 - 4 : 115;
    const tbHeight = 36;
    const tbX = pageWidth - margin - tbWidth - 1.8;
    const tbY = pageHeight - margin - tbHeight - 1.8;

    if (showTitleBlock) {
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.3);
      doc.setFillColor(255, 255, 255);
      doc.rect(tbX, tbY, tbWidth, tbHeight, 'FD');

      // Internal dividing lines
      doc.line(tbX, tbY + 9, tbX + tbWidth, tbY + 9);
      doc.line(tbX, tbY + 18, tbX + tbWidth, tbY + 18);
      doc.line(tbX, tbY + 27, tbX + tbWidth, tbY + 27);
      doc.line(tbX + tbWidth * 0.52, tbY + 9, tbX + tbWidth * 0.52, tbY + 27);

      // Title Block Content
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('4ECHOUSE - HO SO KHAO SAT HIEN TRANG LASER', tbX + 4, tbY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(`Cong trinh: ${PdfExporter.stripVietnamese(project.name)}`, tbX + 4, tbY + 14);
      doc.text(`Ma so: ${PdfExporter.stripVietnamese(project.projectCode)}`, tbX + tbWidth * 0.52 + 3, tbY + 14);

      doc.text(`Chu dau tu: ${PdfExporter.stripVietnamese(project.clientName || 'Gia dinh')}`, tbX + 4, tbY + 23);
      doc.text(`Ngay khao sat: ${PdfExporter.stripVietnamese(project.surveyDate)}`, tbX + tbWidth * 0.52 + 3, tbY + 23);

      doc.setFont('helvetica', 'bold');
      doc.text(`KTS thuc hien: ${PdfExporter.stripVietnamese(project.surveyor || 'KTS. 4ECHouse')}`, tbX + 4, tbY + 32);
      const scaleLabel = scaleMode === '1:50' ? 'Ty le: 1/50' : scaleMode === '1:100' ? 'Ty le: 1/100' : 'Ty le: Fit To Sheet (mm)';
      doc.text(scaleLabel, tbX + tbWidth * 0.52 + 3, tbY + 32);
    }

    // 3. Header Stamp (Góc trên trái)
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('BAN VE MAT BANG HIEN TRANG KIEN TRUC', margin + 6, margin + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Dia diem: ${PdfExporter.stripVietnamese(project.address || 'Hien trang khao sat')} | Do bang thuoc Laser chuyen dung 4ECHouse`,
      margin + 6,
      margin + 17
    );

    // 4. North Arrow (Huong Bac)
    if (showNorthArrow) {
      const naX = pageWidth - margin - 20;
      const naY = margin + 14;

      // Circle & Triangle
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.3);
      doc.circle(naX, naY, 6, 'S');

      // North black pointer
      doc.setFillColor(30, 41, 59);
      doc.triangle(naX, naY - 5.5, naX - 2.5, naY + 1.5, naX, naY, 'F');
      // South open pointer
      doc.setFillColor(255, 255, 255);
      doc.triangle(naX, naY - 5.5, naX + 2.5, naY + 1.5, naX, naY, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text('N', naX, naY - 7.5, { align: 'center' });
    }

    // 5. Calculate CAD Geometry Extents
    if (project.walls.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Chua co du lieu tuong mat bang.', pageWidth / 2, pageHeight / 2, { align: 'center' });
      return doc;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    project.walls.forEach((w) => {
      minX = Math.min(minX, w.start.x, w.end.x);
      minY = Math.min(minY, w.start.y, w.end.y);
      maxX = Math.max(maxX, w.start.x, w.end.x);
      maxY = Math.max(maxY, w.start.y, w.end.y);
    });

    if (project.curvedWalls) {
      project.curvedWalls.forEach((cw) => {
        minX = Math.min(minX, cw.start.x, cw.end.x, cw.controlPoint.x);
        minY = Math.min(minY, cw.start.y, cw.end.y, cw.controlPoint.y);
        maxX = Math.max(maxX, cw.start.x, cw.end.x, cw.controlPoint.x);
        maxY = Math.max(maxY, cw.start.y, cw.end.y, cw.controlPoint.y);
      });
    }

    // Add padding around geometry (1000mm)
    const geomPad = 1200;
    minX -= geomPad;
    minY -= geomPad;
    maxX += geomPad;
    maxY += geomPad;

    const cadW = Math.max(maxX - minX, 1000);
    const cadH = Math.max(maxY - minY, 1000);

    // Available drawing canvas area on paper in mm
    const drawAreaX = margin + 8;
    const drawAreaY = margin + 22;
    const drawAreaW = pageWidth - margin * 2 - 16;
    const drawAreaH = orientation === 'portrait'
      ? pageHeight - margin * 2 - tbHeight - 34
      : pageHeight - margin * 2 - 58;

    // Calculate scale factor (mm paper per mm CAD)
    let scale = Math.min(drawAreaW / cadW, drawAreaH / cadH);
    if (scaleMode === '1:50') {
      scale = 1 / 50; // 1mm paper = 50mm real
    } else if (scaleMode === '1:100') {
      scale = 1 / 100; // 1mm paper = 100mm real
    }

    const toPdfX = (xMm: number) => drawAreaX + (xMm - minX) * scale + (drawAreaW - cadW * scale) / 2;
    const toPdfY = (yMm: number) => drawAreaY + (yMm - minY) * scale + (drawAreaH - cadH * scale) / 2;

    // 6. Draw Subtle Construction Grid
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.1);

    // 7. Draw Double-Line Architectural Walls with Thickness
    project.walls.forEach((wall) => {
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;

      const tHalf = (wall.thickness || 220) / 2;
      const nx = (-dy / len) * tHalf;
      const ny = (dx / len) * tHalf;

      const p1x = toPdfX(wall.start.x + nx);
      const p1y = toPdfY(wall.start.y + ny);
      const p2x = toPdfX(wall.end.x + nx);
      const p2y = toPdfY(wall.end.y + ny);
      const p3x = toPdfX(wall.end.x - nx);
      const p3y = toPdfY(wall.end.y - ny);
      const p4x = toPdfX(wall.start.x - nx);
      const p4y = toPdfY(wall.start.y - ny);

      if (showWallHatch) {
        // Solid wall core fill (slate-200)
        doc.setFillColor(226, 232, 240);
        doc.setDrawColor(15, 23, 42); // slate-900
        doc.setLineWidth(0.45);
        // Draw polygon for the thick wall
        doc.triangle(p1x, p1y, p2x, p2y, p3x, p3y, 'FD');
        doc.triangle(p1x, p1y, p3x, p3y, p4x, p4y, 'FD');
      } else {
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.45);
        doc.line(p1x, p1y, p2x, p2y);
        doc.line(p4x, p4y, p3x, p3y);
      }

      // Draw Wall Measurements & Dimension Lines
      if (showMeasurements) {
        const measuredVal = Math.round(wall.measuredLength || len);
        const midX = (wall.start.x + wall.end.x) / 2;
        const midY = (wall.start.y + wall.end.y) / 2;

        // Offset dimension line ~650mm CAD outward
        const dimOffsetMm = 650;
        const dimX = toPdfX(midX + (-dy / len) * dimOffsetMm);
        const dimY = toPdfY(midY + (dx / len) * dimOffsetMm);

        const d1x = toPdfX(wall.start.x + (-dy / len) * dimOffsetMm);
        const d1y = toPdfY(wall.start.y + (dx / len) * dimOffsetMm);
        const d2x = toPdfX(wall.end.x + (-dy / len) * dimOffsetMm);
        const d2y = toPdfY(wall.end.y + (dx / len) * dimOffsetMm);

        // Architectural extension (witness) lines from wall face outward past dimension line
        const extStartOffset = (wall.thickness || 220) / 2 + 100;
        const extEndOffset = dimOffsetMm + 200;
        const ext1StartX = toPdfX(wall.start.x + (-dy / len) * extStartOffset);
        const ext1StartY = toPdfY(wall.start.y + (dx / len) * extStartOffset);
        const ext1EndX = toPdfX(wall.start.x + (-dy / len) * extEndOffset);
        const ext1EndY = toPdfY(wall.start.y + (dx / len) * extEndOffset);

        const ext2StartX = toPdfX(wall.end.x + (-dy / len) * extStartOffset);
        const ext2StartY = toPdfY(wall.end.y + (dx / len) * extStartOffset);
        const ext2EndX = toPdfX(wall.end.x + (-dy / len) * extEndOffset);
        const ext2EndY = toPdfY(wall.end.y + (dx / len) * extEndOffset);

        doc.setDrawColor(148, 163, 184); // slate-400
        doc.setLineWidth(0.12);
        doc.line(ext1StartX, ext1StartY, ext1EndX, ext1EndY);
        doc.line(ext2StartX, ext2StartY, ext2EndX, ext2EndY);

        // Thin dimension line
        doc.setDrawColor(100, 116, 139); // slate-500
        doc.setLineWidth(0.18);
        doc.line(d1x, d1y, d2x, d2y);

        // 45 degree ticks at endpoints
        const tick = 1.3;
        doc.setDrawColor(71, 85, 105);
        doc.setLineWidth(0.25);
        doc.line(d1x - tick, d1y - tick, d1x + tick, d1y + tick);
        doc.line(d2x - tick, d2y - tick, d2x + tick, d2y + tick);

        // Dimension text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        if (wall.isMeasuredWithLaser) {
          doc.setTextColor(16, 185, 129); // emerald-500
        } else {
          doc.setTextColor(30, 41, 59); // slate-800
        }

        // Draw dimension number with white background pill
        const dimStr = `${measuredVal}`;
        const strW = doc.getTextWidth(dimStr);
        doc.setFillColor(255, 255, 255);
        doc.rect(dimX - strW / 2 - 0.8, dimY - 2.5, strW + 1.6, 3.8, 'F');
        doc.text(dimStr, dimX, dimY, { align: 'center' });
      }
    });

    // 8. Draw Curved Walls (Tường cong)
    if (showWallHatch && project.curvedWalls) {
      project.curvedWalls.forEach((cw) => {
        doc.setDrawColor(217, 119, 6); // amber-600
        doc.setLineWidth(0.5);

        const steps = 16;
        for (let i = 0; i < steps; i++) {
          const t1 = i / steps;
          const t2 = (i + 1) / steps;

          // Quadratic Bezier
          const x1 = (1 - t1) * (1 - t1) * cw.start.x + 2 * (1 - t1) * t1 * cw.controlPoint.x + t1 * t1 * cw.end.x;
          const y1 = (1 - t1) * (1 - t1) * cw.start.y + 2 * (1 - t1) * t1 * cw.controlPoint.y + t1 * t1 * cw.end.y;
          const x2 = (1 - t2) * (1 - t2) * cw.start.x + 2 * (1 - t2) * t2 * cw.controlPoint.x + t2 * t2 * cw.end.x;
          const y2 = (1 - t2) * (1 - t2) * cw.start.y + 2 * (1 - t2) * t2 * cw.controlPoint.y + t2 * t2 * cw.end.y;

          doc.line(toPdfX(x1), toPdfY(y1), toPdfX(x2), toPdfY(y2));
        }

        if (showMeasurements) {
          const midX = (cw.start.x + 2 * cw.controlPoint.x + cw.end.x) / 4;
          const midY = (cw.start.y + 2 * cw.controlPoint.y + cw.end.y) / 4;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6);
          doc.setTextColor(217, 119, 6);
          doc.text(`R${cw.radius} (L=${cw.arcLength})`, toPdfX(midX), toPdfY(midY) - 1.5, { align: 'center' });
        }
      });
    }

    // 9. Draw Openings (Cửa đi, Cửa sổ, Vách kính)
    if (showOpenings && project.openings) {
      project.openings.forEach((op) => {
        const wall = project.walls.find((w) => w.id === op.wallId);
        if (!wall) return;
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const wLen = Math.hypot(dx, dy);
        if (wLen < 1) return;

        const ux = dx / wLen;
        const uy = dy / wLen;
        const startX = wall.start.x + ux * op.distanceFromStart;
        const startY = wall.start.y + uy * op.distanceFromStart;
        const endX = startX + ux * op.width;
        const endY = startY + uy * op.width;

        const p1x = toPdfX(startX);
        const p1y = toPdfY(startY);
        const p2x = toPdfX(endX);
        const p2y = toPdfY(endY);

        if (op.type.startsWith('door')) {
          // Door opening gap: clear out wall line
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.8);
          doc.line(p1x, p1y, p2x, p2y);

          // Door Leaf
          doc.setDrawColor(220, 38, 38); // red-600
          doc.setLineWidth(0.4);
          doc.line(p1x, p1y, p2x, p2y);

          // Swing Arc indication
          const swingDx = (-uy) * op.width;
          const swingDy = ux * op.width;
          const leafEndX = toPdfX(startX + swingDx);
          const leafEndY = toPdfY(startY + swingDy);

          doc.setDrawColor(239, 68, 68);
          doc.setLineWidth(0.3);
          doc.line(p1x, p1y, leafEndX, leafEndY);

          // Swing dashed arc
          doc.setLineDashPattern([0.8, 0.8], 0);
          doc.line(leafEndX, leafEndY, p2x, p2y);
          doc.setLineDashPattern([], 0);
        } else if (op.type === 'glass_partition') {
          // Glass Partition (Triple Cyan Lines)
          doc.setDrawColor(6, 182, 212); // cyan-500
          doc.setLineWidth(0.3);
          doc.line(p1x, p1y, p2x, p2y);

          const perpX = (-uy) * 60;
          const perpY = ux * 60;
          doc.line(toPdfX(startX + perpX), toPdfY(startY + perpY), toPdfX(endX + perpX), toPdfY(endY + perpY));
          doc.line(toPdfX(startX - perpX), toPdfY(startY - perpY), toPdfX(endX - perpX), toPdfY(endY - perpY));
        } else {
          // Window (Double Blue Lines)
          doc.setDrawColor(2, 132, 199); // sky-600
          doc.setLineWidth(0.35);
          doc.line(p1x, p1y, p2x, p2y);

          const sillX = (-uy) * 80;
          const sillY = ux * 80;
          doc.line(toPdfX(startX + sillX), toPdfY(startY + sillY), toPdfX(endX + sillX), toPdfY(endY + sillY));
          doc.line(toPdfX(startX - sillX), toPdfY(startY - sillY), toPdfX(endX - sillX), toPdfY(endY - sillY));
        }
      });
    }

    // 10. Draw Structural Columns (Cột bê tông & Cột thép)
    if (showColumns && project.columns) {
      project.columns.forEach((col) => {
        const cx = toPdfX(col.x);
        const cy = toPdfY(col.y);
        const cw = (col.width * scale);
        const cd = (col.depth * scale);

        doc.setFillColor(15, 23, 42); // slate-900
        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.3);

        if (col.type === 'steel_i') {
          // I-beam shape
          doc.rect(cx - cw / 2, cy - cd / 2, cw, cd, 'F');
          doc.setFillColor(255, 255, 255);
          // Hollow cutouts for I
          doc.rect(cx - cw / 2 + cw * 0.2, cy - cd / 2 + cd * 0.15, cw * 0.6, cd * 0.7, 'F');
        } else if (col.type === 'concrete_circle') {
          doc.circle(cx, cy, cw / 2, 'FD');
        } else {
          // Solid rectangle column
          doc.rect(cx - cw / 2, cy - cd / 2, cw, cd, 'FD');
          // Diagonal cross
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.15);
          doc.line(cx - cw / 2, cy - cd / 2, cx + cw / 2, cy + cd / 2);
          doc.line(cx + cw / 2, cy - cd / 2, cx - cw / 2, cy + cd / 2);
        }
      });
    }

    // 11. Draw Staircases (Cầu thang)
    if (showStairs && project.staircases) {
      project.staircases.forEach((stair) => {
        const sx = toPdfX(stair.position.x);
        const sy = toPdfY(stair.position.y);
        const sW = (stair.totalLength || 3000) * scale;
        const sH = (stair.runWidth * 2 + (stair.stairWellGap || 100)) * scale;

        doc.setDrawColor(15, 23, 42);
        doc.setLineWidth(0.3);
        doc.rect(sx, sy, sW, sH);

        // Tread lines
        const stepNum = Math.min(stair.stepCount || 19, 21);
        const treadSpacing = sW / (stepNum / 2);
        for (let i = 1; i < stepNum / 2; i++) {
          doc.line(sx + i * treadSpacing, sy, sx + i * treadSpacing, sy + sH);
        }

        // Mid stairwell dividing line
        doc.line(sx, sy + sH / 2, sx + sW, sy + sH / 2);

        // Direction Arrow
        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(0.3);
        doc.line(sx + 4, sy + sH * 0.25, sx + sW - 6, sy + sH * 0.25);
        doc.triangle(sx + sW - 3, sy + sH * 0.25, sx + sW - 7, sy + sH * 0.25 - 1.5, sx + sW - 7, sy + sH * 0.25 + 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.setTextColor(217, 119, 6);
        doc.text('LEN (UP)', sx + sW / 2, sy + sH * 0.25 - 1.2, { align: 'center' });
      });
    }

    // 12. Draw Room Labels & Areas (Nhãn tên phòng & diện tích nổi bật)
    if (showRoomLabels) {
      const rooms = project.rooms && project.rooms.length > 0 ? project.rooms : [];

      if (rooms.length > 0) {
        rooms.forEach((room, roomIdx) => {
          const pts: { x: number; y: number }[] = [];
          (room.wallIds || []).forEach((wid) => {
            const w = project.walls.find((item) => item.id === wid);
            if (w) {
              pts.push(w.start, w.end);
            }
          });

          let cxMm = 0;
          let cyMm = 0;
          if (pts.length > 0) {
            cxMm = pts.reduce((a, b) => a + b.x, 0) / pts.length;
            cyMm = pts.reduce((a, b) => a + b.y, 0) / pts.length;
          } else {
            // Fallback placement inside floorplan
            cxMm = (minX + maxX) / 2 + (roomIdx % 2 === 0 ? -800 : 800);
            cyMm = (minY + maxY) / 2 + (roomIdx > 1 ? 800 : -800);
          }

          const cx = toPdfX(cxMm);
          const cy = toPdfY(cyMm);

          // Room badge card
          const rName = (PdfExporter.stripVietnamese(room.name) || `PHONG ${roomIdx + 1}`).toUpperCase();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          const nameW = doc.getTextWidth(rName);
          const cardW = Math.max(nameW + 10, 32);
          const cardH = 11;

          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(203, 213, 225); // slate-300
          doc.setLineWidth(0.2);
          doc.roundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 1.5, 1.5, 'FD');

          // Room name
          doc.setTextColor(15, 23, 42); // slate-900
          doc.text(rName, cx, cy - 0.7, { align: 'center' });

          // Area value
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(217, 119, 6); // amber-600
          doc.text(`S = ${(room.area || 0).toFixed(1)} m2`, cx, cy + 3.2, { align: 'center' });
        });
      } else if (project.walls.length > 0) {
        // Auto default space label if no explicit rooms defined
        const cx = toPdfX((minX + maxX) / 2);
        const cy = toPdfY((minY + maxY) / 2);
        const cardW = 42;
        const cardH = 11;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.2);
        doc.roundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('MAT BANG HIEN TRANG', cx, cy - 0.7, { align: 'center' });

        const approxArea = Math.round((cadW * cadH * 0.00000075) * 10) / 10;
        doc.setFontSize(6.5);
        doc.setTextColor(217, 119, 6);
        doc.text(`S ~ ${approxArea.toFixed(1)} m2`, cx, cy + 3.2, { align: 'center' });
      }
    }

    // 13. Graphic Scale Bar (Thước tỷ lệ đồ họa 0 - 5m)
    const sbX = margin + 8;
    const sbY = pageHeight - margin - (orientation === 'portrait' ? tbHeight + 14 : 12);
    const m1InPdf = 1000 * scale; // 1m real in mm paper

    if (m1InPdf > 3 && m1InPdf < 60) {
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.2);

      // Alternating bars
      const barH = 1.8;
      doc.setFillColor(15, 23, 42);
      doc.rect(sbX, sbY, m1InPdf, barH, 'FD');
      doc.setFillColor(255, 255, 255);
      doc.rect(sbX + m1InPdf, sbY, m1InPdf, barH, 'FD');
      doc.setFillColor(15, 23, 42);
      doc.rect(sbX + m1InPdf * 2, sbY, m1InPdf, barH, 'FD');
      doc.setFillColor(255, 255, 255);
      doc.rect(sbX + m1InPdf * 3, sbY, m1InPdf * 2, barH, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(15, 23, 42);
      doc.text('0', sbX, sbY - 1);
      doc.text('1m', sbX + m1InPdf, sbY - 1, { align: 'center' });
      doc.text('2m', sbX + m1InPdf * 2, sbY - 1, { align: 'center' });
      doc.text('3m', sbX + m1InPdf * 3, sbY - 1, { align: 'center' });
      doc.text('5m', sbX + m1InPdf * 5, sbY - 1, { align: 'center' });
      doc.text('THUOC TY LE DO HOA', sbX + m1InPdf * 2.5, sbY + barH + 3.2, { align: 'center' });
    }

    // 14. Bottom Left Table: Room Area Schedule (Bảng thống kê diện tích phòng)
    if (showSchedule && orientation !== 'portrait') {
      const tableX = margin + 6;
      const tableY = pageHeight - margin - 38;
      const tW = 80;
      const tH = 34;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.25);
      doc.rect(tableX, tableY, tW, tH, 'FD');

      // Table Header
      doc.line(tableX, tableY + 6, tableX + tW, tableY + 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text('BANG THONG KE DIEN TICH MAT BANG', tableX + 3, tableY + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      let yOffset = 10;
      let totalArea = 0;

      const scheduleRooms = project.rooms && project.rooms.length > 0 ? project.rooms : [];
      if (scheduleRooms.length > 0) {
        scheduleRooms.slice(0, 5).forEach((r, idx) => {
          totalArea += r.area;
          const nameClean = PdfExporter.stripVietnamese(r.name);
          doc.text(`${idx + 1}. ${nameClean}`, tableX + 3, tableY + yOffset);
          doc.text(`${(r.area || 0).toFixed(1)} m2`, tableX + tW - 4, tableY + yOffset, { align: 'right' });
          yOffset += 4.2;
        });
      } else {
        totalArea = Math.round((cadW * cadH * 0.00000075) * 10) / 10;
        doc.text('1. Toan bo mat bang', tableX + 3, tableY + yOffset);
        doc.text(`${totalArea.toFixed(1)} m2`, tableX + tW - 4, tableY + yOffset, { align: 'right' });
      }

      // Total row
      doc.line(tableX, tableY + 28, tableX + tW, tableY + 28);
      doc.setFont('helvetica', 'bold');
      doc.text('TONG DIEN TICH SAN:', tableX + 3, tableY + 32);
      doc.setTextColor(217, 119, 6);
      doc.text(`${totalArea.toFixed(1)} m2`, tableX + tW - 4, tableY + 32, { align: 'right' });
    }

    return doc;
  }
}
