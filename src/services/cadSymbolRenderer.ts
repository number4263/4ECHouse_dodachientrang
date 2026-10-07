import {
  Point2D,
  MepElement,
  Staircase,
  Column,
  LandscapeElement,
  CurvedWall,
  FreehandStroke,
  DetailCallout,
  Opening,
  Wall,
} from '../types/cad';

export class CadSymbolRenderer {
  /**
   * Draw MEP Elements with professional architectural CAD symbols
   */
  public static drawMepElement(
    ctx: CanvasRenderingContext2D,
    mep: MepElement,
    screenPos: Point2D,
    scale: number,
    isSelected: boolean
  ) {
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate((mep.rotation * Math.PI) / 180);

    const size = 16; // base icon size in pixels

    switch (mep.category) {
      case 'socket_single':
      case 'socket_double': {
        // Electrical wall socket
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI, true);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.stroke();

        // Prongs
        if (mep.category === 'socket_single') {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -size / 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(-size / 4, 0);
          ctx.lineTo(-size / 4, -size / 2);
          ctx.moveTo(size / 4, 0);
          ctx.lineTo(size / 4, -size / 2);
          ctx.stroke();
        }
        break;
      }

      case 'switch_single_1way':
      case 'switch_1': {
        // Công tắc đơn 1 chiều (Single 1-way light switch)
        ctx.fillStyle = isSelected ? '#fbbf24' : '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#fbbf24' : '#f97316';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size / 2, -size / 2);
        ctx.lineTo(size / 2 + 5, -size / 2);
        ctx.stroke();
        break;
      }

      case 'switch_single_2way': {
        // Công tắc đơn 2 chiều / đảo chiều (Single 2-way / intermediate switch)
        ctx.fillStyle = isSelected ? '#fbbf24' : '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#fbbf24' : '#f97316';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        // Arm 1 with tick
        ctx.moveTo(0, 0);
        ctx.lineTo(size / 2, -size / 2);
        ctx.lineTo(size / 2 + 5, -size / 2);
        // Arm 2 in opposite direction with tick (2 chiều)
        ctx.moveTo(0, 0);
        ctx.lineTo(-size / 2, size / 2);
        ctx.lineTo(-size / 2 - 5, size / 2);
        ctx.stroke();
        break;
      }

      case 'switch_double_1way':
      case 'switch_2': {
        // Công tắc đôi 1 chiều (Double 1-way light switch)
        ctx.fillStyle = isSelected ? '#fbbf24' : '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#fbbf24' : '#f97316';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size / 2, -size / 2);
        // 2 parallel flags on the same branch
        ctx.lineTo(size / 2 + 6, -size / 2);
        ctx.moveTo(size / 3, -size / 3);
        ctx.lineTo(size / 3 + 6, -size / 3);
        ctx.stroke();
        break;
      }

      case 'switch_double_2way': {
        // Công tắc đôi 2 chiều (Double 2-way switch)
        ctx.fillStyle = isSelected ? '#fbbf24' : '#f97316';
        ctx.beginPath();
        ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#fbbf24' : '#f97316';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        // Top branch with 2 ticks
        ctx.moveTo(0, 0);
        ctx.lineTo(size / 2, -size / 2);
        ctx.lineTo(size / 2 + 6, -size / 2);
        ctx.moveTo(size / 3, -size / 3);
        ctx.lineTo(size / 3 + 6, -size / 3);
        // Bottom branch with 2 ticks
        ctx.moveTo(0, 0);
        ctx.lineTo(-size / 2, size / 2);
        ctx.lineTo(-size / 2 - 6, size / 2);
        ctx.moveTo(-size / 3, size / 3);
        ctx.lineTo(-size / 3 - 6, size / 3);
        ctx.stroke();
        break;
      }

      case 'water_meter': {
        // Đồng hồ nước (Water meter TCVN CAD symbol)
        const meterR = size * 0.6;
        // Pipe through
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 1.2, 0);
        ctx.lineTo(-meterR, 0);
        ctx.moveTo(meterR, 0);
        ctx.lineTo(size * 1.2, 0);
        ctx.stroke();

        // Pipe connection flanges / triangles
        ctx.fillStyle = isSelected ? '#fbbf24' : '#0284c7';
        ctx.beginPath();
        ctx.moveTo(-size * 1.1, -4);
        ctx.lineTo(-meterR - 1, 0);
        ctx.lineTo(-size * 1.1, 4);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(size * 1.1, -4);
        ctx.lineTo(meterR + 1, 0);
        ctx.lineTo(size * 1.1, 4);
        ctx.closePath();
        ctx.fill();

        // Center circle
        ctx.fillStyle = isSelected ? '#fbbf24' : '#0369a1';
        ctx.beginPath();
        ctx.arc(0, 0, meterR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Symbol Text "ĐH" (Đồng Hồ)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ĐH', 0, 0);
        break;
      }

      case 'panel_db': {
        // Electrical Distribution Board (Tủ điện DB)
        ctx.fillStyle = isSelected ? '#fbbf24' : '#1e293b';
        ctx.fillRect(-size, -size / 2, size * 2, size);
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size, -size / 2, size * 2, size);

        // Diagonal division
        ctx.fillStyle = isSelected ? '#f59e0b' : '#0284c7';
        ctx.beginPath();
        ctx.moveTo(-size, -size / 2);
        ctx.lineTo(size, size / 2);
        ctx.lineTo(size, -size / 2);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'light_ceiling': {
        // Ceiling Downlight
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(0, size / 2);
        ctx.stroke();
        break;
      }

      case 'ac_indoor': {
        // Air Conditioner
        ctx.fillStyle = isSelected ? '#fbbf24' : '#334155';
        ctx.fillRect(-size * 1.5, -size / 2, size * 3, size);
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size * 1.5, -size / 2, size * 3, size);

        // Air vent slats
        ctx.beginPath();
        ctx.moveTo(-size * 1.2, 0);
        ctx.lineTo(size * 1.2, 0);
        ctx.moveTo(-size * 1.2, size / 4);
        ctx.lineTo(size * 1.2, size / 4);
        ctx.stroke();
        break;
      }

      case 'water_supply': {
        // Water supply valve/pipe
        ctx.fillStyle = isSelected ? '#fbbf24' : '#0284c7';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', 0, 0);
        break;
      }

      case 'water_drain': {
        // Floor drain (Phễu thu sàn)
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size / 2, -size / 2, size, size);
        ctx.beginPath();
        ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'toilet_drain': {
        // Toilet waste pipe (D110)
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#14b8a6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'fire_detector': {
        // Smoke / Fire detector
        ctx.fillStyle = isSelected ? '#fbbf24' : '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'fire_hydrant': {
        // Fire Hose Cabinet
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(-size, -size / 2, size * 2, size);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-size, -size / 2, size * 2, size);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('F', 0, 0);
        break;
      }
    }

    // Label underneath
    if (mep.label) {
      ctx.font = '600 10px monospace';
      ctx.fillStyle = isSelected ? '#fbbf24' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(mep.label, 0, size + 4);
    }
    ctx.restore();
  }

  /**
   * Draw Architectural Staircase CAD Blocks
   */
  public static drawStaircase(
    ctx: CanvasRenderingContext2D,
    stair: Staircase,
    screenPos: Point2D,
    scale: number,
    isSelected: boolean
  ) {
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate((stair.rotation * Math.PI) / 180);

    const rw = stair.runWidth * scale; // flight width in px
    const totalL = stair.totalLength * scale; // total length in px

    ctx.strokeStyle = isSelected ? '#fbbf24' : '#f8fafc';
    ctx.lineWidth = 1.6;

    if (stair.type === 'straight') {
      // 1. Straight Staircase (Thang thẳng)
      ctx.strokeRect(0, 0, rw, totalL);

      const stepH = totalL / Math.max(stair.stepCount, 1);
      for (let i = 1; i < stair.stepCount; i++) {
        const y = i * stepH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rw, y);
        ctx.stroke();
      }

      // Centerline with UP arrow
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rw / 2, totalL - 10);
      ctx.lineTo(rw / 2, 10);
      ctx.lineTo(rw / 2 - 4, 18);
      ctx.moveTo(rw / 2, 10);
      ctx.lineTo(rw / 2 + 4, 18);
      ctx.stroke();

      // "LÊN" label
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LÊN', rw / 2, totalL / 2);
    } else if (stair.type === 'u_shape') {
      // 2. U-Shape Staircase (Thang chữ U 2 vế hoặc 3 vế có vế thang giữa 2 chiếu nghỉ)
      const gap = (stair.stairWellGap || 100) * scale;
      const flightLen = Math.max(20, totalL - rw);

      const midSteps = stair.stepsMiddleFlight || 0;
      if (midSteps > 0) {
        // Thang U 3 vế: Vế 1 -> Chiếu nghỉ 1 -> Vế thang giữa -> Chiếu nghỉ 2 -> Vế 2
        const landingSize = rw;
        const midFlightW = Math.max(gap, (stair.stairWellGap || 600) * scale);
        const totalW = rw * 2 + midFlightW;

        // Vế 1 (trái)
        ctx.strokeRect(0, 0, rw, flightLen);
        const steps1 = stair.stepsBeforeLanding || 8;
        const stepH1 = flightLen / steps1;
        for (let i = 1; i < steps1; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * stepH1);
          ctx.lineTo(rw, i * stepH1);
          ctx.stroke();
        }

        // Chiếu nghỉ 1 (góc trái trên)
        ctx.strokeRect(0, flightLen, landingSize, landingSize);

        // Vế thang giữa (nằm ngang giữa 2 chiếu nghỉ)
        const midY = flightLen;
        ctx.strokeRect(rw, midY, midFlightW, landingSize);
        const midStepW = midFlightW / midSteps;
        for (let i = 1; i < midSteps; i++) {
          ctx.beginPath();
          ctx.moveTo(rw + i * midStepW, midY);
          ctx.lineTo(rw + i * midStepW, midY + landingSize);
          ctx.stroke();
        }

        // Chiếu nghỉ 2 (góc phải trên)
        const x2 = rw + midFlightW;
        ctx.strokeRect(x2, flightLen, landingSize, landingSize);

        // Vế 2 (phải)
        ctx.strokeRect(x2, 0, rw, flightLen);
        const steps2 = stair.stepsAfterLanding || 8;
        const stepH2 = flightLen / steps2;
        for (let i = 1; i < steps2; i++) {
          ctx.beginPath();
          ctx.moveTo(x2, i * stepH2);
          ctx.lineTo(x2 + rw, i * stepH2);
          ctx.stroke();
        }

        // U-3 turn walkline
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(rw / 2, 10);
        ctx.lineTo(rw / 2, flightLen + landingSize / 2);
        ctx.lineTo(x2 + rw / 2, flightLen + landingSize / 2);
        ctx.lineTo(x2 + rw / 2, 20);
        ctx.lineTo(x2 + rw / 2 - 4, 28);
        ctx.moveTo(x2 + rw / 2, 20);
        ctx.lineTo(x2 + rw / 2 + 4, 28);
        ctx.stroke();
      } else {
        // Standard 2-flight U Staircase
        // Flight 1 (Left)
        ctx.strokeRect(0, 0, rw, flightLen);
        const steps1 = stair.stepsBeforeLanding || 9;
        const stepH1 = flightLen / steps1;
        for (let i = 1; i < steps1; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * stepH1);
          ctx.lineTo(rw, i * stepH1);
          ctx.stroke();
        }

        // Flight 2 (Right)
        const x2 = rw + gap;
        ctx.strokeRect(x2, 0, rw, flightLen);
        const steps2 = stair.stepsAfterLanding || 8;
        const stepH2 = flightLen / steps2;
        for (let i = 1; i < steps2; i++) {
          ctx.beginPath();
          ctx.moveTo(x2, i * stepH2);
          ctx.lineTo(x2 + rw, i * stepH2);
          ctx.stroke();
        }

        // Landing Box at Top
        const landingW = rw * 2 + gap;
        const landingH = rw;
        ctx.strokeRect(0, flightLen, landingW, landingH);

        // Split Landing (Xẻ bậc chiếu nghỉ)
        if (stair.landingType === 'split_2') {
          // Xẻ 2: đường chéo chiếu nghỉ
          ctx.beginPath();
          ctx.moveTo(0, flightLen);
          ctx.lineTo(landingW, flightLen + landingH);
          ctx.stroke();
        } else if (stair.landingType === 'split_3') {
          // Xẻ 3: tỏa từ giữa mép vào
          ctx.beginPath();
          ctx.moveTo(landingW / 2, flightLen);
          ctx.lineTo(0, flightLen + landingH);
          ctx.moveTo(landingW / 2, flightLen);
          ctx.lineTo(landingW, flightLen + landingH);
          ctx.stroke();
        }

        // Walkline arrow (U-turn arrow)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(rw / 2, 10);
        ctx.lineTo(rw / 2, flightLen + landingH / 2);
        ctx.lineTo(x2 + rw / 2, flightLen + landingH / 2);
        ctx.lineTo(x2 + rw / 2, 20);
        ctx.lineTo(x2 + rw / 2 - 4, 28);
        ctx.moveTo(x2 + rw / 2, 20);
        ctx.lineTo(x2 + rw / 2 + 4, 28);
        ctx.stroke();
      }
    } else if (stair.type === 'l_shape') {
      // 3. L-Shape Staircase (Thang chữ L)
      const flight1H = totalL - rw;
      ctx.strokeRect(0, 0, rw, flight1H);
      const s1 = stair.stepsBeforeLanding || 10;
      for (let i = 1; i < s1; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (i * flight1H) / s1);
        ctx.lineTo(rw, (i * flight1H) / s1);
        ctx.stroke();
      }

      // Corner landing square: [0, rw] x [flight1H, flight1H + rw]
      ctx.strokeRect(0, flight1H, rw, rw);

      // TÂM XẺ CHIẾU NGHỈ LẤY TỪ GÓC TRONG GIAO CỦA 2 VẾ THANG: (rw, flight1H)
      const innerCornerX = rw;
      const innerCornerY = flight1H;

      if (stair.landingType === 'split_2') {
        // Xẻ 2: đường chéo xuất phát từ góc trong (innerCornerX, innerCornerY) tới góc ngoài đối diện (0, flight1H + rw)
        ctx.beginPath();
        ctx.moveTo(innerCornerX, innerCornerY);
        ctx.lineTo(0, flight1H + rw);
        ctx.stroke();
      } else if (stair.landingType === 'split_3') {
        // Xẻ 3 hình quạt: 2 đường xuất phát từ góc trong (innerCornerX, innerCornerY) tỏa ra 2 mép ngoài
        ctx.beginPath();
        // Tia 1 tới trung điểm mép ngoài bên trái
        ctx.moveTo(innerCornerX, innerCornerY);
        ctx.lineTo(0, flight1H + rw / 2);
        // Tia 2 tới trung điểm mép ngoài bên dưới
        ctx.moveTo(innerCornerX, innerCornerY);
        ctx.lineTo(rw / 2, flight1H + rw);
        ctx.stroke();
      }

      // Flight 2 turning right
      const flight2W = totalL * 0.6;
      ctx.strokeRect(rw, flight1H, flight2W, rw);
      const s2 = stair.stepsAfterLanding || 8;
      for (let i = 1; i < s2; i++) {
        ctx.beginPath();
        ctx.moveTo(rw + (i * flight2W) / s2, flight1H);
        ctx.lineTo(rw + (i * flight2W) / s2, flight1H + rw);
        ctx.stroke();
      }

      // L-turn walkline arrow
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(rw / 2, 10);
      ctx.lineTo(rw / 2, flight1H + rw / 2);
      ctx.lineTo(rw + flight2W - 10, flight1H + rw / 2);
      ctx.lineTo(rw + flight2W - 18, flight1H + rw / 2 - 4);
      ctx.moveTo(rw + flight2W - 10, flight1H + rw / 2);
      ctx.lineTo(rw + flight2W - 18, flight1H + rw / 2 + 4);
      ctx.stroke();
    } else if (stair.type === 'spiral' || stair.type === 'curved') {
      // 4. Spiral & Curved Staircase (Thang xoắn tròn & thang cong uốn lượn)
      const outerR = stair.outerRadius
        ? stair.outerRadius * scale
        : Math.max(rw * 1.5, 45);
      const innerR = stair.innerRadius
        ? stair.innerRadius * scale
        : Math.max(outerR * 0.28, 14);

      if (stair.type === 'curved') {
        // Thang cong uốn lượn (cung 180° hoặc 120°)
        const startAng = -Math.PI / 2;
        const endAng = Math.PI / 2;
        ctx.beginPath();
        ctx.arc(outerR, outerR, outerR, startAng, endAng);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(outerR, outerR, innerR, startAng, endAng);
        ctx.stroke();

        // Radiating treads along arc
        const steps = stair.stepCount || 14;
        for (let i = 0; i <= steps; i++) {
          const a = startAng + ((endAng - startAng) * i) / steps;
          ctx.beginPath();
          ctx.moveTo(outerR + Math.cos(a) * innerR, outerR + Math.sin(a) * innerR);
          ctx.lineTo(outerR + Math.cos(a) * outerR, outerR + Math.sin(a) * outerR);
          ctx.stroke();
        }

        // Curved Walkline arrow
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.4;
        const midR = (innerR + outerR) / 2;
        ctx.beginPath();
        ctx.arc(outerR, outerR, midR, startAng + 0.1, endAng - 0.1);
        ctx.stroke();
      } else {
        // Spiral Staircase (360° tròn quanh trụ)
        ctx.beginPath();
        ctx.arc(outerR, outerR, outerR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#fbbf24' : '#475569';
        ctx.beginPath();
        ctx.arc(outerR, outerR, innerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Radiating treads
        const steps = stair.stepCount || 16;
        for (let i = 0; i < steps; i++) {
          const a = (i * 2 * Math.PI) / steps;
          ctx.beginPath();
          ctx.moveTo(outerR + Math.cos(a) * innerR, outerR + Math.sin(a) * innerR);
          ctx.lineTo(outerR + Math.cos(a) * outerR, outerR + Math.sin(a) * outerR);
          ctx.stroke();
        }

        // Center post label
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TRỤ', outerR, outerR);
      }
    }

    ctx.restore();
  }

  /**
   * Draw Structural Columns (Cột thép I, U, hộp, chữ nhật & Cột bê tông)
   */
  public static drawStructuralColumn(
    ctx: CanvasRenderingContext2D,
    col: Column,
    screenPos: Point2D,
    scale: number,
    isSelected: boolean
  ) {
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate((col.rotation * Math.PI) / 180);

    const sw = col.width * scale;
    const sd = col.depth * scale;
    const tf = (col.flangeThickness || 10) * scale;
    const tw = (col.webThickness || 6) * scale;

    ctx.fillStyle = isSelected ? '#fbbf24' : '#334155';
    ctx.strokeStyle = isSelected ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 1.5;

    if (col.type === 'steel_i') {
      // I-Beam Profile (Cột thép hình chữ I / H)
      ctx.beginPath();
      // Top Flange
      ctx.rect(-sw / 2, -sd / 2, sw, tf);
      // Bottom Flange
      ctx.rect(-sw / 2, sd / 2 - tf, sw, tf);
      // Web
      ctx.rect(-tw / 2, -sd / 2 + tf, tw, sd - 2 * tf);
      ctx.fill();
      ctx.stroke();
    } else if (col.type === 'steel_u') {
      // U-Channel Profile (Cột thép hình chữ U)
      ctx.beginPath();
      // Back web
      ctx.rect(-sw / 2, -sd / 2, tw, sd);
      // Top flange
      ctx.rect(-sw / 2 + tw, -sd / 2, sw - tw, tf);
      // Bottom flange
      ctx.rect(-sw / 2 + tw, sd / 2 - tf, sw - tw, tf);
      ctx.fill();
      ctx.stroke();
    } else if (col.type === 'steel_box') {
      // Hollow Square Steel Box (Thép hộp vuông)
      ctx.fillRect(-sw / 2, -sd / 2, sw, sd);
      ctx.strokeRect(-sw / 2, -sd / 2, sw, sd);

      // Hollow inner cutout
      const tHollow = Math.max(3, sw * 0.15);
      ctx.fillStyle = '#181b20';
      ctx.fillRect(-sw / 2 + tHollow, -sd / 2 + tHollow, sw - 2 * tHollow, sd - 2 * tHollow);
      ctx.strokeRect(-sw / 2 + tHollow, -sd / 2 + tHollow, sw - 2 * tHollow, sd - 2 * tHollow);
    } else if (col.type === 'concrete_circle') {
      // Round Concrete Column (Cột tròn)
      ctx.beginPath();
      ctx.arc(0, 0, sw / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Concrete cross hatch
      ctx.strokeStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(-sw / 2, 0);
      ctx.lineTo(sw / 2, 0);
      ctx.moveTo(0, -sw / 2);
      ctx.lineTo(0, sw / 2);
      ctx.stroke();
    } else {
      // Rectangular Concrete Column (Cột bê tông chữ nhật)
      ctx.fillRect(-sw / 2, -sd / 2, sw, sd);
      ctx.strokeRect(-sw / 2, -sd / 2, sw, sd);

      // Hatch
      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-sw / 2, -sd / 2);
      ctx.lineTo(sw / 2, sd / 2);
      ctx.moveTo(sw / 2, -sd / 2);
      ctx.lineTo(-sw / 2, sd / 2);
      ctx.stroke();
    }

    if (col.profileName) {
      ctx.font = '600 10px monospace';
      ctx.fillStyle = isSelected ? '#fbbf24' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(col.profileName, 0, sd / 2 + 12);
    }

    ctx.restore();
  }

  /**
   * Draw Curved Wall (Tường cong)
   */
  public static drawCurvedWall(
    ctx: CanvasRenderingContext2D,
    wall: CurvedWall,
    sStart: Point2D,
    sEnd: Point2D,
    sCtrl: Point2D,
    scale: number,
    isSelected: boolean
  ) {
    ctx.save();
    ctx.strokeStyle = isSelected ? '#f59e0b' : '#f8fafc';
    ctx.lineWidth = Math.max(wall.thickness * scale, 3.5);
    ctx.beginPath();
    ctx.moveTo(sStart.x, sStart.y);
    ctx.quadraticCurveTo(sCtrl.x, sCtrl.y, sEnd.x, sEnd.y);
    ctx.stroke();

    // Arc dimension and label
    const midX = (sStart.x + 2 * sCtrl.x + sEnd.x) / 4;
    const midY = (sStart.y + 2 * sCtrl.y + sEnd.y) / 4;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(midX - 35, midY - 10, 70, 18);
    ctx.strokeStyle = isSelected ? '#fbbf24' : '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(midX - 35, midY - 10, 70, 18);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`R${wall.radius}mm`, midX, midY - 1);

    ctx.restore();
  }

  /**
   * Draw Landscape Elements (Cây xanh & Cảnh quan)
   */
  public static drawLandscape(
    ctx: CanvasRenderingContext2D,
    item: LandscapeElement,
    screenPos: Point2D,
    scale: number
  ) {
    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    const r = Math.max(item.radius * scale, 12);

    if (item.type === 'shrub') {
      // Shrub (Cây bụi)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      const petals = 6;
      for (let i = 0; i < petals; i++) {
        const a = (i * 2 * Math.PI) / petals;
        const px = Math.cos(a) * (r * 0.7);
        const py = Math.sin(a) * (r * 0.7);
        ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();
    } else {
      // Large Tree (Cây lớn)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tree canopy branches
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.stroke();

      // Trunk center
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (item.name) {
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#a7f3d0';
      ctx.textAlign = 'center';
      ctx.fillText(item.name, 0, r + 12);
    }
    ctx.restore();
  }

  /**
   * Draw Freehand Sketch / Pen Note
   */
  public static drawFreehandStroke(
    ctx: CanvasRenderingContext2D,
    stroke: FreehandStroke,
    cadToScreen: (x: number, y: number) => Point2D
  ) {
    if (stroke.points.length < 2) return;

    ctx.save();
    ctx.strokeStyle = stroke.color || '#f59e0b';
    ctx.lineWidth = stroke.strokeWidth || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.toolType === 'highlighter') {
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = Math.max(stroke.strokeWidth * 4, 12);
    }

    ctx.beginPath();
    const p0 = cadToScreen(stroke.points[0].x, stroke.points[0].y);
    ctx.moveTo(p0.x, p0.y);

    for (let i = 1; i < stroke.points.length; i++) {
      const p = cadToScreen(stroke.points[i].x, stroke.points[i].y);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    if (stroke.noteText) {
      const last = cadToScreen(
        stroke.points[stroke.points.length - 1].x,
        stroke.points[stroke.points.length - 1].y
      );
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = stroke.color;
      ctx.font = 'italic 11px system-ui, sans-serif';
      ctx.fillText(stroke.noteText, last.x + 6, last.y - 4);
    }
    ctx.restore();
  }

  /**
   * Draw Detail Callout Bubble
   */
  public static drawDetailCallout(
    ctx: CanvasRenderingContext2D,
    callout: DetailCallout,
    screenCenter: Point2D,
    scale: number
  ) {
    ctx.save();
    const r = callout.radius * scale;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.arc(screenCenter.x, screenCenter.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Leader line to label flag
    const flagX = screenCenter.x + r * 0.707 + 25;
    const flagY = screenCenter.y - r * 0.707 - 20;

    ctx.beginPath();
    ctx.moveTo(screenCenter.x + r * 0.707, screenCenter.y - r * 0.707);
    ctx.lineTo(flagX, flagY);
    ctx.lineTo(flagX + 80, flagY);
    ctx.stroke();

    // Text Badge
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(flagX, flagY - 16, 85, 24);
    ctx.strokeRect(flagX, flagY - 16, 85, 24);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(callout.label, flagX + 4, flagY - 4);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(callout.scale, flagX + 4, flagY + 6);

    ctx.restore();
  }

  /**
   * Draw Architectural Standard Doors & Windows (TCVN / CAD Standard)
   * Includes opening cut lines, door frames, door leaves, and swing radius arcs (đường cong bán kính mở cánh)
   */
  public static drawStandardOpening(
    ctx: CanvasRenderingContext2D,
    op: Opening,
    wall: Wall,
    sStart: Point2D,
    sEnd: Point2D,
    scale: number,
    isSelected: boolean
  ) {
    ctx.save();

    // Direction vector of the opening along wall
    const dX = sEnd.x - sStart.x;
    const dY = sEnd.y - sStart.y;
    const opLen = Math.hypot(dX, dY);
    if (opLen < 1) {
      ctx.restore();
      return;
    }

    const uX = dX / opLen;
    const uY = dY / opLen;

    // Normal vector perpendicular to wall
    const nX = -uY;
    const nY = uX;

    const wallThickMm = wall.thickness || 220;
    const halfThick = (wallThickMm * scale) / 2;

    // 1. Selection aura
    if (isSelected) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = Math.max(6, halfThick * 2 + 8);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sStart.x, sStart.y);
      ctx.lineTo(sEnd.x, sEnd.y);
      ctx.stroke();
    }

    // 2. Wall Jamb Cuts (2 vạch cắt mở tường tại điểm đầu và cuối khuôn cửa)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    // Jamb at start
    ctx.moveTo(sStart.x - nX * halfThick, sStart.y - nY * halfThick);
    ctx.lineTo(sStart.x + nX * halfThick, sStart.y + nY * halfThick);
    // Jamb at end
    ctx.moveTo(sEnd.x - nX * halfThick, sEnd.y - nY * halfThick);
    ctx.lineTo(sEnd.x + nX * halfThick, sEnd.y + nY * halfThick);
    ctx.stroke();

    // Door / Window Frames (Khuôn bao cửa tùy chỉnh bề dày khung)
    const customFrameThick = op.frameThickness || 50;
    const frameDepth = Math.min(halfThick * 2, (customFrameThick * 1.2) * scale + 4);
    const frameW = Math.min(opLen * 0.25, customFrameThick * scale + 2);

    ctx.fillStyle = isSelected ? '#fbbf24' : '#475569';
    ctx.fillRect(
      sStart.x - frameW / 2 - nX * (frameDepth / 2),
      sStart.y - frameW / 2 - nY * (frameDepth / 2),
      frameW,
      frameDepth
    );
    ctx.fillRect(
      sEnd.x - frameW / 2 - nX * (frameDepth / 2),
      sEnd.y - frameW / 2 - nY * (frameDepth / 2),
      frameW,
      frameDepth
    );

    // Normal direction sign for swing inside/outside
    const swingSide = op.swingInside ? 1 : -1;
    const swingNx = nX * swingSide;
    const swingNy = nY * swingSide;

    const isDoor = op.type.startsWith('door');
    const isGlass = op.type === 'glass_partition';
    const isWindow = op.type.startsWith('window');

    if (isDoor) {
      const leafCount = op.leafCount || (op.type === 'door_double' ? 2 : op.type === 'door_4leaf' ? 4 : 1);
      const isSliding = op.type === 'door_sliding';

      if (isSliding) {
        // CỬA ĐI LÙA (SLIDING DOOR)
        const sashLen = opLen * 0.55;
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = 3;

        // Sash 1
        const s1x = sStart.x + swingNx * (halfThick * 0.35);
        const s1y = sStart.y + swingNy * (halfThick * 0.35);
        ctx.beginPath();
        ctx.moveTo(s1x, s1y);
        ctx.lineTo(s1x + uX * sashLen, s1y + uY * sashLen);
        ctx.stroke();

        // Sash 2
        const s2x = sEnd.x - swingNx * (halfThick * 0.35);
        const s2y = sEnd.y - swingNy * (halfThick * 0.35);
        ctx.beginPath();
        ctx.moveTo(s2x, s2y);
        ctx.lineTo(s2x - uX * sashLen, s2y - uY * sashLen);
        ctx.stroke();

        // Sliding Direction Arrow (Mũi tên hướng lùa)
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#f87171';
        ctx.lineWidth = 1.2;
        const midX = (sStart.x + sEnd.x) / 2;
        const midY = (sStart.y + sEnd.y) / 2;
        ctx.beginPath();
        ctx.moveTo(midX - uX * 12, midY - uY * 12);
        ctx.lineTo(midX + uX * 12, midY + uY * 12);
        ctx.lineTo(midX + uX * 8 - swingNx * 3, midY + uY * 8 - swingNy * 3);
        ctx.stroke();
      } else if (leafCount === 1) {
        // CỬA ĐI 1 CÁNH (SINGLE SWING DOOR WITH SWING RADIUS ARC)
        const hingeAtStart = op.swingDirection !== 'right';
        const hinge = hingeAtStart ? sStart : sEnd;
        const radius = opLen;
        const leafThick = Math.max(3, 40 * scale);

        // Open leaf vector
        const leafTipX = hinge.x + swingNx * radius;
        const leafTipY = hinge.y + swingNy * radius;

        // 1. Draw Door Leaf (Cánh cửa mở vuông góc 90°)
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = leafThick;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(hinge.x, hinge.y);
        ctx.lineTo(leafTipX, leafTipY);
        ctx.stroke();

        // 2. Draw Swing Radius Arc (Đường cong quỹ đạo mở cánh cửa)
        // Standard architectural quarter circle arc
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#f87171';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 3]);

        const startAngle = Math.atan2(
          hingeAtStart ? sEnd.y - hinge.y : sStart.y - hinge.y,
          hingeAtStart ? sEnd.x - hinge.x : sStart.x - hinge.x
        );
        const endAngle = Math.atan2(leafTipY - hinge.y, leafTipX - hinge.x);

        ctx.beginPath();
        ctx.arc(hinge.x, hinge.y, radius, startAngle, endAngle, hingeAtStart ? !op.swingInside : op.swingInside);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (leafCount === 2) {
        // CỬA ĐI 2 CÁNH (DOUBLE SWING DOOR WITH TWO 90° ARCS MEETING AT CENTER)
        const radius = opLen / 2;
        const leafThick = Math.max(2.5, 38 * scale);
        const midX = (sStart.x + sEnd.x) / 2;
        const midY = (sStart.y + sEnd.y) / 2;

        // Leaf 1 at Start Hinge
        const tip1X = sStart.x + swingNx * radius;
        const tip1Y = sStart.y + swingNy * radius;
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = leafThick;
        ctx.beginPath();
        ctx.moveTo(sStart.x, sStart.y);
        ctx.lineTo(tip1X, tip1Y);
        ctx.stroke();

        // Leaf 2 at End Hinge
        const tip2X = sEnd.x + swingNx * radius;
        const tip2Y = sEnd.y + swingNy * radius;
        ctx.beginPath();
        ctx.moveTo(sEnd.x, sEnd.y);
        ctx.lineTo(tip2X, tip2Y);
        ctx.stroke();

        // 2 Swing Radius Arcs
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#f87171';
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 3]);

        const angleStartMid = Math.atan2(midY - sStart.y, midX - sStart.x);
        const angleStartTip = Math.atan2(tip1Y - sStart.y, tip1X - sStart.x);
        ctx.beginPath();
        ctx.arc(sStart.x, sStart.y, radius, angleStartMid, angleStartTip, !op.swingInside);
        ctx.stroke();

        const angleEndMid = Math.atan2(midY - sEnd.y, midX - sEnd.x);
        const angleEndTip = Math.atan2(tip2Y - sEnd.y, tip2X - sEnd.x);
        ctx.beginPath();
        ctx.arc(sEnd.x, sEnd.y, radius, angleEndMid, angleEndTip, op.swingInside);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // CỬA ĐI 4 CÁNH (4-LEAF BI-FOLD / MULTI-PANEL)
        const leafW = opLen / 4;
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = 2.5;

        // Pair 1 (Left side zig-zag folding)
        const p1x = sStart.x + uX * leafW * 0.7 + swingNx * leafW * 0.7;
        const p1y = sStart.y + uY * leafW * 0.7 + swingNy * leafW * 0.7;
        const p2x = sStart.x + uX * (leafW * 2) * 0.8 + swingNx * (leafW * 0.3);
        const p2y = sStart.y + uY * (leafW * 2) * 0.8 + swingNy * (leafW * 0.3);

        ctx.beginPath();
        ctx.moveTo(sStart.x, sStart.y);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();

        // Pair 2 (Right side zig-zag folding)
        const p3x = sEnd.x - uX * leafW * 0.7 + swingNx * leafW * 0.7;
        const p3y = sEnd.y - uY * leafW * 0.7 + swingNy * leafW * 0.7;
        const p4x = sEnd.x - uX * (leafW * 2) * 0.8 + swingNx * (leafW * 0.3);
        const p4y = sEnd.y - uY * (leafW * 2) * 0.8 + swingNy * (leafW * 0.3);

        ctx.beginPath();
        ctx.moveTo(sEnd.x, sEnd.y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p4x, p4y);
        ctx.stroke();

        // Arcs for 4-leaf
        ctx.strokeStyle = isSelected ? '#f59e0b' : '#f87171';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(sStart.x, sStart.y, leafW * 1.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else if (isWindow) {
      // CỬA SỔ THEO TIÊU CHUẨN XÂY DỰNG (WINDOW STANDARD / SLIDING)
      // 1. Exterior & Interior Sill Lines (2 nét bậu tường)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      // Outer sill
      ctx.beginPath();
      ctx.moveTo(sStart.x + nX * halfThick, sStart.y + nY * halfThick);
      ctx.lineTo(sEnd.x + nX * halfThick, sEnd.y + nY * halfThick);
      ctx.stroke();
      // Inner sill
      ctx.beginPath();
      ctx.moveTo(sStart.x - nX * halfThick, sStart.y - nY * halfThick);
      ctx.lineTo(sEnd.x - nX * halfThick, sEnd.y - nY * halfThick);
      ctx.stroke();

      // 2. Glass Panes (Nét kính đôi song song ở giữa)
      const glassOffset = Math.max(2, 25 * scale);
      ctx.strokeStyle = isSelected ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(sStart.x + nX * glassOffset, sStart.y + nY * glassOffset);
      ctx.lineTo(sEnd.x + nX * glassOffset, sEnd.y + nY * glassOffset);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(sStart.x - nX * glassOffset, sStart.y - nY * glassOffset);
      ctx.lineTo(sEnd.x - nX * glassOffset, sEnd.y - nY * glassOffset);
      ctx.stroke();

      // 3. Central Mullion (Đố cửa giữa)
      const midX = (sStart.x + sEnd.x) / 2;
      const midY = (sStart.y + sEnd.y) / 2;
      ctx.fillStyle = isSelected ? '#fbbf24' : '#0284c7';
      ctx.fillRect(midX - 3, midY - halfThick * 0.7, 6, halfThick * 1.4);

      if (op.type === 'window_sliding') {
        // Sliding window directional arrows
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(midX - uX * 10 + nX * glassOffset * 1.5, midY - uY * 10 + nY * glassOffset * 1.5);
        ctx.lineTo(midX + uX * 10 + nX * glassOffset * 1.5, midY + uY * 10 + nY * glassOffset * 1.5);
        ctx.stroke();
      }
    } else if (isGlass) {
      // VÁCH KÍNH CỐ ĐỊNH (GLASS PARTITION)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.beginPath();
      ctx.moveTo(sStart.x - nX * halfThick, sStart.y - nY * halfThick);
      ctx.lineTo(sStart.x + nX * halfThick, sStart.y + nY * halfThick);
      ctx.lineTo(sEnd.x + nX * halfThick, sEnd.y + nY * halfThick);
      ctx.lineTo(sEnd.x - nX * halfThick, sEnd.y - nY * halfThick);
      ctx.closePath();
      ctx.fill();

      // Double glass lines
      ctx.strokeStyle = isSelected ? '#fbbf24' : '#06b6d4';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sStart.x, sStart.y);
      ctx.lineTo(sEnd.x, sEnd.y);
      ctx.stroke();
    }

    // 4. Name / Dimension Tag Badge
    const midX = (sStart.x + sEnd.x) / 2;
    const midY = (sStart.y + sEnd.y) / 2;
    const tagOffset = halfThick + 16;
    const tagPos = {
      x: midX - swingNx * tagOffset,
      y: midY - swingNy * tagOffset,
    };

    const labelText = op.name || (isDoor ? `D (${op.width})` : `S (${op.width})`);
    ctx.font = 'bold 9.5px monospace';
    const textW = ctx.measureText(labelText).width;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = isSelected ? '#fbbf24' : isDoor ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tagPos.x - textW / 2 - 4, tagPos.y - 7, textW + 8, 14, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isSelected ? '#fbbf24' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, tagPos.x, tagPos.y);

    ctx.restore();
  }
}
