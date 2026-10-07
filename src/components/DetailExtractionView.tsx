import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DetailCallout, Point2D, ProjectData } from '../types/cad';
import {
  Search,
  Plus,
  Trash2,
  FileText,
  Crosshair,
  Pencil,
  Minus,
  Type,
  Eraser,
  Undo2,
  Redo2,
  RotateCcw,
  Magnet,
  Check,
  Sparkles,
} from 'lucide-react';

interface DetailExtractionViewProps {
  project: ProjectData;
  onAddDetailCallout: (callout: DetailCallout) => void;
  onDeleteDetailCallout: (id: string) => void;
}

interface DetailLine {
  id: string;
  start: Point2D;
  end: Point2D;
  color: string;
  width: number;
}

interface DetailNote {
  id: string;
  pos: Point2D;
  text: string;
  color: string;
}

interface DetailStroke {
  id: string;
  points: Point2D[];
  color: string;
  width: number;
}

interface CanvasStateHistory {
  lines: DetailLine[];
  strokes: DetailStroke[];
  notes: DetailNote[];
}

export const DetailExtractionView: React.FC<DetailExtractionViewProps> = ({
  project,
  onAddDetailCallout,
  onDeleteDetailCallout,
}) => {
  const [selectedCalloutId, setSelectedCalloutId] = useState<string | null>(
    project.detailCallouts.length > 0 ? project.detailCallouts[0].id : null
  );

  const selectedCallout = project.detailCallouts.find((c) => c.id === selectedCalloutId);

  // Tools in Detail View: 'freehand' | 'line' | 'note' | 'eraser'
  const [activeTool, setActiveTool] = useState<'freehand' | 'line' | 'note' | 'eraser'>('line');
  const [strokeColor, setStrokeColor] = useState<string>('#f59e0b');
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  const [noteInputText, setNoteInputText] = useState<string>('Ray nhôm trượt W=80mm');

  // Drawing items per callout (lines, freehand strokes, notes)
  const [lines, setLines] = useState<DetailLine[]>([
    { id: 'dl1', start: { x: 120, y: 150 }, end: { x: 420, y: 150 }, color: '#38bdf8', width: 3 },
    { id: 'dl2', start: { x: 120, y: 150 }, end: { x: 120, y: 320 }, color: '#38bdf8', width: 3 },
    { id: 'dl3', start: { x: 420, y: 150 }, end: { x: 420, y: 320 }, color: '#38bdf8', width: 3 },
    { id: 'dl4', start: { x: 120, y: 320 }, end: { x: 420, y: 320 }, color: '#38bdf8', width: 3 },
  ]);
  const [strokes, setStrokes] = useState<DetailStroke[]>([]);
  const [notes, setNotes] = useState<DetailNote[]>([
    { id: 'dn1', pos: { x: 270, y: 130 }, text: 'Khung bao hợp kim 50x120mm', color: '#fbbf24' },
    { id: 'dn2', pos: { x: 270, y: 345 }, text: 'Đệm cao su EPDM chống ồn', color: '#38bdf8' },
  ]);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<CanvasStateHistory[]>([
    {
      lines: [
        { id: 'dl1', start: { x: 120, y: 150 }, end: { x: 420, y: 150 }, color: '#38bdf8', width: 3 },
        { id: 'dl2', start: { x: 120, y: 150 }, end: { x: 120, y: 320 }, color: '#38bdf8', width: 3 },
        { id: 'dl3', start: { x: 420, y: 150 }, end: { x: 420, y: 320 }, color: '#38bdf8', width: 3 },
        { id: 'dl4', start: { x: 120, y: 320 }, end: { x: 420, y: 320 }, color: '#38bdf8', width: 3 },
      ],
      strokes: [],
      notes: [
        { id: 'dn1', pos: { x: 270, y: 130 }, text: 'Khung bao hợp kim 50x120mm', color: '#fbbf24' },
        { id: 'dn2', pos: { x: 270, y: 345 }, text: 'Đệm cao su EPDM chống ồn', color: '#38bdf8' },
      ],
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Live drawing states
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentLineStart, setCurrentLineStart] = useState<Point2D | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<Point2D | null>(null);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point2D[]>([]);

  // Snapping Marker (within 20px threshold to existing endpoints or midpoints)
  const [snapMarker, setSnapMarker] = useState<{ pt: Point2D; type: 'endpoint' | 'midpoint' } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Push to history
  const pushHistory = (newLines: DetailLine[], newStrokes: DetailStroke[], newNotes: DetailNote[]) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push({ lines: newLines, strokes: newStrokes, notes: newNotes });
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setLines(prev.lines);
      setStrokes(prev.strokes);
      setNotes(prev.notes);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setLines(next.lines);
      setStrokes(next.strokes);
      setNotes(next.notes);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleClearAll = () => {
    setLines([]);
    setStrokes([]);
    setNotes([]);
    pushHistory([], [], []);
  };

  // Magnetic Snapping helper (20px threshold to endpoints and midpoints)
  const getMagneticSnapPoint = useCallback(
    (pos: Point2D, snapDistPx = 20): { pt: Point2D; type: 'endpoint' | 'midpoint' } | null => {
      let nearest: Point2D | null = null;
      let minD = snapDistPx;
      let snapType: 'endpoint' | 'midpoint' = 'endpoint';

      // 1. Check endpoints of all lines
      lines.forEach((l) => {
        [l.start, l.end].forEach((p) => {
          const d = Math.hypot(p.x - pos.x, p.y - pos.y);
          if (d < minD) {
            minD = d;
            nearest = p;
            snapType = 'endpoint';
          }
        });

        // Check midpoint
        const mid = { x: (l.start.x + l.end.x) / 2, y: (l.start.y + l.end.y) / 2 };
        const dMid = Math.hypot(mid.x - pos.x, mid.y - pos.y);
        if (dMid < minD) {
          minD = dMid;
          nearest = mid;
          snapType = 'midpoint';
        }
      });

      // 2. Check endpoints of strokes
      strokes.forEach((s) => {
        if (s.points.length > 0) {
          const first = s.points[0];
          const last = s.points[s.points.length - 1];
          [first, last].forEach((p) => {
            const d = Math.hypot(p.x - pos.x, p.y - pos.y);
            if (d < minD) {
              minD = d;
              nearest = p;
              snapType = 'endpoint';
            }
          });
        }
      });

      if (nearest) {
        return { pt: nearest, type: snapType };
      }
      return null;
    },
    [lines, strokes]
  );

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Background dark drafting canvas
    ctx.fillStyle = '#14171e';
    ctx.fillRect(0, 0, w, h);

    // 2. Grid (50px major, 10px minor)
    ctx.strokeStyle = '#1e2430';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 25) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += 25) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // 3. Zoomed Circle Boundary Overlay
    const cx = w / 2;
    const cy = h / 2;
    const rad = Math.min(w, h) * 0.44;

    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Render Saved Lines
    lines.forEach((l) => {
      ctx.strokeStyle = l.color;
      ctx.lineWidth = l.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(l.start.x, l.start.y);
      ctx.lineTo(l.end.x, l.end.y);
      ctx.stroke();

      // Endpoints vertices
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.arc(l.start.x, l.start.y, 3, 0, Math.PI * 2);
      ctx.arc(l.end.x, l.end.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Render Freehand Strokes
    strokes.forEach((st) => {
      if (st.points.length < 2) return;
      ctx.strokeStyle = st.color;
      ctx.lineWidth = st.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(st.points[0].x, st.points[0].y);
      for (let i = 1; i < st.points.length; i++) {
        ctx.lineTo(st.points[i].x, st.points[i].y);
      }
      ctx.stroke();
    });

    // 6. Live Rubberband Line
    if (activeTool === 'line' && isDrawing && currentLineStart && currentMousePos) {
      const snap = getMagneticSnapPoint(currentMousePos);
      const targetPos = snap ? snap.pt : currentMousePos;

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(currentLineStart.x, currentLineStart.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      ctx.restore();

      // Dimension length badge on rubberband line
      const d = Math.round(Math.hypot(targetPos.x - currentLineStart.x, targetPos.y - currentLineStart.y));
      const mx = (currentLineStart.x + targetPos.x) / 2;
      const my = (currentLineStart.y + targetPos.y) / 2;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(mx - 24, my - 12, 48, 16);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - 24, my - 12, 48, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${d}px`, mx, my - 4);
    }

    // 7. Live Freehand Stroke
    if (activeTool === 'freehand' && isDrawing && currentStrokePoints.length > 1) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentStrokePoints[0].x, currentStrokePoints[0].y);
      for (let i = 1; i < currentStrokePoints.length; i++) {
        ctx.lineTo(currentStrokePoints[i].x, currentStrokePoints[i].y);
      }
      ctx.stroke();
    }

    // 8. Render Notes (Text callouts with leader line)
    notes.forEach((nt) => {
      ctx.save();
      ctx.font = '600 11px system-ui, sans-serif';
      const textW = ctx.measureText(nt.text).width;

      // Note background tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(nt.pos.x - 4, nt.pos.y - 14, textW + 16, 20);
      ctx.strokeStyle = nt.color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(nt.pos.x - 4, nt.pos.y - 14, textW + 16, 20);

      // Note indicator pin
      ctx.fillStyle = nt.color;
      ctx.beginPath();
      ctx.arc(nt.pos.x + 2, nt.pos.y - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Note text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(nt.text, nt.pos.x + 10, nt.pos.y - 4);
      ctx.restore();
    });

    // 9. Render Snapping Indicator (Magnetic Snapping Ring within 20px)
    if (snapMarker) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.beginPath();
      ctx.arc(snapMarker.pt.x, snapMarker.pt.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Snapping Crosshair
      ctx.beginPath();
      ctx.moveTo(snapMarker.pt.x - 12, snapMarker.pt.y);
      ctx.lineTo(snapMarker.pt.x + 12, snapMarker.pt.y);
      ctx.moveTo(snapMarker.pt.x, snapMarker.pt.y - 12);
      ctx.lineTo(snapMarker.pt.x, snapMarker.pt.y + 12);
      ctx.stroke();

      // Snapping Tag text
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `SNAP 20px (${snapMarker.type === 'midpoint' ? 'Điểm Giữa' : 'Đầu Mút'})`,
        snapMarker.pt.x + 12,
        snapMarker.pt.y - 8
      );
      ctx.restore();
    }
  }, [
    lines,
    strokes,
    notes,
    activeTool,
    isDrawing,
    currentLineStart,
    currentMousePos,
    currentStrokePoints,
    strokeColor,
    strokeWidth,
    snapMarker,
    getMagneticSnapPoint,
  ]);

  // Mouse Handlers
  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point2D => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasMousePos(e);
    const snap = getMagneticSnapPoint(pos);
    const actualPt = snap ? snap.pt : pos;

    if (activeTool === 'eraser') {
      // Find nearest line, stroke, or note to delete
      const deletedLine = lines.filter(
        (l) => Math.hypot((l.start.x + l.end.x) / 2 - pos.x, (l.start.y + l.end.y) / 2 - pos.y) > 25
      );
      const deletedStrokes = strokes.filter(
        (st) => !st.points.some((p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 20)
      );
      const deletedNotes = notes.filter((n) => Math.hypot(n.pos.x - pos.x, n.pos.y - pos.y) > 25);

      if (
        deletedLine.length !== lines.length ||
        deletedStrokes.length !== strokes.length ||
        deletedNotes.length !== notes.length
      ) {
        setLines(deletedLine);
        setStrokes(deletedStrokes);
        setNotes(deletedNotes);
        pushHistory(deletedLine, deletedStrokes, deletedNotes);
      }
      return;
    }

    if (activeTool === 'note') {
      const newNote: DetailNote = {
        id: 'dn_' + Date.now(),
        pos: actualPt,
        text: noteInputText || 'Ghi chú kỹ thuật',
        color: strokeColor,
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      pushHistory(lines, strokes, updatedNotes);
      return;
    }

    if (activeTool === 'line') {
      setIsDrawing(true);
      setCurrentLineStart(actualPt);
      setCurrentMousePos(actualPt);
      return;
    }

    if (activeTool === 'freehand') {
      setIsDrawing(true);
      setCurrentStrokePoints([actualPt]);
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasMousePos(e);
    setCurrentMousePos(pos);

    // Magnetic snap detection (20px threshold)
    const snap = getMagneticSnapPoint(pos, 20);
    setSnapMarker(snap);

    if (!isDrawing) return;

    if (activeTool === 'freehand') {
      setCurrentStrokePoints((prev) => [...prev, pos]);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'line' && currentLineStart && currentMousePos) {
      const snap = getMagneticSnapPoint(currentMousePos);
      const endPt = snap ? snap.pt : currentMousePos;

      // Only add if not zero length
      if (Math.hypot(endPt.x - currentLineStart.x, endPt.y - currentLineStart.y) > 5) {
        const newLine: DetailLine = {
          id: 'dl_' + Date.now(),
          start: currentLineStart,
          end: endPt,
          color: strokeColor,
          width: strokeWidth,
        };
        const updatedLines = [...lines, newLine];
        setLines(updatedLines);
        pushHistory(updatedLines, strokes, notes);
      }
      setCurrentLineStart(null);
    }

    if (activeTool === 'freehand' && currentStrokePoints.length > 1) {
      const newStroke: DetailStroke = {
        id: 'st_' + Date.now(),
        points: currentStrokePoints,
        color: strokeColor,
        width: strokeWidth,
      };
      const updatedStrokes = [...strokes, newStroke];
      setStrokes(updatedStrokes);
      pushHistory(lines, updatedStrokes, notes);
      setCurrentStrokePoints([]);
    }
  };

  const handleCreateNewCallout = () => {
    const nextLetter = String.fromCharCode(65 + project.detailCallouts.length);
    const newCallout: DetailCallout = {
      id: 'dt_' + Date.now(),
      center: { x: 3200, y: 4500 },
      radius: 600,
      label: `TRÍCH CHI TIẾT ${nextLetter}`,
      scale: 'TỶ LỆ 1/10',
      description: 'Chi tiết liên kết cấu kiện và kích thước lắp đặt hoàn thiện',
    };
    onAddDetailCallout(newCallout);
    setSelectedCalloutId(newCallout.id);
  };

  return (
    <div className="flex-1 bg-[#161920] p-4 sm:p-6 text-slate-200 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header Banner */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-500" />
              <span>Đo Trích Phóng To Chi Tiết (Detail Extraction &amp; Callout)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Phóng to chi tiết liên kết (1/10, 1/20), tích hợp bút vẽ tay, thước đo, note ghi chú và tự động căn chỉnh Snap 20px
            </p>
          </div>
          <button
            onClick={handleCreateNewCallout}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Trích Chi Tiết Mới</span>
          </button>
        </div>

        {/* Callouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: List of Callouts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Danh Sách Điểm Trích ({project.detailCallouts.length})
            </h3>
            {project.detailCallouts.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-900/60 border border-slate-800 text-slate-500 text-xs">
                Chưa có điểm trích chi tiết nào. Bấm nút "Thêm Trích Chi Tiết Mới" để tạo.
              </div>
            ) : (
              project.detailCallouts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCalloutId(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    c.id === selectedCalloutId
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-400">{c.label}</span>
                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {c.scale}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80 font-mono">
                    <span>Tọa độ: X={c.center.x} Y={c.center.y}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDetailCallout(c.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Xóa điểm trích này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: Enlarged Interactive Detail Inspection & Drafting Canvas */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col space-y-4">
            {selectedCallout ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-amber-400" />
                      <span>{selectedCallout.label}</span>
                    </h3>
                    <p className="text-xs text-slate-400">{selectedCallout.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-mono font-bold">
                    {selectedCallout.scale}
                  </span>
                </div>

                {/* INTERACTIVE TOOLBAR (Vẽ tay, Note, Xóa, Undo/Redo, Snap 20px) */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  {/* Tools */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveTool('line')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        activeTool === 'line'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="Vẽ đoạn thẳng (Line)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Đoạn Thẳng</span>
                    </button>

                    <button
                      onClick={() => setActiveTool('freehand')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        activeTool === 'freehand'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="Vẽ tay tự do (Pen)"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Bút Vẽ Tay</span>
                    </button>

                    <button
                      onClick={() => setActiveTool('note')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        activeTool === 'note'
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="Ghi chú text (Note)"
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Ghi Chú</span>
                    </button>

                    <button
                      onClick={() => setActiveTool('eraser')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        activeTool === 'eraser'
                          ? 'bg-rose-500 text-white font-bold border-rose-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-rose-400'
                      }`}
                      title="Xóa đối tượng (Eraser)"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>

                  {/* Colors & Width */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {['#f59e0b', '#38bdf8', '#22c55e', '#ef4444', '#ffffff'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setStrokeColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                            strokeColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="w-px h-4 bg-slate-800" />

                    {/* Magnetic Snap Badge Indicator */}
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                      <Magnet className="w-3 h-3 text-emerald-400" />
                      <span>Snap 20px: BẬT</span>
                    </div>

                    <div className="w-px h-4 bg-slate-800" />

                    {/* Undo / Redo */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          historyIndex > 0 ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
                        }`}
                        title="Hoàn tác (Undo)"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          historyIndex < history.length - 1
                            ? 'text-slate-200 hover:bg-slate-800'
                            : 'text-slate-600 cursor-not-allowed'
                        }`}
                        title="Làm lại (Redo)"
                      >
                        <Redo2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleClearAll}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Xóa toàn bộ bản vẽ chi tiết"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Note text input when Note tool is active */}
                {activeTool === 'note' && (
                  <div className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400">Nội dung ghi chú:</span>
                    <input
                      type="text"
                      value={noteInputText}
                      onChange={(e) => setNoteInputText(e.target.value)}
                      placeholder="Nhập ghi chú thi công..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                    <span className="text-[10px] text-amber-400 italic">Click vào vị trí cần đặt ghi chú</span>
                  </div>
                )}

                {/* THE INTERACTIVE HIGH-RES DRAFTING CANVAS */}
                <div className="relative w-full aspect-video bg-[#14171d] rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={450}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => {
                      setIsDrawing(false);
                      setSnapMarker(null);
                    }}
                    className={`w-full h-full ${
                      activeTool === 'eraser'
                        ? 'cursor-cell'
                        : activeTool === 'note'
                        ? 'cursor-text'
                        : 'cursor-crosshair'
                    }`}
                  />

                  {/* Top-right Status Overlay */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 text-[10px] font-mono bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-300 backdrop-blur pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>CĂN CHỈNH TỰ ĐỘNG THRESHOLD 20PX</span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 font-mono pointer-events-none">
                    Đường nét: {lines.length} · Vẽ tay: {strokes.length} · Note: {notes.length}
                  </div>
                </div>

                {/* Construction Notes */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quy Cách Trích Đo Kỹ Thuật (TCVN):</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    - Đầu của các đường mới vẽ tự động bắt dính (Magnetic Snap) vào mút hoặc điểm giữa của đường liền kề trong phạm vi 20px.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    - Dùng công cụ "Ghi Chú" để đặt chú thích vật liệu kèm đường dóng chỉ dẫn thi công lắp đặt.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500 text-xs">
                Chọn một điểm trích chi tiết từ danh sách bên trái để phóng to xem cấu tạo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
