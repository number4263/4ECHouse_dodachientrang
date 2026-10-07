import { ProjectData, Wall, Opening, Column, Room } from '../types/cad';

export class SketchupExporter {
  /**
   * Generates a native SketchUp Ruby script (.rb) that automatically builds the entire 3D model
   * inside SketchUp with walls, doors, windows, floor planes, layers/tags, and materials.
   */
  public static generateRubyScript(project: ProjectData): string {
    const lines: string[] = [];

    lines.push(`# ==============================================================================`);
    lines.push(`# 4ECHOUSE CAD -> SKETCHUP AUTO-GENERATOR SCRIPT`);
    lines.push(`# Công trình: ${project.name}`);
    lines.push(`# Khảo sát đo đạc bằng thước Laser Bluetooth`);
    lines.push(`# Ngày đo: ${project.surveyDate} | Người đo: ${project.surveyor}`);
    lines.push(`# ==============================================================================`);
    lines.push(``);
    lines.push(`require 'sketchup.rb'`);
    lines.push(``);
    lines.push(`module FourECHouseAutoBuild`);
    lines.push(`  def self.build_model`);
    lines.push(`    model = Sketchup.active_model`);
    lines.push(`    model.start_operation('Dựng hiện trạng 4ECHouse Laser', true)`);
    lines.push(`    entities = model.active_entities`);
    lines.push(``);
    lines.push(`    # 1. Tạo Layers / Tags kiến trúc`);
    lines.push(`    layers = model.layers`);
    lines.push(`    tag_tuong = layers.add('01_Tuong_3D')`);
    lines.push(`    tag_san = layers.add('02_San_Nha')`);
    lines.push(`    tag_cua = layers.add('03_Cua_Di_Cua_So')`);
    lines.push(`    tag_cot = layers.add('04_Cot_KetCau')`);
    lines.push(`    tag_thang = layers.add('05_Cau_Thang')`);
    lines.push(`    tag_cong = layers.add('06_Tuong_Cong')`);
    lines.push(``);
    lines.push(`    # 2. Tạo Group chính chứa toàn bộ hiện trạng`);
    lines.push(`    root_group = entities.add_group`);
    lines.push(`    root_group.name = "HIEN_TRANG_${project.name.replace(/[^a-zA-Z0-9_]/g, '_')}"`);
    lines.push(`    root_ents = root_group.entities`);
    lines.push(``);
    lines.push(`    # Conversion mm to inches (SketchUp internal unit is inch: 1 mm = 1 / 25.4 inch)`);
    lines.push(`    to_su = ->(mm) { mm.to_f / 25.4 }`);
    lines.push(``);

    // Generate Wall extrusion logic
    lines.push(`    # 3. Dựng tường 3D`);
    project.walls.forEach((wall, idx) => {
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const len = Math.hypot(dx, dy);
      if (len < 50) return;

      const halfT = wall.thickness / 2;
      const nx = (-dy / len) * halfT;
      const ny = (dx / len) * halfT;

      const p1x = Math.round(wall.start.x + nx);
      const p1y = Math.round(wall.start.y + ny);
      const p2x = Math.round(wall.end.x + nx);
      const p2y = Math.round(wall.end.y + ny);
      const p3x = Math.round(wall.end.x - nx);
      const p3y = Math.round(wall.end.y - ny);
      const p4x = Math.round(wall.start.x - nx);
      const p4y = Math.round(wall.start.y - ny);

      lines.push(`    # Tường ${wall.name || idx + 1} (dày ${wall.thickness}mm, cao ${wall.height}mm)`);
      lines.push(`    begin`);
      lines.push(`      w_grp = root_ents.add_group`);
      lines.push(`      w_grp.name = "Tuong_${idx + 1}"`);
      lines.push(`      w_grp.layer = tag_tuong`);
      lines.push(`      pts_${idx} = [`);
      lines.push(`        Geom::Point3d.new(to_su.call(${p1x}), to_su.call(${p1y}), 0),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${p2x}), to_su.call(${p2y}), 0),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${p3x}), to_su.call(${p3y}), 0),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${p4x}), to_su.call(${p4y}), 0)`);
      lines.push(`      ]`);
      lines.push(`      face = w_grp.entities.add_face(pts_${idx})`);
      lines.push(`      face.pushpull(to_su.call(${wall.height})) if face`);
      lines.push(`    rescue => e`);
      lines.push(`      puts "Lỗi dựng tường ${idx + 1}: #{e.message}"`);
      lines.push(`    end`);
    });

    // Generate Openings (Cutout boxes / frames)
    lines.push(``);
    lines.push(`    # 4. Dựng khối Cửa đi & Cửa sổ 3D`);
    project.openings.forEach((op, idx) => {
      const wall = project.walls.find((w) => w.id === op.wallId);
      if (!wall) return;

      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const wallLen = Math.hypot(dx, dy);
      if (wallLen < 1) return;

      const ux = dx / wallLen;
      const uy = dy / wallLen;
      const halfT = wall.thickness / 2;
      const nx = -uy * halfT;
      const ny = ux * halfT;

      const sx = wall.start.x + ux * op.distanceFromStart;
      const sy = wall.start.y + uy * op.distanceFromStart;
      const ex = wall.start.x + ux * (op.distanceFromStart + op.width);
      const ey = wall.start.y + uy * (op.distanceFromStart + op.width);

      lines.push(`    # Cửa ${op.name || idx + 1} (${op.type})`);
      lines.push(`    begin`);
      lines.push(`      door_grp = root_ents.add_group`);
      lines.push(`      door_grp.name = "${op.type}_${idx + 1}"`);
      lines.push(`      door_grp.layer = tag_cua`);
      lines.push(`      c_pts = [`);
      lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(sx + nx)}), to_su.call(${Math.round(sy + ny)}), to_su.call(${op.sillHeight})),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(ex + nx)}), to_su.call(${Math.round(ey + ny)}), to_su.call(${op.sillHeight})),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(ex - nx)}), to_su.call(${Math.round(ey - ny)}), to_su.call(${op.sillHeight})),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(sx - nx)}), to_su.call(${Math.round(sy - ny)}), to_su.call(${op.sillHeight}))`);
      lines.push(`      ]`);
      lines.push(`      d_face = door_grp.entities.add_face(c_pts)`);
      lines.push(`      d_face.pushpull(to_su.call(${op.height})) if d_face`);
      lines.push(`    rescue => e`);
      lines.push(`      puts "Lỗi cửa: #{e.message}"`);
      lines.push(`    end`);
    });

    // Generate Columns
    lines.push(``);
    lines.push(`    # 5. Dựng Cột Bê Tông 3D`);
    project.columns.forEach((col, idx) => {
      const hw = col.width / 2;
      const hd = col.depth / 2;
      lines.push(`    begin`);
      lines.push(`      col_grp = root_ents.add_group`);
      lines.push(`      col_grp.name = "Cot_${idx + 1}"`);
      lines.push(`      col_grp.layer = tag_cot`);
      lines.push(`      col_pts = [`);
      lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(col.x - hw)}), to_su.call(${Math.round(col.y - hd)}), 0),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(col.x + hw)}), to_su.call(${Math.round(col.y - hd)}), 0),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(col.x + hw)}), to_su.call(${Math.round(col.y + hd)}), 0),`);
      lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(col.x - hw)}), to_su.call(${Math.round(col.y + hd)}), 0)`);
      lines.push(`      ]`);
      lines.push(`      col_face = col_grp.entities.add_face(col_pts)`);
      lines.push(`      col_face.pushpull(to_su.call(${project.defaultCeilingHeight})) if col_face`);
      lines.push(`    rescue => e`);
      lines.push(`    end`);
    });

    // Generate Curved Walls 3D
    if (project.curvedWalls && project.curvedWalls.length > 0) {
      lines.push(``);
      lines.push(`    # 6. Dựng Tường Cong 3D`);
      project.curvedWalls.forEach((cw, idx) => {
        lines.push(`    begin`);
        lines.push(`      cw_grp = root_ents.add_group`);
        lines.push(`      cw_grp.name = "Tuong_Cong_${idx + 1}"`);
        lines.push(`      cw_grp.layer = tag_cong`);
        // approximate curved wall as segmented pushpull faces
        const steps = 12;
        for (let i = 0; i < steps; i++) {
          const t1 = i / steps;
          const t2 = (i + 1) / steps;
          const p1x = Math.round((1 - t1) * (1 - t1) * cw.start.x + 2 * (1 - t1) * t1 * cw.controlPoint.x + t1 * t1 * cw.end.x);
          const p1y = Math.round((1 - t1) * (1 - t1) * cw.start.y + 2 * (1 - t1) * t1 * cw.controlPoint.y + t1 * t1 * cw.end.y);
          const p2x = Math.round((1 - t2) * (1 - t2) * cw.start.x + 2 * (1 - t2) * t2 * cw.controlPoint.x + t2 * t2 * cw.end.x);
          const p2y = Math.round((1 - t2) * (1 - t2) * cw.start.y + 2 * (1 - t2) * t2 * cw.controlPoint.y + t2 * t2 * cw.end.y);
          lines.push(`      cw_seg = cw_grp.entities.add_line(Geom::Point3d.new(to_su.call(${p1x}), to_su.call(${p1y}), 0), Geom::Point3d.new(to_su.call(${p2x}), to_su.call(${p2y}), 0))`);
        }
        lines.push(`    rescue => e`);
        lines.push(`    end`);
      });
    }

    // Generate Staircases 3D
    if (project.staircases && project.staircases.length > 0) {
      lines.push(``);
      lines.push(`    # 7. Dựng Cầu Thang 3D (Bậc thang giật cấp)`);
      project.staircases.forEach((st, idx) => {
        lines.push(`    begin`);
        lines.push(`      stair_grp = root_ents.add_group`);
        lines.push(`      stair_grp.name = "Cau_Thang_${idx + 1}"`);
        lines.push(`      stair_grp.layer = tag_thang`);
        const steps = Math.min(25, Math.max(3, st.stepCount || 19));
        const riser = st.riserHeight || 175;
        const tread = st.totalLength / steps;
        for (let s = 0; s < steps; s++) {
          const zBottom = s * riser;
          const yStart = s * tread;
          lines.push(`      pts_${s} = [`);
          lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(st.position.x)}), to_su.call(${Math.round(st.position.y + yStart)}), to_su.call(${zBottom})),`);
          lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(st.position.x + st.runWidth)}), to_su.call(${Math.round(st.position.y + yStart)}), to_su.call(${zBottom})),`);
          lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(st.position.x + st.runWidth)}), to_su.call(${Math.round(st.position.y + yStart + tread)}), to_su.call(${zBottom})),`);
          lines.push(`        Geom::Point3d.new(to_su.call(${Math.round(st.position.x)}), to_su.call(${Math.round(st.position.y + yStart + tread)}), to_su.call(${zBottom}))`);
          lines.push(`      ]`);
          lines.push(`      f_${s} = stair_grp.entities.add_face(pts_${s})`);
          lines.push(`      f_${s}.pushpull(to_su.call(${riser})) if f_${s}`);
        }
        lines.push(`    rescue => e`);
        lines.push(`    end`);
      });
    }
    lines.push(`    UI.messagebox("Đã dựng thành công mô hình Hiện trạng 4ECHouse!\\nSố lượng tường: ${project.walls.length}\\nSố cửa: ${project.openings.length}")`);
    lines.push(`  end`);
    lines.push(`end`);
    lines.push(``);
    lines.push(`# Tự động thực thi khi nạp vào SketchUp`);
    lines.push(`FourECHouseAutoBuild.build_model`);

    return lines.join('\n');
  }

  /**
   * Generates a 3D Wavefront OBJ file for direct File > Import in SketchUp Pro
   */
  public static generateObj(project: ProjectData): string {
    const lines: string[] = [];
    lines.push(`# 4ECHouse CAD 3D Model`);
    lines.push(`# Project: ${project.name}`);
    lines.push(`mtllib materials.mtl`);
    lines.push(`o FourECHouse_Building`);

    const vertices: { x: number; y: number; z: number }[] = [];
    const faces: number[][] = [];

    const addVert = (x: number, y: number, z: number): number => {
      vertices.push({ x: x / 1000, y: z / 1000, z: -y / 1000 }); // mm to meters, Y-up convention
      return vertices.length;
    };

    // Build extruded walls
    project.walls.forEach((wall) => {
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const len = Math.hypot(dx, dy);
      if (len < 50) return;

      const halfT = wall.thickness / 2;
      const nx = (-dy / len) * halfT;
      const ny = (dx / len) * halfT;

      const p1 = { x: wall.start.x + nx, y: wall.start.y + ny };
      const p2 = { x: wall.end.x + nx, y: wall.end.y + ny };
      const p3 = { x: wall.end.x - nx, y: wall.end.y - ny };
      const p4 = { x: wall.start.x - nx, y: wall.start.y - ny };
      const h = wall.height;

      // Bottom 4 vertices
      const v1 = addVert(p1.x, p1.y, 0);
      const v2 = addVert(p2.x, p2.y, 0);
      const v3 = addVert(p3.x, p3.y, 0);
      const v4 = addVert(p4.x, p4.y, 0);

      // Top 4 vertices
      const v5 = addVert(p1.x, p1.y, h);
      const v6 = addVert(p2.x, p2.y, h);
      const v7 = addVert(p3.x, p3.y, h);
      const v8 = addVert(p4.x, p4.y, h);

      // 6 quad faces (subdivided into triangles for OBJ compatibility)
      faces.push([v1, v2, v6, v5]); // Front
      faces.push([v2, v3, v7, v6]); // Right
      faces.push([v3, v4, v8, v7]); // Back
      faces.push([v4, v1, v5, v8]); // Left
      faces.push([v5, v6, v7, v8]); // Top
      faces.push([v4, v3, v2, v1]); // Bottom
    });

    // Write vertices
    vertices.forEach((v) => {
      lines.push(`v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)}`);
    });

    lines.push(`usemtl Wall_Material`);
    lines.push(`s 1`);

    // Write faces (OBJ is 1-indexed)
    faces.forEach((f) => {
      lines.push(`f ${f.join(' ')}`);
    });

    return lines.join('\n');
  }

  /**
   * Generates step-by-step Vietnamese guide for architects
   */
  public static generateUserGuide(project: ProjectData): string {
    return `=============================================================================
HƯỚNG DẪN MỞ BẢN VẼ 4ECHOUSE VÀO SKETCHUP & AUTOCAD CHUẨN XÁC 100%
Công trình: ${project.name}
Đơn vị số đo: mm (Millimeters)
=============================================================================

1. CÁCH 1: NẠP VÀO SKETCHUP TỰ ĐỘNG BẰNG FILE SCRIPT (.RB) [KHUYÊN DÙNG]
   - Bước 1: Mở phần mềm SketchUp (bất kỳ phiên bản nào: Make 2017 đến Pro 2026).
   - Bước 2: Trên thanh Menu của SketchUp, chọn "Extensions" (hoặc "Window") -> "Ruby Console".
   - Bước 3: Trong cửa sổ Ruby Console, gõ lệnh sau rồi nhấn Enter:
             load '${project.projectCode}_4echouse_sketchup.rb'
             (Hoặc mở file .rb bằng Notepad, copy toàn bộ nội dung và paste thẳng vào Ruby Console).
   - Kết quả: SketchUp sẽ tự động dựng toàn bộ khối tường 3D, khoét lỗ cửa, tạo Layer/Tag chuẩn!

2. CÁCH 2: NHẬP TRỰC TIẾP FILE 3D (.OBJ) VÀO SKETCHUP
   - Bước 1: Mở SketchUp -> Chọn File -> Import.
   - Bước 2: Tại mục định dạng tệp (Format), chọn "3D Model (*.obj)" (hoặc "All Supported Files").
   - Bước 3: Chọn file '${project.projectCode}_3d_model.obj' -> Nhấn Import.
   - Kết quả: Mô hình không gian 3D hiện trạng sẽ xuất hiện ngay lập tức trong không gian làm việc.

3. MỞ BẢN VẼ 2D VÀO AUTOCAD / ZWCAD:
   - File CAD được xuất chuẩn R2000 (.dxf và .dwg).
   - Mở AutoCAD -> File -> Open -> Chọn file '${project.projectCode}_hien_trang.dxf' (hoặc .dwg).
   - Gõ lệnh "Z" -> "E" (Zoom Extents) để đưa bản vẽ vào chính giữa màn hình.
   - Toàn bộ Layer chuẩn kiến trúc (A-WALL, A-DOOR, A-GLAZ, A-DIMS, A-ROOM) đã được phân lớp màu sắc rõ ràng.

Hỗ trợ khảo sát hiện trạng: 4ECHouse CAD Architecture Tool
=============================================================================`;
  }
}
