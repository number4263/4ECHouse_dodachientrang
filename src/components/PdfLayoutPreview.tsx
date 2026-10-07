import React, { useMemo } from 'react';
import { ProjectData } from '../types/cad';
import { PdfExportOptions, PdfExporter } from '../services/pdfExporter';

interface PdfLayoutPreviewProps {
  project: ProjectData;
  options: PdfExportOptions;
}

export const PdfLayoutPreview: React.FC<PdfLayoutPreviewProps> = ({ project, options }) => {
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

  let pageWidth = 297;
  let pageHeight = 210;
  let isPortrait = false;

  if (paperSize === 'a4_portrait') {
    pageWidth = 210;
    pageHeight = 297;
    isPortrait = true;
  } else if (paperSize === 'a3_landscape') {
    pageWidth = 420;
    pageHeight = 297;
  }

  const margin = 10;
  const tbWidth = isPortrait ? pageWidth - margin * 2 - 4 : 115;
  const tbHeight = 36;
  const tbX = pageWidth - margin - tbWidth - 1.8;
  const tbY = pageHeight - margin - tbHeight - 1.8;

  // Geometry bounds
  const geometry = useMemo(() => {
    if (!project.walls || project.walls.length === 0) {
      return null;
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

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

    const geomPad = 1200;
    minX -= geomPad;
    minY -= geomPad;
    maxX += geomPad;
    maxY += geomPad;

    const cadW = Math.max(maxX - minX, 1000);
    const cadH = Math.max(maxY - minY, 1000);

    const drawAreaX = margin + 8;
    const drawAreaY = margin + 22;
    const drawAreaW = pageWidth - margin * 2 - 16;
    const drawAreaH = isPortrait
      ? pageHeight - margin * 2 - tbHeight - 34
      : pageHeight - margin * 2 - 58;

    let scale = Math.min(drawAreaW / cadW, drawAreaH / cadH);
    if (scaleMode === '1:50') {
      scale = 1 / 50;
    } else if (scaleMode === '1:100') {
      scale = 1 / 100;
    }

    const toPdfX = (xMm: number) => drawAreaX + (xMm - minX) * scale + (drawAreaW - cadW * scale) / 2;
    const toPdfY = (yMm: number) => drawAreaY + (yMm - minY) * scale + (drawAreaH - cadH * scale) / 2;

    return {
      minX,
      minY,
      maxX,
      maxY,
      cadW,
      cadH,
      scale,
      toPdfX,
      toPdfY,
    };
  }, [project, pageWidth, pageHeight, isPortrait, scaleMode]);

  const scaleLabel =
    scaleMode === '1:50'
      ? 'Tỷ lệ: 1/50'
      : scaleMode === '1:100'
      ? 'Tỷ lệ: 1/100'
      : 'Tỷ lệ: Fit To Sheet (mm)';

  const naX = pageWidth - margin - 20;
  const naY = margin + 14;

  const m1InPdf = geometry ? 1000 * geometry.scale : 10;
  const sbX = margin + 8;
  const sbY = pageHeight - margin - (isPortrait ? tbHeight + 14 : 12);

  return (
    <div className="w-full flex flex-col items-center justify-center p-3 bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between w-full mb-2 px-1 text-xs text-slate-400">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Xem Trước Bản Vẽ In Ấn (Live Scaled Layout Preview)
        </span>
        <span className="text-[11px] font-mono bg-slate-800/80 px-2 py-0.5 rounded text-amber-300">
          {paperSize === 'a4_portrait'
            ? 'A4 Dọc (210 x 297mm)'
            : paperSize === 'a3_landscape'
            ? 'A3 Ngang (420 x 297mm)'
            : 'A4 Ngang (297 x 210mm)'}{' '}
          | {scaleLabel}
        </span>
      </div>

      {/* Sheet Simulation Container */}
      <div className="relative w-full max-h-[380px] overflow-auto flex items-center justify-center bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 shadow-inner">
        <svg
          viewBox={`0 0 ${pageWidth} ${pageHeight}`}
          className="max-h-[350px] w-auto bg-white shadow-2xl rounded-[2px] transition-all duration-200 select-none"
          style={{ aspectRatio: `${pageWidth} / ${pageHeight}` }}
        >
          {/* Paper Background */}
          <rect x="0" y="0" width={pageWidth} height={pageHeight} fill="#ffffff" />

          {/* Outer Border */}
          <rect
            x={margin}
            y={margin}
            width={pageWidth - margin * 2}
            height={pageHeight - margin * 2}
            fill="none"
            stroke="#1e293b"
            strokeWidth="0.6"
          />

          {/* Inner Margin Line */}
          <rect
            x={margin + 1.8}
            y={margin + 1.8}
            width={pageWidth - margin * 2 - 3.6}
            height={pageHeight - margin * 2 - 3.6}
            fill="none"
            stroke="#1e293b"
            strokeWidth="0.2"
          />

          {/* Header Stamp (Góc trên trái) */}
          <text
            x={margin + 6}
            y={margin + 10}
            fontSize="5.2"
            fontWeight="bold"
            fill="#0f172a"
            fontFamily="Arial, sans-serif"
          >
            BẢN VẼ MẶT BẰNG HIỆN TRẠNG KIẾN TRÚC
          </text>
          <text
            x={margin + 6}
            y={margin + 14}
            fontSize="3.2"
            fill="#475569"
            fontFamily="Arial, sans-serif"
          >
            Địa điểm: {project.address || 'Hiện trạng khảo sát'} | Đo đạc Laser chuyên dụng 4ECHouse
          </text>

          {/* North Arrow */}
          {showNorthArrow && (
            <g transform={`translate(${naX}, ${naY})`}>
              <circle cx="0" cy="0" r="5" fill="none" stroke="#1e293b" strokeWidth="0.3" />
              <polygon points="0,-4.8 -2.2,1.2 0,0" fill="#0f172a" />
              <polygon points="0,-4.8 2.2,1.2 0,0" fill="#e2e8f0" stroke="#0f172a" strokeWidth="0.2" />
              <text x="0" y="-6.2" fontSize="3" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                N
              </text>
            </g>
          )}

          {/* CAD Elements */}
          {geometry && (
            <g>
              {/* Double-Line Walls */}
              {project.walls.map((wall) => {
                const dx = wall.end.x - wall.start.x;
                const dy = wall.end.y - wall.start.y;
                const len = Math.hypot(dx, dy);
                if (len < 1) return null;

                const tHalf = (wall.thickness || 220) / 2;
                const nx = (-dy / len) * tHalf;
                const ny = (dx / len) * tHalf;

                const p1x = geometry.toPdfX(wall.start.x + nx);
                const p1y = geometry.toPdfY(wall.start.y + ny);
                const p2x = geometry.toPdfX(wall.end.x + nx);
                const p2y = geometry.toPdfY(wall.end.y + ny);
                const p3x = geometry.toPdfX(wall.end.x - nx);
                const p3y = geometry.toPdfY(wall.end.y - ny);
                const p4x = geometry.toPdfX(wall.start.x - nx);
                const p4y = geometry.toPdfY(wall.start.y - ny);

                // Dimension calculations
                const measuredVal = Math.round(wall.measuredLength || len);
                const midX = (wall.start.x + wall.end.x) / 2;
                const midY = (wall.start.y + wall.end.y) / 2;
                const dimOffsetMm = 650;
                const dimX = geometry.toPdfX(midX + (-dy / len) * dimOffsetMm);
                const dimY = geometry.toPdfY(midY + (dx / len) * dimOffsetMm);

                const d1x = geometry.toPdfX(wall.start.x + (-dy / len) * dimOffsetMm);
                const d1y = geometry.toPdfY(wall.start.y + (dx / len) * dimOffsetMm);
                const d2x = geometry.toPdfX(wall.end.x + (-dy / len) * dimOffsetMm);
                const d2y = geometry.toPdfY(wall.end.y + (dx / len) * dimOffsetMm);

                // Witness lines
                const extStart = (wall.thickness || 220) / 2 + 100;
                const extEnd = dimOffsetMm + 200;
                const e1x1 = geometry.toPdfX(wall.start.x + (-dy / len) * extStart);
                const e1y1 = geometry.toPdfY(wall.start.y + (dx / len) * extStart);
                const e1x2 = geometry.toPdfX(wall.start.x + (-dy / len) * extEnd);
                const e1y2 = geometry.toPdfY(wall.start.y + (dx / len) * extEnd);

                const e2x1 = geometry.toPdfX(wall.end.x + (-dy / len) * extStart);
                const e2y1 = geometry.toPdfY(wall.end.y + (dx / len) * extStart);
                const e2x2 = geometry.toPdfX(wall.end.x + (-dy / len) * extEnd);
                const e2y2 = geometry.toPdfY(wall.end.y + (dx / len) * extEnd);

                const tick = 1.3;

                return (
                  <g key={wall.id}>
                    {/* Wall Body */}
                    {showWallHatch ? (
                      <polygon
                        points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y} ${p4x},${p4y}`}
                        fill="#cbd5e1"
                        stroke="#0f172a"
                        strokeWidth="0.4"
                      />
                    ) : (
                      <>
                        <line x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#0f172a" strokeWidth="0.4" />
                        <line x1={p4x} y1={p4y} x2={p3x} y2={p3y} stroke="#0f172a" strokeWidth="0.4" />
                      </>
                    )}

                    {/* Dimensions & Witness Lines */}
                    {showMeasurements && (
                      <g>
                        {/* Extension Witness Lines */}
                        <line x1={e1x1} y1={e1y1} x2={e1x2} y2={e1y2} stroke="#94a3b8" strokeWidth="0.12" />
                        <line x1={e2x1} y1={e2y1} x2={e2x2} y2={e2y2} stroke="#94a3b8" strokeWidth="0.12" />

                        {/* Main Dimension Line */}
                        <line x1={d1x} y1={d1y} x2={d2x} y2={d2y} stroke="#64748b" strokeWidth="0.18" />

                        {/* 45-deg End Ticks */}
                        <line
                          x1={d1x - tick}
                          y1={d1y - tick}
                          x2={d1x + tick}
                          y2={d1y + tick}
                          stroke="#475569"
                          strokeWidth="0.25"
                        />
                        <line
                          x1={d2x - tick}
                          y1={d2y - tick}
                          x2={d2x + tick}
                          y2={d2y + tick}
                          stroke="#475569"
                          strokeWidth="0.25"
                        />

                        {/* Number text with background white rectangle */}
                        <rect
                          x={dimX - 4.5}
                          y={dimY - 1.8}
                          width={9}
                          height={3.2}
                          fill="#ffffff"
                          rx="0.5"
                        />
                        <text
                          x={dimX}
                          y={dimY + 0.6}
                          fontSize="2.4"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill={wall.isMeasuredWithLaser ? '#059669' : '#1e293b'}
                          fontFamily="Arial, sans-serif"
                        >
                          {measuredVal}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Curved Walls */}
              {project.curvedWalls &&
                project.curvedWalls.map((cw) => {
                  const x1 = geometry.toPdfX(cw.start.x);
                  const y1 = geometry.toPdfY(cw.start.y);
                  const cx = geometry.toPdfX(cw.controlPoint.x);
                  const cy = geometry.toPdfY(cw.controlPoint.y);
                  const x2 = geometry.toPdfX(cw.end.x);
                  const y2 = geometry.toPdfY(cw.end.y);

                  return (
                    <g key={cw.id}>
                      <path
                        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="0.5"
                      />
                      {showMeasurements && (
                        <text
                          x={(x1 + 2 * cx + x2) / 4}
                          y={(y1 + 2 * cy + y2) / 4 - 1}
                          fontSize="2.2"
                          fontWeight="bold"
                          fill="#d97706"
                          textAnchor="middle"
                        >
                          R{cw.radius} (L={cw.arcLength})
                        </text>
                      )}
                    </g>
                  );
                })}

              {/* Openings (Doors / Windows / Glass) */}
              {showOpenings &&
                project.openings &&
                project.openings.map((op) => {
                  const wall = project.walls.find((w) => w.id === op.wallId);
                  if (!wall) return null;
                  const dx = wall.end.x - wall.start.x;
                  const dy = wall.end.y - wall.start.y;
                  const wLen = Math.hypot(dx, dy);
                  if (wLen < 1) return null;

                  const ux = dx / wLen;
                  const uy = dy / wLen;
                  const startX = wall.start.x + ux * op.distanceFromStart;
                  const startY = wall.start.y + uy * op.distanceFromStart;
                  const endX = startX + ux * op.width;
                  const endY = startY + uy * op.width;

                  const p1x = geometry.toPdfX(startX);
                  const p1y = geometry.toPdfY(startY);
                  const p2x = geometry.toPdfX(endX);
                  const p2y = geometry.toPdfY(endY);

                  if (op.type.startsWith('door')) {
                    const swingDx = -uy * op.width;
                    const swingDy = ux * op.width;
                    const leafEndX = geometry.toPdfX(startX + swingDx);
                    const leafEndY = geometry.toPdfY(startY + swingDy);

                    return (
                      <g key={op.id}>
                        {/* Door opening cutout */}
                        <line x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#ffffff" strokeWidth="0.8" />
                        {/* Door leaf */}
                        <line x1={p1x} y1={p1y} x2={leafEndX} y2={leafEndY} stroke="#dc2626" strokeWidth="0.35" />
                        {/* Swing arc */}
                        <line
                          x1={leafEndX}
                          y1={leafEndY}
                          x2={p2x}
                          y2={p2y}
                          stroke="#ef4444"
                          strokeWidth="0.25"
                          strokeDasharray="0.8,0.8"
                        />
                      </g>
                    );
                  } else if (op.type === 'glass_partition') {
                    return (
                      <line
                        key={op.id}
                        x1={p1x}
                        y1={p1y}
                        x2={p2x}
                        y2={p2y}
                        stroke="#06b6d4"
                        strokeWidth="0.45"
                      />
                    );
                  } else {
                    return (
                      <g key={op.id}>
                        <line x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#0284c7" strokeWidth="0.45" />
                      </g>
                    );
                  }
                })}

              {/* Columns */}
              {showColumns &&
                project.columns &&
                project.columns.map((col) => {
                  const cx = geometry.toPdfX(col.x);
                  const cy = geometry.toPdfY(col.y);
                  const cw = col.width * geometry.scale;
                  const cd = col.depth * geometry.scale;

                  if (col.type === 'concrete_circle') {
                    return (
                      <circle
                        key={col.id}
                        cx={cx}
                        cy={cy}
                        r={cw / 2}
                        fill="#0f172a"
                        stroke="#0f172a"
                        strokeWidth="0.2"
                      />
                    );
                  }
                  return (
                    <rect
                      key={col.id}
                      x={cx - cw / 2}
                      y={cy - cd / 2}
                      width={cw}
                      height={cd}
                      fill="#0f172a"
                      stroke="#0f172a"
                      strokeWidth="0.2"
                    />
                  );
                })}

              {/* Staircases */}
              {showStairs &&
                project.staircases &&
                project.staircases.map((stair) => {
                  const sx = geometry.toPdfX(stair.position.x);
                  const sy = geometry.toPdfY(stair.position.y);
                  const sW = (stair.totalLength || 3000) * geometry.scale;
                  const sH = (stair.runWidth * 2 + (stair.stairWellGap || 100)) * geometry.scale;

                  return (
                    <g key={stair.id}>
                      <rect x={sx} y={sy} width={sW} height={sH} fill="none" stroke="#0f172a" strokeWidth="0.3" />
                      <line x1={sx} y1={sy + sH / 2} x2={sx + sW} y2={sy + sH / 2} stroke="#0f172a" strokeWidth="0.2" />
                    </g>
                  );
                })}

              {/* Room Labels & Area Badges */}
              {showRoomLabels &&
                (project.rooms && project.rooms.length > 0 ? (
                  project.rooms.map((room, idx) => {
                    const pts: { x: number; y: number }[] = [];
                    (room.wallIds || []).forEach((wid) => {
                      const w = project.walls.find((item) => item.id === wid);
                      if (w) pts.push(w.start, w.end);
                    });

                    let cxMm = (geometry.minX + geometry.maxX) / 2 + (idx % 2 === 0 ? -900 : 900);
                    let cyMm = (geometry.minY + geometry.maxY) / 2 + (idx > 1 ? 900 : -900);
                    if (pts.length > 0) {
                      cxMm = pts.reduce((a, b) => a + b.x, 0) / pts.length;
                      cyMm = pts.reduce((a, b) => a + b.y, 0) / pts.length;
                    }

                    const cx = geometry.toPdfX(cxMm);
                    const cy = geometry.toPdfY(cyMm);
                    const cardW = 34;
                    const cardH = 9.5;

                    return (
                      <g key={room.id}>
                        {/* Rounded Badge */}
                        <rect
                          x={cx - cardW / 2}
                          y={cy - cardH / 2}
                          width={cardW}
                          height={cardH}
                          rx="1.2"
                          fill="#ffffff"
                          stroke="#cbd5e1"
                          strokeWidth="0.2"
                        />
                        {/* Room Name */}
                        <text
                          x={cx}
                          y={cy - 0.6}
                          fontSize="2.8"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="#0f172a"
                          fontFamily="Arial, sans-serif"
                        >
                          {PdfExporter.stripVietnamese(room.name).toUpperCase()}
                        </text>
                        {/* Area */}
                        <text
                          x={cx}
                          y={cy + 3.1}
                          fontSize="2.4"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="#d97706"
                          fontFamily="Arial, sans-serif"
                        >
                          S = {(room.area || 0).toFixed(1)} m²
                        </text>
                      </g>
                    );
                  })
                ) : (
                  <g>
                    <rect
                      x={geometry.toPdfX((geometry.minX + geometry.maxX) / 2) - 18}
                      y={geometry.toPdfY((geometry.minY + geometry.maxY) / 2) - 4.5}
                      width={36}
                      height={9}
                      rx="1.2"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="0.2"
                    />
                    <text
                      x={geometry.toPdfX((geometry.minX + geometry.maxX) / 2)}
                      y={geometry.toPdfY((geometry.minY + geometry.maxY) / 2) - 0.5}
                      fontSize="2.8"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#0f172a"
                    >
                      MẶT BẰNG HIỆN TRẠNG
                    </text>
                  </g>
                ))}
            </g>
          )}

          {/* Graphic Scale Bar */}
          {m1InPdf > 3 && m1InPdf < 60 && (
            <g transform={`translate(${sbX}, ${sbY})`}>
              <rect x="0" y="0" width={m1InPdf} height="1.6" fill="#0f172a" stroke="#0f172a" strokeWidth="0.15" />
              <rect x={m1InPdf} y="0" width={m1InPdf} height="1.6" fill="#ffffff" stroke="#0f172a" strokeWidth="0.15" />
              <rect x={m1InPdf * 2} y="0" width={m1InPdf} height="1.6" fill="#0f172a" stroke="#0f172a" strokeWidth="0.15" />
              <rect x={m1InPdf * 3} y="0" width={m1InPdf * 2} height="1.6" fill="#ffffff" stroke="#0f172a" strokeWidth="0.15" />
              <text x="0" y="-0.8" fontSize="2" fontWeight="bold" fill="#0f172a">
                0
              </text>
              <text x={m1InPdf} y="-0.8" fontSize="2" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                1m
              </text>
              <text x={m1InPdf * 2} y="-0.8" fontSize="2" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                2m
              </text>
              <text x={m1InPdf * 3} y="-0.8" fontSize="2" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                3m
              </text>
              <text x={m1InPdf * 5} y="-0.8" fontSize="2" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                5m
              </text>
              <text x={m1InPdf * 2.5} y="4.2" fontSize="2" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                THƯỚC TỶ LỆ ĐỒ HỌA
              </text>
            </g>
          )}

          {/* Room Area Schedule Table (Bottom Left) */}
          {showSchedule && !isPortrait && (
            <g transform={`translate(${margin + 6}, ${pageHeight - margin - 36})`}>
              <rect x="0" y="0" width="76" height="32" fill="#ffffff" stroke="#1e293b" strokeWidth="0.25" />
              <line x1="0" y1="5.5" x2="76" y2="5.5" stroke="#1e293b" strokeWidth="0.2" />
              <text x="3" y="4" fontSize="2.8" fontWeight="bold" fill="#0f172a">
                BẢNG THỐNG KÊ DIỆN TÍCH MẶT BẰNG
              </text>

              {((project.rooms && project.rooms.length > 0) ? project.rooms.slice(0, 4) : []).map(
                (r, idx) => (
                  <g key={r.id} transform={`translate(0, ${10 + idx * 4.2})`}>
                    <text x="3" y="0" fontSize="2.5" fill="#334155">
                      {idx + 1}. {PdfExporter.stripVietnamese(r.name)}
                    </text>
                    <text x="73" y="0" fontSize="2.5" fontWeight="bold" fill="#0f172a" textAnchor="end">
                      {(r.area || 0).toFixed(1)} m²
                    </text>
                  </g>
                )
              )}

              <line x1="0" y1="26" x2="76" y2="26" stroke="#1e293b" strokeWidth="0.2" />
              <text x="3" y="30" fontSize="2.7" fontWeight="bold" fill="#0f172a">
                TỔNG DIỆN TÍCH SÀN:
              </text>
              <text x="73" y="30" fontSize="2.7" fontWeight="bold" fill="#d97706" textAnchor="end">
                {((project.rooms || []).reduce((acc, cur) => acc + (cur.area || 0), 0) || 52.8).toFixed(1)} m²
              </text>
            </g>
          )}

          {/* Title Block (Bottom Right) */}
          {showTitleBlock && (
            <g transform={`translate(${tbX}, ${tbY})`}>
              <rect x="0" y="0" width={tbWidth} height={tbHeight} fill="#ffffff" stroke="#1e293b" strokeWidth="0.3" />
              <line x1="0" y1="9" x2={tbWidth} y2="9" stroke="#1e293b" strokeWidth="0.2" />
              <line x1="0" y1="18" x2={tbWidth} y2="18" stroke="#1e293b" strokeWidth="0.2" />
              <line x1="0" y1="27" x2={tbWidth} y2="27" stroke="#1e293b" strokeWidth="0.2" />
              <line x1={tbWidth * 0.52} y1="9" x2={tbWidth * 0.52} y2="27" stroke="#1e293b" strokeWidth="0.2" />

              <text x="4" y="6" fontSize="3.6" fontWeight="bold" fill="#0f172a">
                4ECHOUSE - HỒ SƠ KHẢO SÁT HIỆN TRẠNG LASER
              </text>
              <text x="4" y="14" fontSize="2.8" fill="#334155">
                Công trình: {PdfExporter.stripVietnamese(project.name)}
              </text>
              <text x={tbWidth * 0.52 + 3} y="14" fontSize="2.8" fill="#334155">
                Mã số: {project.projectCode}
              </text>
              <text x="4" y="23" fontSize="2.8" fill="#334155">
                Chủ đầu tư: {PdfExporter.stripVietnamese(project.clientName || 'Gia đình')}
              </text>
              <text x={tbWidth * 0.52 + 3} y="23" fontSize="2.8" fill="#334155">
                Ngày đo: {project.surveyDate}
              </text>
              <text x="4" y="32" fontSize="2.8" fontWeight="bold" fill="#0f172a">
                KTS: {PdfExporter.stripVietnamese(project.surveyor || 'KTS. 4ECHouse')}
              </text>
              <text x={tbWidth * 0.52 + 3} y="32" fontSize="2.8" fontWeight="bold" fill="#0f172a">
                {scaleLabel}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
