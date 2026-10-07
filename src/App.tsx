import React, { useState, useEffect, useCallback } from 'react';
import {
  ProjectData,
  Wall,
  CurvedWall,
  Opening,
  Column,
  Staircase,
  MepElement,
  LandscapeElement,
  FreehandStroke,
  DetailCallout,
  ElevSectEntity,
  Point2D,
  DiagonalCheck,
  LaserMeasurement,
  WallAngle,
  MepCategory,
  WallAlignment,
  Storey,
} from './types/cad';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { AngleCalculator } from './services/angleCalculator';
import { Header } from './components/Header';
import { SidebarTools, CadToolType } from './components/SidebarTools';
import { Canvas2D } from './components/Canvas2D';
import { ElevationSectionCanvas } from './components/ElevationSectionCanvas';
import { DetailExtractionView } from './components/DetailExtractionView';
import { Viewer3D } from './components/Viewer3D';
import { PropertyPanel } from './components/PropertyPanel';
import { LaserMeterModal } from './components/LaserMeterModal';
import { ExportModal } from './components/ExportModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { NewProjectModal } from './components/NewProjectModal';
import { UserGuideModal } from './components/UserGuideModal';
import { DiagonalView } from './components/DiagonalView';
import { MeasurementLogView } from './components/MeasurementLogView';
import { OtherViewsToolbox } from './components/OtherViewsToolbox';
import { laserService, LaserDeviceStatus } from './services/bluetoothLaser';
import { useDeviceConfig } from './hooks/useDeviceConfig';
import { DeviceModeSelectorModal } from './components/DeviceModeSelector';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileToolsSheet } from './components/MobileToolsSheet';
import { MobilePropertySheet } from './components/MobilePropertySheet';
import { MobileMoreSheet } from './components/MobileMoreSheet';
import { QuickLaserTrigger } from './components/QuickLaserTrigger';
import { RotateCw, Smartphone, Tablet, Monitor, Sliders, ChevronRight, ChevronLeft, Wifi, Battery, Maximize2 } from 'lucide-react';

export default function App() {
  // Device & OS Configuration (iPad, iPhone, Android, iOS)
  const {
    config: deviceConfig,
    setDeviceType,
    setOsType,
    toggleSimulateFrame,
    toggleOrientation,
  } = useDeviceConfig();

  const [isDeviceSelectorOpen, setIsDeviceSelectorOpen] = useState<boolean>(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState<boolean>(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState<boolean>(false);
  const [isTabletPanelOpen, setIsTabletPanelOpen] = useState<boolean>(false);

  const isIphone = deviceConfig.deviceType === 'iphone';
  const isIpad = deviceConfig.deviceType === 'ipad';
  const isDesktop = deviceConfig.deviceType === 'desktop';
  const isIos = deviceConfig.osType === 'ios';

  // Unified history state for atomic, robust Undo / Redo
  const [history, setHistory] = useState<{
    past: ProjectData[];
    present: ProjectData;
    future: ProjectData[];
  }>(() => {
    let initial = SAMPLE_PROJECTS[0];
    try {
      const saved = localStorage.getItem('four_ec_house_project_data') || localStorage.getItem('zhouse_cad_project_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.angles) parsed.angles = [];
        if (!parsed.curvedWalls) parsed.curvedWalls = [];
        if (!parsed.staircases) parsed.staircases = [];
        if (!parsed.mepElements) parsed.mepElements = [];
        if (!parsed.landscapeElements) parsed.landscapeElements = [];
        if (!parsed.freehandStrokes) parsed.freehandStrokes = [];
        if (!parsed.detailCallouts) parsed.detailCallouts = [];
        if (!parsed.elevSectEntities) parsed.elevSectEntities = [];
        if (parsed.underlayActive === undefined) parsed.underlayActive = false;
        if (parsed.underlayOpacity === undefined) parsed.underlayOpacity = 0.35;
        initial = parsed;
      }
    } catch {
      // fallback
    }
    return {
      past: [],
      present: initial,
      future: [],
    };
  });

  const project = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Custom setProject that pushes previous state to history
  const setProject = useCallback(
    (updater: ProjectData | ((prev: ProjectData) => ProjectData), recordHistory = true) => {
      setHistory((curr) => {
        const nextPresent = typeof updater === 'function' ? updater(curr.present) : updater;
        if (nextPresent === curr.present) return curr;

        if (!recordHistory) {
          return { ...curr, present: nextPresent };
        }
        return {
          past: [...curr.past.slice(-39), curr.present],
          present: nextPresent,
          future: [],
        };
      });
    },
    []
  );

  // Clear all selections helper
  const clearAllSelections = useCallback(() => {
    setSelectedWallId(null);
    setSelectedCurvedWallId(null);
    setSelectedOpeningId(null);
    setSelectedStairId(null);
    setSelectedColumnId(null);
    setSelectedMepId(null);
    setSelectedLandscapeId(null);
    setSelectedDetailCalloutId(null);
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future.slice(0, 39)],
      };
    });
    clearAllSelections();
  }, [clearAllSelections]);

  const handleRedo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      return {
        past: [...curr.past.slice(-39), curr.present],
        present: next,
        future: newFuture,
      };
    });
    clearAllSelections();
  }, [clearAllSelections]);

  // Navigation: Tách 2 trang chính (Mặt bằng 2D & Mặt đứng/mặt cắt) cùng các trang bổ trợ
  const [activeTab, setActiveTab] = useState<'2d' | 'elevation_section' | 'detail' | '3d' | 'diagonal' | 'log' | 'other_views'>('2d');
  const [activeTool, setActiveTool] = useState<CadToolType>('select');

  // Object Selections
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [selectedCurvedWallId, setSelectedCurvedWallId] = useState<string | null>(null);
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(null);
  const [selectedStairId, setSelectedStairId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [selectedMepId, setSelectedMepId] = useState<string | null>(null);
  const [selectedLandscapeId, setSelectedLandscapeId] = useState<string | null>(null);
  const [selectedDetailCalloutId, setSelectedDetailCalloutId] = useState<string | null>(null);

  // Modals
  const [isLaserModalOpen, setIsLaserModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState<boolean>(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);

  // Laser Device Status
  const [laserStatus, setLaserStatus] = useState<LaserDeviceStatus>(laserService.getStatus());

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('four_ec_house_project_data', JSON.stringify(history.present));
    } catch {
      // ignore quota
    }
  }, [history.present]);

  // Recalculate room area helper
  const recalculateRooms = useCallback((walls: Wall[]) => {
    return project.rooms.map((room) => {
      const roomWalls = walls.filter((w) => room.wallIds.includes(w.id));
      if (roomWalls.length < 3) return room;

      const perimeter = roomWalls.reduce((acc, w) => {
        const len = w.measuredLength || Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y);
        return acc + len / 1000;
      }, 0);

      let area = room.area;
      if (roomWalls.length >= 4) {
        const lengths = roomWalls.map(
          (w) => (w.measuredLength || Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y)) / 1000
        );
        lengths.sort((a, b) => b - a);
        area = Math.round(lengths[0] * lengths[1] * 0.85 * 10) / 10;
      }
      return { ...room, area, perimeter: Math.round(perimeter * 10) / 10 };
    });
  }, [project.rooms]);

  // Apply measurement to straight wall
  const handleApplyMeasurementToWall = useCallback(
    (wallId: string, valMm: number) => {
      setProject((prev) => {
        const wallIndex = prev.walls.findIndex((w) => w.id === wallId);
        if (wallIndex === -1) return prev;

        const targetWall = prev.walls[wallIndex];
        const dx = targetWall.end.x - targetWall.start.x;
        const dy = targetWall.end.y - targetWall.start.y;
        const currentLen = Math.hypot(dx, dy);

        if (currentLen < 1) return prev;

        const ux = dx / currentLen;
        const uy = dy / currentLen;
        const oldEnd = { ...targetWall.end };
        const newEnd: Point2D = {
          x: Math.round(targetWall.start.x + ux * valMm),
          y: Math.round(targetWall.start.y + uy * valMm),
        };

        const updatedWalls = prev.walls.map((w, idx) => {
          if (idx === wallIndex) {
            return {
              ...w,
              end: newEnd,
              measuredLength: valMm,
              isMeasuredWithLaser: true,
              laserTimestamp: new Date().toLocaleTimeString(),
            };
          }

          if (Math.hypot(w.start.x - oldEnd.x, w.start.y - oldEnd.y) < 50) {
            return { ...w, start: newEnd };
          }
          if (Math.hypot(w.end.x - oldEnd.x, w.end.y - oldEnd.y) < 50) {
            return { ...w, end: newEnd };
          }
          return w;
        });

        const logEntry: LaserMeasurement = {
          id: 'm_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          valueMm: valMm,
          targetName: targetWall.name || `Tường ${wallIndex + 1}`,
          deviceSource: laserStatus.connected ? 'BLE_DEVICE' : 'SIMULATOR',
          mode: 'WALL',
        };

        const updatedAngles = AngleCalculator.updateProjectAngles(
          updatedWalls,
          prev.angles || [],
          prev.diagonalChecks || []
        );

        return {
          ...prev,
          walls: updatedWalls,
          angles: updatedAngles,
          rooms: recalculateRooms(updatedWalls),
          measurementsLog: [logEntry, ...prev.measurementsLog],
        };
      });
    },
    [laserStatus.connected, recalculateRooms]
  );

  // Apply measurement to curved wall (Đo tường cong)
  const handleApplyMeasurementToCurvedWall = useCallback(
    (cwId: string, valMm: number) => {
      setProject((prev) => {
        const list = prev.curvedWalls ? [...prev.curvedWalls] : [];
        const idx = list.findIndex((c) => c.id === cwId);
        if (idx === -1) return prev;

        const target = list[idx];
        const updated: CurvedWall = {
          ...target,
          arcLength: valMm,
          radius: Math.round(valMm * 1.25),
          isMeasuredWithLaser: true,
        };
        list[idx] = updated;

        const logEntry: LaserMeasurement = {
          id: 'm_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          valueMm: valMm,
          targetName: target.name || `Tường cong ${idx + 1}`,
          deviceSource: laserStatus.connected ? 'BLE_DEVICE' : 'SIMULATOR',
          mode: 'CURVED',
        };

        return {
          ...prev,
          curvedWalls: list,
          measurementsLog: [logEntry, ...prev.measurementsLog],
        };
      });
    },
    [laserStatus.connected]
  );

  // Apply measurement to ceiling height
  const handleApplyMeasurementToHeight = useCallback(
    (valMm: number) => {
      setProject((prev) => ({
        ...prev,
        defaultCeilingHeight: valMm,
        walls: prev.walls.map((w) => ({ ...w, height: valMm })),
        measurementsLog: [
          {
            id: 'm_' + Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            valueMm: valMm,
            targetName: 'Chiều cao trần hiện trạng',
            deviceSource: laserStatus.connected ? 'BLE_DEVICE' : 'SIMULATOR',
            mode: 'HEIGHT',
          },
          ...prev.measurementsLog,
        ],
      }));
    },
    [laserStatus.connected]
  );

  // Apply measurement to diagonal
  const handleApplyMeasurementToDiagonal = useCallback(
    (valMm: number) => {
      setProject((prev) => {
        const diagId = 'diag_' + Date.now();
        const newDiag: DiagonalCheck = {
          id: diagId,
          name: `Đo chéo Laser (${new Date().toLocaleTimeString()})`,
          p1: { x: 0, y: 0 },
          p2: { x: valMm, y: 0 },
          measuredLength: valMm,
          calculatedLength: valMm,
          tolerance: 0,
          isVerified: true,
        };
        const newDiags = [newDiag, ...prev.diagonalChecks];
        const updatedAngles = AngleCalculator.updateProjectAngles(
          prev.walls,
          prev.angles || [],
          newDiags
        );

        return {
          ...prev,
          diagonalChecks: newDiags,
          angles: updatedAngles,
          measurementsLog: [
            {
              id: 'm_' + Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              valueMm: valMm,
              targetName: 'Đường chéo kiểm tra góc',
              deviceSource: laserStatus.connected ? 'BLE_DEVICE' : 'SIMULATOR',
              mode: 'DIAGONAL',
            },
            ...prev.measurementsLog,
          ],
        };
      });
    },
    [laserStatus.connected]
  );

  // Subscribe to Bluetooth Laser service
  useEffect(() => {
    const unsubStatus = laserService.subscribeStatus((st) => setLaserStatus(st));

    const unsubMeasure = laserService.subscribeMeasurement((valMm) => {
      if (selectedWallId) {
        handleApplyMeasurementToWall(selectedWallId, valMm);
      } else if (selectedCurvedWallId) {
        handleApplyMeasurementToCurvedWall(selectedCurvedWallId, valMm);
      } else {
        const newLog: LaserMeasurement = {
          id: 'm_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          valueMm: valMm,
          targetName: 'Số đo laser tự do',
          deviceSource: laserStatus.connected ? 'BLE_DEVICE' : 'SIMULATOR',
          mode: 'FREE',
        };
        setProject((p) => ({
          ...p,
          measurementsLog: [newLog, ...p.measurementsLog],
        }));
      }
    });

    return () => {
      unsubStatus();
      unsubMeasure();
    };
  }, [selectedWallId, selectedCurvedWallId, laserStatus.connected, handleApplyMeasurementToWall, handleApplyMeasurementToCurvedWall]);

  // Wall management
  const handleAddWall = (start: Point2D, end: Point2D, alignment?: WallAlignment, thickness?: number) => {
    let finalEnd = { ...end };
    let wallToSplit: Wall | null = null;
    let splitPt: Point2D | null = null;

    // Line intersection helper
    const getSegmentIntersection = (p0: Point2D, p1: Point2D, p2: Point2D, p3: Point2D): Point2D | null => {
      const s1_x = p1.x - p0.x;
      const s1_y = p1.y - p0.y;
      const s2_x = p3.x - p2.x;
      const s2_y = p3.y - p2.y;

      const denom = -s2_x * s1_y + s1_x * s2_y;
      if (Math.abs(denom) < 1e-5) return null;

      const s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / denom;
      const t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / denom;

      if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        const intX = p0.x + t * s1_x;
        const intY = p0.y + t * s1_y;
        const pt = { x: intX, y: intY };

        // Avoid splitting at the exact endpoints of the existing wall (use a small 15mm tolerance)
        const dStart = Math.hypot(p2.x - pt.x, p2.y - pt.y);
        const dEnd = Math.hypot(p3.x - pt.x, p3.y - pt.y);
        if (dStart < 15 || dEnd < 15) return null;

        return pt;
      }
      return null;
    };

    // Find all intersections with existing walls
    const intersections: { pt: Point2D; wall: Wall; dist: number }[] = [];
    project.walls.forEach((w) => {
      const pt = getSegmentIntersection(start, end, w.start, w.end);
      if (pt) {
        const dist = Math.hypot(pt.x - start.x, pt.y - start.y);
        if (dist > 50) { // must be away from the start of the new wall
          intersections.push({ pt, wall: w, dist });
        }
      }
    });

    if (intersections.length > 0) {
      // Sort by distance ascending to find the closest intersection
      intersections.sort((a, b) => a.dist - b.dist);
      const closest = intersections[0];
      finalEnd = closest.pt;
      wallToSplit = closest.wall;
      splitPt = closest.pt;
    }

    const len = Math.hypot(finalEnd.x - start.x, finalEnd.y - start.y);
    const newWall: Wall = {
      id: 'w_' + Date.now(),
      start,
      end: finalEnd,
      thickness: thickness || project.defaultWallThickness || 110,
      height: project.defaultCeilingHeight || 2800,
      alignment: alignment || project.defaultWallAlignment || 'center',
      name: `Tường ${project.walls.length + 1}`,
      measuredLength: Math.round(len),
      isMeasuredWithLaser: false,
      storeyId: project.activeStoreyId,
    };

    setProject((prev) => {
      let updatedWalls = [...prev.walls];

      if (wallToSplit && splitPt) {
        // Remove the split wall and replace it with two sub-segments that meet at splitPt
        updatedWalls = updatedWalls.filter((w) => w.id !== wallToSplit!.id);

        const part1: Wall = {
          ...wallToSplit,
          id: 'w_' + Date.now() + '_s1',
          end: splitPt,
          measuredLength: Math.round(Math.hypot(splitPt.x - wallToSplit.start.x, splitPt.y - wallToSplit.start.y)),
          name: wallToSplit.name + ' (A)',
        };

        const part2: Wall = {
          ...wallToSplit,
          id: 'w_' + Date.now() + '_s2',
          start: splitPt,
          measuredLength: Math.round(Math.hypot(wallToSplit.end.x - splitPt.x, wallToSplit.end.y - splitPt.y)),
          name: wallToSplit.name + ' (B)',
        };

        updatedWalls.push(part1, part2);
      }

      updatedWalls.push(newWall);

      return {
        ...prev,
        walls: updatedWalls,
      };
    });

    clearAllSelections();
    setSelectedWallId(newWall.id);
  };

  // Storey / Floor plan management
  const handleSelectStorey = (storeyId: string) => {
    setProject((prev) => ({
      ...prev,
      activeStoreyId: storeyId,
    }));
  };

  const handleAddStorey = (storey: Storey) => {
    setProject((prev) => {
      const current = prev.storeys || [];
      return {
        ...prev,
        storeys: [...current, storey],
        activeStoreyId: storey.id,
      };
    });
  };

  const handleUpdateStorey = (storey: Storey) => {
    setProject((prev) => {
      const current = prev.storeys || [];
      return {
        ...prev,
        storeys: current.map((s) => (s.id === storey.id ? storey : s)),
      };
    });
  };

  const handleDeleteStorey = (storeyId: string) => {
    setProject((prev) => {
      const current = prev.storeys || [];
      const remaining = current.filter((s) => s.id !== storeyId);
      return {
        ...prev,
        storeys: remaining,
        activeStoreyId: prev.activeStoreyId === storeyId ? (remaining[0]?.id || undefined) : prev.activeStoreyId,
      };
    });
  };

  const handleUpdateWall = (wall: Wall) => {
    setProject((prev) => ({
      ...prev,
      walls: prev.walls.map((w) => (w.id === wall.id ? wall : w)),
    }));
  };

  const handleDeleteWall = (wallId: string) => {
    setProject((prev) => ({
      ...prev,
      walls: prev.walls.filter((w) => w.id !== wallId),
      openings: prev.openings.filter((op) => op.wallId !== wallId),
      angles: (prev.angles || []).filter((a) => a.wall1Id !== wallId && a.wall2Id !== wallId),
    }));
    if (selectedWallId === wallId) setSelectedWallId(null);
  };

  // Curved Wall Management (Đo tường cong)
  const handleAddCurvedWall = (start: Point2D, end: Point2D, ctrl: Point2D) => {
    const chordLen = Math.hypot(end.x - start.x, end.y - start.y);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const sagitta = Math.round(Math.hypot(ctrl.x - midX, ctrl.y - midY));
    const radius = sagitta > 0 ? Math.round((chordLen * chordLen) / (8 * sagitta) + sagitta / 2) : 1500;
    const arcLen = Math.round(chordLen * 1.08);

    const newCurvedWall: CurvedWall = {
      id: 'cw_' + Date.now(),
      start,
      end,
      controlPoint: ctrl,
      radius: Math.max(500, radius),
      chordLength: Math.round(chordLen),
      sagitta: Math.max(50, sagitta),
      arcLength: arcLen,
      thickness: project.defaultWallThickness,
      height: project.defaultCeilingHeight,
      name: `Tường cong ${(project.curvedWalls?.length || 0) + 1}`,
      isMeasuredWithLaser: false,
    };

    setProject((prev) => ({
      ...prev,
      curvedWalls: [...(prev.curvedWalls || []), newCurvedWall],
    }));
    clearAllSelections();
    setSelectedCurvedWallId(newCurvedWall.id);
  };

  const handleUpdateCurvedWall = (cw: CurvedWall) => {
    setProject((prev) => ({
      ...prev,
      curvedWalls: (prev.curvedWalls || []).map((item) => (item.id === cw.id ? cw : item)),
    }));
  };

  const handleDeleteCurvedWall = (id: string) => {
    setProject((prev) => ({
      ...prev,
      curvedWalls: (prev.curvedWalls || []).filter((c) => c.id !== id),
    }));
    if (selectedCurvedWallId === id) setSelectedCurvedWallId(null);
  };

  // Staircase Management (Block CAD Cầu thang)
  const handleAddStaircase = (pt: Point2D) => {
    const newStair: Staircase = {
      id: 'stair_' + Date.now(),
      type: 'u_shape',
      position: pt,
      rotation: 0,
      runWidth: 950,
      totalLength: 3200,
      stepCount: 19,
      riserHeight: 175,
      treadDepth: 260,
      landingType: 'split_2',
      stepsBeforeLanding: 9,
      stepsAfterLanding: 8,
      stairWellGap: 100,
      name: `Cầu thang ${(project.staircases?.length || 0) + 1}`,
    };

    setProject((prev) => ({
      ...prev,
      staircases: [...(prev.staircases || []), newStair],
    }));
    clearAllSelections();
    setSelectedStairId(newStair.id);
  };

  const handleUpdateStaircase = (stair: Staircase) => {
    setProject((prev) => ({
      ...prev,
      staircases: (prev.staircases || []).map((s) => (s.id === stair.id ? stair : s)),
    }));
  };

  const handleDeleteStaircase = (id: string) => {
    setProject((prev) => ({
      ...prev,
      staircases: (prev.staircases || []).filter((s) => s.id !== id),
    }));
    if (selectedStairId === id) setSelectedStairId(null);
  };

  // Openings management (Cửa đi, cửa sổ, vách kính)
  const handleAddOpening = (wallId: string, type: any, distMm: number) => {
    const isDoor = type.startsWith('door');
    const isGlass = type === 'glass_partition';
    const newOpening: Opening = {
      id: 'op_' + Date.now(),
      wallId,
      type,
      distanceFromStart: distMm,
      width: isDoor ? 950 : isGlass ? 2000 : 1400,
      height: isDoor ? 2200 : isGlass ? 2600 : 1400,
      sillHeight: isDoor || isGlass ? 0 : 900,
      leafCount: isDoor ? 1 : 2,
      swingInside: true,
      name: isDoor
        ? `Cửa đi ${project.openings.length + 1}`
        : isGlass
        ? `Vách kính ${project.openings.length + 1}`
        : `Cửa sổ ${project.openings.length + 1}`,
    };

    setProject((prev) => ({
      ...prev,
      openings: [...prev.openings, newOpening],
    }));
    clearAllSelections();
    setSelectedOpeningId(newOpening.id);
  };

  const handleUpdateOpening = (opening: Opening) => {
    setProject((prev) => ({
      ...prev,
      openings: prev.openings.map((op) => (op.id === opening.id ? opening : op)),
    }));
  };

  const handleDeleteOpening = (openingId: string) => {
    setProject((prev) => ({
      ...prev,
      openings: prev.openings.filter((op) => op.id !== openingId),
    }));
    if (selectedOpeningId === openingId) setSelectedOpeningId(null);
  };

  // Columns management (Cột thép I, U, hộp & BTCT)
  const handleAddColumn = (pt: Point2D) => {
    const newCol: Column = {
      id: 'col_' + Date.now(),
      x: pt.x,
      y: pt.y,
      width: 200,
      depth: 200,
      flangeThickness: 10,
      webThickness: 6,
      rotation: 0,
      type: 'steel_i',
      profileName: 'Cột thép I200x200',
    };
    setProject((prev) => ({
      ...prev,
      columns: [...prev.columns, newCol],
    }));
    clearAllSelections();
    setSelectedColumnId(newCol.id);
  };

  const handleUpdateColumn = (col: Column) => {
    setProject((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.id === col.id ? col : c)),
    }));
  };

  const handleDeleteColumn = (id: string) => {
    setProject((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== id),
    }));
    if (selectedColumnId === id) setSelectedColumnId(null);
  };

  // MEP Elements management (Kí hiệu cơ điện)
  const handleAddMepElement = (pt: Point2D, category: MepCategory) => {
    const defaultElevations: Record<MepCategory, number> = {
      socket_double: 300,
      socket_single: 300,
      switch_single_1way: 1200,
      switch_single_2way: 1200,
      switch_double_1way: 1200,
      switch_double_2way: 1200,
      water_meter: 400,
      switch_1: 1200,
      switch_2: 1200,
      panel_db: 1500,
      light_ceiling: 2800,
      ac_indoor: 2500,
      water_supply: 600,
      water_drain: 0,
      toilet_drain: 0,
      fire_detector: 2800,
      fire_hydrant: 1200,
    };

    const defaultLabels: Record<MepCategory, string> = {
      socket_double: 'Ổ cắm đôi 220V',
      socket_single: 'Ổ cắm đơn 220V',
      switch_single_1way: 'Công tắc đơn 1 chiều',
      switch_single_2way: 'Công tắc đơn 2 chiều',
      switch_double_1way: 'Công tắc đôi 1 chiều',
      switch_double_2way: 'Công tắc đôi 2 chiều',
      water_meter: 'Đồng hồ nước ĐH',
      switch_1: 'Công tắc đơn 1 chiều',
      switch_2: 'Công tắc đôi 1 chiều',
      panel_db: 'Tủ điện tổng DB',
      light_ceiling: 'Đèn Downlight',
      ac_indoor: 'Máy lạnh Indoor Unit',
      water_supply: 'Cấp nước D21',
      water_drain: 'Phễu thoát sàn D60',
      toilet_drain: 'Ống xả bồn cầu D110',
      fire_detector: 'Đầu báo cháy quang học',
      fire_hydrant: 'Tủ cứu hỏa vách tường',
    };

    const newMep: MepElement = {
      id: 'mep_' + Date.now(),
      category,
      position: pt,
      rotation: 0,
      elevationMm: defaultElevations[category] ?? 300,
      label: defaultLabels[category] ?? 'MEP',
    };

    setProject((prev) => ({
      ...prev,
      mepElements: [...(prev.mepElements || []), newMep],
    }));
    clearAllSelections();
    setSelectedMepId(newMep.id);
  };

  const handleUpdateMepElement = (mep: MepElement) => {
    setProject((prev) => ({
      ...prev,
      mepElements: (prev.mepElements || []).map((m) => (m.id === mep.id ? mep : m)),
    }));
  };

  const handleDeleteMepElement = (id: string) => {
    setProject((prev) => ({
      ...prev,
      mepElements: (prev.mepElements || []).filter((m) => m.id !== id),
    }));
    if (selectedMepId === id) setSelectedMepId(null);
  };

  // Landscape management (Cây xanh)
  const handleAddLandscape = (pt: Point2D, type: 'shrub' | 'tree_large') => {
    const newLs: LandscapeElement = {
      id: 'ls_' + Date.now(),
      type,
      position: pt,
      radius: type === 'shrub' ? 400 : 700,
      name: type === 'shrub' ? 'Cây bụi ban công' : 'Cây lớn sân vườn',
    };
    setProject((prev) => ({
      ...prev,
      landscapeElements: [...(prev.landscapeElements || []), newLs],
    }));
    clearAllSelections();
    setSelectedLandscapeId(newLs.id);
  };

  const handleUpdateLandscape = (ls: LandscapeElement) => {
    setProject((prev) => ({
      ...prev,
      landscapeElements: (prev.landscapeElements || []).map((l) => (l.id === ls.id ? ls : l)),
    }));
  };

  const handleDeleteLandscape = (id: string) => {
    setProject((prev) => ({
      ...prev,
      landscapeElements: (prev.landscapeElements || []).filter((l) => l.id !== id),
    }));
    if (selectedLandscapeId === id) setSelectedLandscapeId(null);
  };

  // Freehand Strokes (Vẽ tay note)
  const handleAddFreehandStroke = (stroke: FreehandStroke) => {
    setProject((prev) => ({
      ...prev,
      freehandStrokes: [...(prev.freehandStrokes || []), stroke],
    }));
  };

  const handleDeleteFreehandStroke = (id: string) => {
    setProject((prev) => ({
      ...prev,
      freehandStrokes: (prev.freehandStrokes || []).filter((s) => s.id !== id),
    }));
  };

  // Detail Callouts (Đo trích chi tiết)
  const handleAddDetailCallout = (callout: DetailCallout) => {
    setProject((prev) => ({
      ...prev,
      detailCallouts: [...(prev.detailCallouts || []), callout],
    }));
    clearAllSelections();
    setSelectedDetailCalloutId(callout.id);
  };

  const handleUpdateDetailCallout = (callout: DetailCallout) => {
    setProject((prev) => ({
      ...prev,
      detailCallouts: (prev.detailCallouts || []).map((d) => (d.id === callout.id ? callout : d)),
    }));
  };

  const handleDeleteDetailCallout = (id: string) => {
    setProject((prev) => ({
      ...prev,
      detailCallouts: (prev.detailCallouts || []).filter((d) => d.id !== id),
    }));
    if (selectedDetailCalloutId === id) setSelectedDetailCalloutId(null);
  };

  // Diagonals management
  const handleAddDiagonal = (p1: Point2D, p2: Point2D) => {
    const calcLen = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const newDiag: DiagonalCheck = {
      id: 'diag_' + Date.now(),
      name: `Đường chéo ${project.diagonalChecks.length + 1}`,
      p1,
      p2,
      measuredLength: Math.round(calcLen),
      calculatedLength: Math.round(calcLen),
      tolerance: 0,
      isVerified: true,
    };
    setProject((prev) => ({
      ...prev,
      diagonalChecks: [...prev.diagonalChecks, newDiag],
    }));
  };

  const handleDeleteDiagonal = (id: string) => {
    setProject((prev) => ({
      ...prev,
      diagonalChecks: prev.diagonalChecks.filter((d) => d.id !== id),
    }));
  };

  // Wall Angle Management
  const handleAddAngle = (wall1Id: string, wall2Id: string) => {
    const w1 = project.walls.find((w) => w.id === wall1Id);
    const w2 = project.walls.find((w) => w.id === wall2Id);
    if (!w1 || !w2) return;

    const calc = AngleCalculator.calculateAngle(w1, w2, project.diagonalChecks);
    if (!calc) return;

    const existingIdx = (project.angles || []).findIndex(
      (a) =>
        (a.wall1Id === wall1Id && a.wall2Id === wall2Id) ||
        (a.wall1Id === wall2Id && a.wall2Id === wall1Id)
    );

    const newAngle: WallAngle = {
      id: existingIdx >= 0 ? project.angles[existingIdx].id : 'ang_' + Date.now(),
      wall1Id,
      wall2Id,
      vertex: calc.vertex,
      angleDeg: calc.angleDeg,
      deviationFrom90Deg: calc.deviationFrom90Deg,
      isCalculatedFromLaser: calc.isCalculatedFromLaser,
      diagonalDistanceMm: calc.diagonalDistanceMm,
    };

    setProject((prev) => {
      const list = prev.angles ? [...prev.angles] : [];
      if (existingIdx >= 0) {
        list[existingIdx] = newAngle;
      } else {
        list.push(newAngle);
      }
      return { ...prev, angles: list };
    });
  };

  const handleDeleteAngle = (angleId: string) => {
    setProject((prev) => ({
      ...prev,
      angles: (prev.angles || []).filter((a) => a.id !== angleId),
    }));
  };

  // Underlay Handlers (Đè mờ mặt bằng)
  const handleToggleUnderlay = (active: boolean) => {
    setProject((prev) => ({
      ...prev,
      underlayActive: active,
    }));
  };

  const handleUpdateUnderlayOpacity = (opacity: number) => {
    setProject((prev) => ({
      ...prev,
      underlayOpacity: opacity,
    }));
  };

  // Elevation & Section Handlers (Mặt đứng & Mặt cắt)
  const handleAddElevSectEntity = (entity: ElevSectEntity) => {
    setProject((prev) => ({
      ...prev,
      elevSectEntities: [...(prev.elevSectEntities || []), entity],
    }));
  };

  const handleUpdateElevSectEntity = (entity: ElevSectEntity) => {
    setProject((prev) => ({
      ...prev,
      elevSectEntities: (prev.elevSectEntities || []).map((e) => (e.id === entity.id ? entity : e)),
    }));
  };

  const handleDeleteElevSectEntity = (id: string) => {
    setProject((prev) => ({
      ...prev,
      elevSectEntities: (prev.elevSectEntities || []).filter((e) => e.id !== id),
    }));
  };

  // Quick room generator (4x5m)
  const handleAddQuickRoom = (shape: 'rect' | 'l_shape') => {
    const startX = 1000;
    const startY = 1000;
    const w = 4500;
    const h = 5500;

    const w1: Wall = { id: 'w_' + Date.now() + '_1', start: { x: startX, y: startY }, end: { x: startX + w, y: startY }, thickness: 220, height: 2800, name: 'Tường A (Mặt trước)', isMeasuredWithLaser: false, measuredLength: w };
    const w2: Wall = { id: 'w_' + Date.now() + '_2', start: { x: startX + w, y: startY }, end: { x: startX + w, y: startY + h }, thickness: 220, height: 2800, name: 'Tường B (Bên phải)', isMeasuredWithLaser: false, measuredLength: h };
    const w3: Wall = { id: 'w_' + Date.now() + '_3', start: { x: startX + w, y: startY + h }, end: { x: startX, y: startY + h }, thickness: 220, height: 2800, name: 'Tường C (Mặt sau)', isMeasuredWithLaser: false, measuredLength: w };
    const w4: Wall = { id: 'w_' + Date.now() + '_4', start: { x: startX, y: startY + h }, end: { x: startX, y: startY }, thickness: 220, height: 2800, name: 'Tường D (Bên trái)', isMeasuredWithLaser: false, measuredLength: h };

    const newWalls = [w1, w2, w3, w4];
    const newRoom = {
      id: 'r_' + Date.now(),
      name: 'Phòng Mới Khảo Sát',
      wallIds: newWalls.map((w) => w.id),
      area: 24.8,
      perimeter: 20.0,
    };

    setProject((prev) => ({
      ...prev,
      walls: [...prev.walls, ...newWalls],
      rooms: [...prev.rooms, newRoom],
    }));
    clearAllSelections();
    setSelectedWallId(w1.id);
  };

  // Create new project with undo history support
  const handleCreateProject = (newProject: ProjectData) => {
    setHistory({
      past: [...history.past, history.present],
      present: newProject,
      future: [],
    });
    clearAllSelections();
    setActiveTab('2d');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable) return;

      // Undo / Redo keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // New Project keyboard shortcut (Ctrl+N or Cmd+N)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setIsNewProjectOpen(true);
        return;
      }

      // User Guide shortcut (? or F1)
      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setIsUserGuideOpen(true);
        return;
      }

      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      else if (e.key === 'e' || e.key === 'E') setActiveTool('eraser');
      else if (e.key === 'w' || e.key === 'W') setActiveTool('wall');
      else if (e.key === 'q' || e.key === 'Q') setActiveTool('curved_wall');
      else if (e.key === 'b' || e.key === 'B') setActiveTool('railing');
      else if (e.key === 'r' || e.key === 'R') setActiveTool('roof');
      else if (e.key === 't' || e.key === 'T') setActiveTool('stair');
      else if (e.key === 'd' || e.key === 'D') setActiveTool('door');
      else if (e.key === 's' || e.key === 'S') setActiveTool('window');
      else if (e.key === 'c' || e.key === 'C') setActiveTool('column');
      else if (e.key === 'm' || e.key === 'M') setActiveTool('mep');
      else if (e.key === 'l' || e.key === 'L') setActiveTool('landscape');
      else if (e.key === 'p' || e.key === 'P') setActiveTool('pen_draw');
      else if (e.key === 'j' || e.key === 'J') setActiveTool('detail_callout');
      else if (e.key === 'a' || e.key === 'A') setActiveTool('angle');
      else if (e.key === 'x' || e.key === 'X') setActiveTool('diagonal');
      else if (e.key === 'Escape') {
        clearAllSelections();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedWallId) handleDeleteWall(selectedWallId);
        else if (selectedCurvedWallId) handleDeleteCurvedWall(selectedCurvedWallId);
        else if (selectedOpeningId) handleDeleteOpening(selectedOpeningId);
        else if (selectedStairId) handleDeleteStaircase(selectedStairId);
        else if (selectedColumnId) handleDeleteColumn(selectedColumnId);
        else if (selectedMepId) handleDeleteMepElement(selectedMepId);
        else if (selectedLandscapeId) handleDeleteLandscape(selectedLandscapeId);
        else if (selectedDetailCalloutId) handleDeleteDetailCallout(selectedDetailCalloutId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    selectedWallId,
    selectedCurvedWallId,
    selectedOpeningId,
    selectedStairId,
    selectedColumnId,
    selectedMepId,
    selectedLandscapeId,
    selectedDetailCalloutId,
    clearAllSelections,
  ]);

  return (
    <div className={`w-screen h-screen overflow-hidden font-sans select-none flex flex-col ${
      deviceConfig.simulateFrame && !isDesktop ? 'bg-[#0b0d11] items-center justify-center p-2 sm:p-4' : 'bg-[#111317]'
    }`}>
      {/* Simulation Controls Banner when frame is active on Desktop */}
      {deviceConfig.simulateFrame && !isDesktop && (
        <div className="flex items-center gap-3 mb-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs shadow-xl z-50">
          <span className="text-amber-400 font-bold flex items-center gap-1.5">
            {isIphone ? <Smartphone className="w-3.5 h-3.5" /> : <Tablet className="w-3.5 h-3.5" />}
            <span>Mô phỏng: {isIphone ? 'iPhone' : 'iPad'} ({isIos ? 'Apple iOS' : 'Google Android'})</span>
          </span>
          <span className="text-slate-600">|</span>
          <button
            onClick={toggleOrientation}
            className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Xoay dọc / ngang"
          >
            <RotateCw className="w-3 h-3 text-sky-400" />
            <span>{deviceConfig.orientation === 'portrait' ? 'Xoay Ngang' : 'Xoay Dọc'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setIsDeviceSelectorOpen(true)}
            className="text-slate-300 hover:text-amber-400 cursor-pointer transition-colors"
          >
            Đổi thiết bị
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={toggleSimulateFrame}
            className="text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
            title="Thoát chế độ mô phỏng khung"
          >
            Toàn màn hình
          </button>
        </div>
      )}

      {/* Main Container / Simulated Device Shell */}
      <div
        className={`flex flex-col text-slate-100 overflow-hidden relative transition-all ${
          deviceConfig.simulateFrame && !isDesktop
            ? isIphone
              ? deviceConfig.orientation === 'portrait'
                ? 'w-[390px] h-[844px] rounded-[50px] border-[12px] border-slate-800 shadow-2xl shadow-black ring-1 ring-slate-700/50 bg-[#111317]'
                : 'w-[844px] h-[390px] rounded-[50px] border-[12px] border-slate-800 shadow-2xl shadow-black ring-1 ring-slate-700/50 bg-[#111317]'
              : deviceConfig.orientation === 'portrait'
              ? 'w-[768px] h-[1024px] rounded-[36px] border-[16px] border-slate-800 shadow-2xl shadow-black ring-1 ring-slate-700/50 bg-[#111317]'
              : 'w-[1024px] h-[768px] rounded-[36px] border-[16px] border-slate-800 shadow-2xl shadow-black ring-1 ring-slate-700/50 bg-[#111317]'
            : 'w-full h-full bg-[#111317]'
        }`}
      >
        {/* iPhone Dynamic Island Mockup on Simulation */}
        {deviceConfig.simulateFrame && isIphone && deviceConfig.orientation === 'portrait' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 pointer-events-none flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
          </div>
        )}

        {/* 1. Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          laserStatus={laserStatus}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOpenLaserModal={() => setIsLaserModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenProjectSettings={() => setIsProjectSettingsOpen(true)}
          projectName={project.name}
          deviceConfig={deviceConfig}
          onOpenDeviceSelector={() => setIsDeviceSelectorOpen(true)}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenUserGuide={() => setIsUserGuideOpen(true)}
        />

        {/* 2. Main Workspace Layout */}
        <div className={`flex flex-1 w-full overflow-hidden relative ${isIphone ? 'h-[calc(100vh-108px)]' : 'h-[calc(100vh-53px)]'}`}>
          {/* Left CAD Toolbar (Only visible on Desktop or iPad 2D Mặt Bằng view) */}
          {!isIphone && activeTab === '2d' && (
            <SidebarTools
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              onAddQuickRoom={handleAddQuickRoom}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          )}

          {/* Center Workspace */}
          <main className="flex-1 relative h-full overflow-hidden flex flex-col">
            {/* TRANG 1: MẶT BẰNG 2D (Tường thẳng, cong, cầu thang, cột, MEP, cây, ghi chú note, trích chi tiết) */}
            {activeTab === '2d' && (
              <div className="relative w-full h-full">
                <Canvas2D
                  project={project}
                  activeTool={activeTool}
                  selectedWallId={selectedWallId}
                  onSelectWall={(id) => {
                    clearAllSelections();
                    setSelectedWallId(id);
                  }}
                  selectedCurvedWallId={selectedCurvedWallId}
                  onSelectCurvedWall={(id) => {
                    clearAllSelections();
                    setSelectedCurvedWallId(id);
                  }}
                  selectedOpeningId={selectedOpeningId}
                  onSelectOpening={(id) => {
                    clearAllSelections();
                    setSelectedOpeningId(id);
                  }}
                  selectedStairId={selectedStairId}
                  onSelectStair={(id) => {
                    clearAllSelections();
                    setSelectedStairId(id);
                  }}
                  selectedColumnId={selectedColumnId}
                  onSelectColumn={(id) => {
                    clearAllSelections();
                    setSelectedColumnId(id);
                  }}
                  selectedMepId={selectedMepId}
                  onSelectMep={(id) => {
                    clearAllSelections();
                    setSelectedMepId(id);
                  }}
                  selectedLandscapeId={selectedLandscapeId}
                  onSelectLandscape={(id) => {
                    clearAllSelections();
                    setSelectedLandscapeId(id);
                  }}
                  selectedDetailCalloutId={selectedDetailCalloutId}
                  onSelectDetailCallout={(id) => {
                    clearAllSelections();
                    setSelectedDetailCalloutId(id);
                  }}
                  onUpdateWall={handleUpdateWall}
                  onAddWall={handleAddWall}
                  onAddCurvedWall={handleAddCurvedWall}
                  onAddAngle={handleAddAngle}
                  onAddOpening={handleAddOpening}
                  onAddColumn={handleAddColumn}
                  onAddStaircase={handleAddStaircase}
                  onAddMepElement={handleAddMepElement}
                  onAddLandscape={handleAddLandscape}
                  onAddFreehandStroke={handleAddFreehandStroke}
                  onAddDetailCallout={handleAddDetailCallout}
                  onAddDiagonal={handleAddDiagonal}
                  onAddNote={() => {}}
                  onTriggerLaserForSelected={() => setIsLaserModalOpen(true)}
                  onToggleUnderlay={handleToggleUnderlay}
                  onUpdateUnderlayOpacity={handleUpdateUnderlayOpacity}
                  onDeleteWall={handleDeleteWall}
                  onDeleteCurvedWall={handleDeleteCurvedWall}
                  onDeleteOpening={handleDeleteOpening}
                  onDeleteColumn={handleDeleteColumn}
                  onDeleteStair={handleDeleteStaircase}
                  onDeleteMep={handleDeleteMepElement}
                  onDeleteLandscape={handleDeleteLandscape}
                  onDeleteFreehandStroke={handleDeleteFreehandStroke}
                  onDeleteDetailCallout={handleDeleteDetailCallout}
                  onDeleteDiagonal={handleDeleteDiagonal}
                  onDeleteAngle={handleDeleteAngle}
                  onSelectStorey={handleSelectStorey}
                  onAddStorey={handleAddStorey}
                  onUpdateStorey={handleUpdateStorey}
                  onDeleteStorey={handleDeleteStorey}
                  onAddElevSectEntity={handleAddElevSectEntity}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                />

                {/* iPad Inspector Collapse/Expand Floating Trigger */}
                {isIpad && (
                  <button
                    onClick={() => setIsTabletPanelOpen(!isTabletPanelOpen)}
                    className="absolute top-4 right-20 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-700/80 text-xs text-slate-300 hover:text-white shadow-lg cursor-pointer"
                    title={isTabletPanelOpen ? 'Thu gọn bảng thuộc tính' : 'Mở bảng thuộc tính'}
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isTabletPanelOpen ? 'Ẩn Panel' : 'Thuộc tính'}</span>
                  </button>
                )}
              </div>
            )}

            {/* TRANG 2: MẶT ĐỨNG & MẶT CẮT (Đo cao độ tầng, dầm sàn, mái dốc/bằng, lan can ban công, đè mờ dóng trục) */}
            {activeTab === 'elevation_section' && (
              <ElevationSectionCanvas
                project={project}
                onUpdateEntity={handleUpdateElevSectEntity}
                onAddEntity={handleAddElevSectEntity}
                onDeleteEntity={handleDeleteElevSectEntity}
                onToggleUnderlay={handleToggleUnderlay}
                onUpdateUnderlayOpacity={handleUpdateUnderlayOpacity}
                onUpdateStorey={handleUpdateStorey}
                onAddStorey={handleAddStorey}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            )}

            {/* TRANG 3: ĐO TRÍCH PHÓNG TO CHI TIẾT */}
            {activeTab === 'detail' && (
              <DetailExtractionView
                project={project}
                onAddDetailCallout={handleAddDetailCallout}
                onDeleteDetailCallout={handleDeleteDetailCallout}
              />
            )}

            {/* MÔ HÌNH 3D XUẤT SKETCHUP */}
            {activeTab === '3d' && (
              <Viewer3D
                project={project}
                onAddWall={handleAddWall}
                onAddOpening={handleAddOpening}
                onAddElevSectEntity={handleAddElevSectEntity}
                onDeleteWall={handleDeleteWall}
                onDeleteOpening={handleDeleteOpening}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            )}

            {/* ĐO CHÉO KIỂM TRA GÓC VUÔNG */}
            {activeTab === 'diagonal' && (
              <DiagonalView
                project={project}
                onAddDiagonal={(p1, p2, val) => handleApplyMeasurementToDiagonal(val)}
                onDeleteDiagonal={handleDeleteDiagonal}
                onOpenLaserModal={() => setIsLaserModalOpen(true)}
              />
            )}

            {/* NHẬT KÝ SỐ ĐO LASER */}
            {activeTab === 'log' && (
              <MeasurementLogView
                project={project}
                onApplyMeasurementToWall={handleApplyMeasurementToWall}
                onOpenLaserModal={() => setIsLaserModalOpen(true)}
              />
            )}

            {/* TRANG VIEW KHÁC - TOOLBOX (CHỤP NHANH & PANORAMA 720) */}
            {activeTab === 'other_views' && (
              <OtherViewsToolbox
                project={project}
                onTakeSnapshot={() => {}}
              />
            )}
          </main>

          {/* Right Inspector Property Panel (Visible on Desktop, or on iPad when expanded) */}
          {!isIphone && activeTab === '2d' && (!isIpad || isTabletPanelOpen) && (
            <PropertyPanel
              project={project}
              selectedWallId={selectedWallId}
              selectedCurvedWallId={selectedCurvedWallId}
              selectedOpeningId={selectedOpeningId}
              selectedStairId={selectedStairId}
              selectedColumnId={selectedColumnId}
              selectedMepId={selectedMepId}
              selectedLandscapeId={selectedLandscapeId}
              selectedDetailCalloutId={selectedDetailCalloutId}
              onUpdateWall={handleUpdateWall}
              onDeleteWall={handleDeleteWall}
              onUpdateCurvedWall={handleUpdateCurvedWall}
              onDeleteCurvedWall={handleDeleteCurvedWall}
              onUpdateOpening={handleUpdateOpening}
              onDeleteOpening={handleDeleteOpening}
              onUpdateStair={handleUpdateStaircase}
              onDeleteStair={handleDeleteStaircase}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
              onUpdateMep={handleUpdateMepElement}
              onDeleteMep={handleDeleteMepElement}
              onUpdateLandscape={handleUpdateLandscape}
              onDeleteLandscape={handleDeleteLandscape}
              onUpdateDetailCallout={handleUpdateDetailCallout}
              onDeleteDetailCallout={handleDeleteDetailCallout}
              onDeleteAngle={handleDeleteAngle}
              onTriggerLaserForSelected={() => setIsLaserModalOpen(true)}
              onUpdateProjectDefaults={(defs) => setProject((p) => ({ ...p, ...defs }))}
              onToggleUnderlay={handleToggleUnderlay}
              onUpdateUnderlayOpacity={handleUpdateUnderlayOpacity}
            />
          )}
        </div>

        {/* 3. Mobile Dedicated Bottom Navigation (iPhone) */}
        {isIphone && (
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeTool={activeTool}
            onOpenToolsSheet={() => setIsMobileToolsOpen(true)}
            onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
            osType={deviceConfig.osType}
          />
        )}

        {/* 4. Mobile Property Bottom Sheet (iPhone) */}
        {isIphone && (
          <MobilePropertySheet
            project={project}
            selectedWallId={selectedWallId}
            selectedCurvedWallId={selectedCurvedWallId}
            selectedOpeningId={selectedOpeningId}
            selectedStairId={selectedStairId}
            selectedColumnId={selectedColumnId}
            selectedMepId={selectedMepId}
            selectedLandscapeId={selectedLandscapeId}
            selectedDetailCalloutId={selectedDetailCalloutId}
            onUpdateWall={handleUpdateWall}
            onDeleteWall={handleDeleteWall}
            onUpdateCurvedWall={handleUpdateCurvedWall}
            onDeleteCurvedWall={handleDeleteCurvedWall}
            onUpdateOpening={handleUpdateOpening}
            onDeleteOpening={handleDeleteOpening}
            onUpdateColumn={handleUpdateColumn}
            onDeleteColumn={handleDeleteColumn}
            onUpdateStaircase={handleUpdateStaircase}
            onDeleteStaircase={handleDeleteStaircase}
            onUpdateMepElement={handleUpdateMepElement}
            onDeleteMepElement={handleDeleteMepElement}
            onUpdateLandscape={handleUpdateLandscape}
            onDeleteLandscape={handleDeleteLandscape}
            onUpdateDetailCallout={handleUpdateDetailCallout}
            onDeleteDetailCallout={handleDeleteDetailCallout}
            onTriggerLaser={() => setIsLaserModalOpen(true)}
            onDeselectAll={clearAllSelections}
            osType={deviceConfig.osType}
          />
        )}

        {/* 5. Mobile CAD Tools Picker Sheet (iPhone) */}
        {isIphone && (
          <MobileToolsSheet
            isOpen={isMobileToolsOpen}
            onClose={() => setIsMobileToolsOpen(false)}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            onAddQuickRoom={handleAddQuickRoom}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            osType={deviceConfig.osType}
          />
        )}

        {/* 6. Mobile More Utilities Sheet (iPhone) */}
        {isIphone && (
          <MobileMoreSheet
            isOpen={isMobileMoreOpen}
            onClose={() => setIsMobileMoreOpen(false)}
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenProjectSettings={() => setIsProjectSettingsOpen(true)}
            onOpenDeviceSelector={() => setIsDeviceSelectorOpen(true)}
            onOpenNewProject={() => setIsNewProjectOpen(true)}
            onOpenUserGuide={() => setIsUserGuideOpen(true)}
            osType={deviceConfig.osType}
          />
        )}

        {/* 7. Quick One-Hand Laser Trigger Button (iPhone & iPad) */}
        {(isIphone || isIpad) && (
          <QuickLaserTrigger
            laserStatus={laserStatus}
            selectedWallName={
              selectedWallId
                ? project.walls.find((w) => w.id === selectedWallId)?.name || 'Tường'
                : selectedCurvedWallId
                ? 'Tường Cong'
                : null
            }
            onTriggerLaser={() => setIsLaserModalOpen(true)}
            osType={deviceConfig.osType}
          />
        )}
      </div>

      {/* 8. Global Modals */}
      <DeviceModeSelectorModal
        isOpen={isDeviceSelectorOpen}
        onClose={() => setIsDeviceSelectorOpen(false)}
        config={deviceConfig}
        onSetDeviceType={setDeviceType}
        onSetOsType={setOsType}
        onToggleSimulateFrame={toggleSimulateFrame}
        onToggleOrientation={toggleOrientation}
      />

      <LaserMeterModal
        isOpen={isLaserModalOpen}
        onClose={() => setIsLaserModalOpen(false)}
        status={laserStatus}
        project={project}
        selectedWallId={selectedWallId}
        selectedCurvedWallId={selectedCurvedWallId}
        onApplyMeasurementToWall={handleApplyMeasurementToWall}
        onApplyMeasurementToCurvedWall={handleApplyMeasurementToCurvedWall}
        onApplyMeasurementToHeight={handleApplyMeasurementToHeight}
        onApplyMeasurementToDiagonal={handleApplyMeasurementToDiagonal}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />

      <ProjectSettingsModal
        isOpen={isProjectSettingsOpen}
        onClose={() => setIsProjectSettingsOpen(false)}
        project={project}
        onUpdateProjectInfo={(info) => setProject((p) => ({ ...p, ...info }))}
        onLoadTemplate={(template) => {
          setProject(template);
          clearAllSelections();
        }}
        onResetProject={() => setIsNewProjectOpen(true)}
      />

      {/* 9. New Project / Drawing Creation Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
        currentProjectHasData={project.walls.length > 0 || (project.curvedWalls && project.curvedWalls.length > 0)}
      />

      {/* 10. Comprehensive User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenLaserModal={() => setIsLaserModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />
    </div>
  );
}

