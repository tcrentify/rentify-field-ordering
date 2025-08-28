
import React, { useEffect, useMemo, useState } from "react";

// Utils
const uid = () => Math.random().toString(36).slice(2);
const roundUp = (n: number, step = 1) => Math.ceil((n + 1e-9) / step) * step;
const toNumber = (v: any, fallback = 0) => (Number.isFinite(+v) ? +v : fallback);

// Defaults
const DEFAULTS = {
  paintCoverageSqftPerGallon: 350,
  wallCoats: 2,
  ceilingCoats: 1,
  flooringWaste: 0.1,
  trimWaste: 0.1,
  defaultCeilingHeightFt: 8,
  drywallWaste: 0.15,
  drywallIncludeCeiling: true,
  drywallSheetPreference: 8,
  defaultDoorHeightFt: 6.8,
};

// Catalog
type CatItem = { name: string; unit: string; defaultSku: string };
const CATALOG: Record<string, CatItem> = {
  smoke_detector: { name: "Smoke detector, 10 year", unit: "ea", defaultSku: "" },
  carbon_monoxide_detector: { name: "Carbon monoxide detector", unit: "ea", defaultSku: "" },
  flushmount_light: { name: "Ceiling flush mount light", unit: "ea", defaultSku: "" },
  recessed_can_housing: { name: "6 in recessed can housing", unit: "ea", defaultSku: "13627" },
  recessed_can_led: { name: "6 in LED can light / trim", unit: "ea", defaultSku: "5375309" },
  ceiling_paint_gal: { name: "Ceiling paint, gallon", unit: "gal", defaultSku: "" },
  drywall_1_2_4x8: { name: "Drywall 1/2 in 4x8", unit: "sheet", defaultSku: "210351" },
  drywall_1_2_4x10: { name: "Drywall 1/2 in 4x10", unit: "sheet", defaultSku: "209970" },
  drywall_1_2_4x12: { name: "Drywall 1/2 in 4x12", unit: "sheet", defaultSku: "210187" },
  drywall_1_2_4x10_m2tech: { name: "Mold/Moisture drywall 1/2 in 4x10", unit: "sheet", defaultSku: "1058520" },
  drywall_1_2_4x8_mmr: { name: "Mold/Moisture drywall 1/2 in 4x8", unit: "sheet", defaultSku: "337172" },
  joint_compound_4_5gal: { name: "Joint compound 4.5 gal", unit: "pail", defaultSku: "11555" },
  wall_paint_gal: { name: "Wall paint, gallon (Agreeable Gray)", unit: "gal", defaultSku: "" },
  duplex_outlet: { name: "Duplex outlet, 15A", unit: "ea", defaultSku: "" },
  outlet_standard: { name: "Outlet, 15A", unit: "ea", defaultSku: "" },
  switch_standard: { name: "Light switch, single-pole", unit: "ea", defaultSku: "" },
  switch_3way: { name: "Light switch, 3-way", unit: "ea", defaultSku: "" },
  stack_switch: { name: "Stacked switch", unit: "ea", defaultSku: "" },
  cover_plate: { name: "Cover plate, standard", unit: "ea", defaultSku: "" },
  febreze_plugin: { name: "Febreze plugin", unit: "ea", defaultSku: "" },
  wire_14_2_250: { name: "14/2 NM-B with ground 250 ft", unit: "roll", defaultSku: "70123" },
  wire_12_2_250: { name: "12/2 NM-B with ground 250 ft", unit: "roll", defaultSku: "70111" },
  wire_14_3_250: { name: "14/3 NM-B with ground 250 ft", unit: "roll", defaultSku: "70160" },
  breaker_20a: { name: "20A breaker", unit: "ea", defaultSku: "" },
  base_3_1_4_lf: { name: "Baseboard 3-1/4 in, linear feet", unit: "lf", defaultSku: "208770" },
  base_5_1_4_lf: { name: "Baseboard 5-1/4 in, linear feet", unit: "lf", defaultSku: "328509" },
  baseboard_lf: { name: "Baseboard, linear feet (generic)", unit: "lf", defaultSku: "" },
  casing_lf: { name: "Door casing, linear feet", unit: "lf", defaultSku: "328503" },
  window_casing_lf: { name: "Window casing, linear feet", unit: "lf", defaultSku: "328503" },
  caulk_tube: { name: "Paintable caulk, 10 oz", unit: "tube", defaultSku: "" },
  quarter_round_lf: { name: "Quarter round MDF, linear feet", unit: "lf", defaultSku: "5378900" },
  mdf_1x4x8: { name: "1x4x8 MDF primed", unit: "ea", defaultSku: "6093" },
  mdf_1x4x12: { name: "1x4x12 MDF primed", unit: "ea", defaultSku: "229547" },
  mdf_1x6x8: { name: "1x6x8 MDF primed", unit: "ea", defaultSku: "6305" },
  mdf_1x2x8: { name: "1x2x8 MDF primed", unit: "ea", defaultSku: "5733" },
  mdf_1x12x8: { name: "1x12x8 MDF primed", unit: "ea", defaultSku: "9489" },
  beadboard_panel: { name: "Beadboard panel", unit: "ea", defaultSku: "296727" },
  door_interior_slab: { name: "Interior door slab, 30 x 80", unit: "ea", defaultSku: "743353" },
  door_hinges_set: { name: "Door hinges, set of 3", unit: "set", defaultSku: "" },
  door_knob: { name: "Passage knob", unit: "ea", defaultSku: "" },
  lvp_sqft: { name: "LVP flooring, square feet", unit: "sqft", defaultSku: "3695020" },
  transition_strip: { name: "Transition strip", unit: "ea", defaultSku: "" },
  shoe_nails: { name: "18ga brad nails for quarter round", unit: "box", defaultSku: "524395" },
  register_vent: { name: "Register vent", unit: "ea", defaultSku: "" },
  tile_sqft: { name: "Tile, square feet", unit: "sqft", defaultSku: "1098697" },
  thinset_bag: { name: "Thinset mortar, 50 lb", unit: "bag", defaultSku: "2845444" },
  grout_bag: { name: "Grout, 25 lb", unit: "bag", defaultSku: "" },
  backerboard_sqft: { name: "Cement board, square feet", unit: "sqft", defaultSku: "60358" },
  waterproof_gal: { name: "Waterproofing, gallon", unit: "gal", defaultSku: "" },
  electric_fireplace: { name: "Electric fireplace insert", unit: "ea", defaultSku: "" },
  bath_fan: { name: "Bathroom exhaust fan", unit: "ea", defaultSku: "901408" },
  gfi_outlet: { name: "GFCI outlet", unit: "ea", defaultSku: "" },
  kitchen_flushmount: { name: "Kitchen flush mount light", unit: "ea", defaultSku: "" },
  gfi_kit_3pack: { name: "GFCI outlet, 3 pack", unit: "pack", defaultSku: "" },
  vanity_30: { name: "Vanity 30 in with top", unit: "ea", defaultSku: "492894" },
  faucet_bath: { name: "Bath faucet or trim", unit: "ea", defaultSku: "3808610" },
  toilet: { name: "Toilet, chair height", unit: "ea", defaultSku: "2691714" },
};

// Room templates
const ROOM_TEMPLATES: Record<string, {section: string; items: string[]}[]> = {
  "Living Room": [
    { section: "Ceiling", items: ["smoke_detector", "carbon_monoxide_detector", "flushmount_light", "recessed_can_housing", "recessed_can_led", "ceiling_paint_gal"] },
    { section: "Drywall", items: ["drywall_1_2_4x8", "drywall_1_2_4x10", "drywall_1_2_4x12", "drywall_1_2_4x10_m2tech", "drywall_1_2_4x8_mmr", "joint_compound_4_5gal"] },
    { section: "Walls & Electrical", items: ["wall_paint_gal", "switch_standard", "switch_3way", "stack_switch", "duplex_outlet", "cover_plate", "wire_14_2_250", "wire_12_2_250", "wire_14_3_250", "breaker_20a", "febreze_plugin"] },
    { section: "Trim", items: ["base_3_1_4_lf", "base_5_1_4_lf", "casing_lf", "window_casing_lf", "caulk_tube", "quarter_round_lf"] },
    { section: "Boards & Fireplace", items: ["mdf_1x4x8", "mdf_1x4x12", "mdf_1x6x8", "mdf_1x2x8", "mdf_1x12x8", "beadboard_panel", "electric_fireplace", "tile_sqft", "backerboard_sqft", "waterproof_gal", "thinset_bag", "grout_bag"] },
    { section: "Doors", items: ["door_interior_slab", "door_hinges_set", "door_knob"] },
    { section: "Flooring", items: ["lvp_sqft", "transition_strip", "quarter_round_lf", "shoe_nails", "register_vent"] },
  ],
  Bedroom: [
    { section: "Ceiling", items: ["smoke_detector", "flushmount_light", "ceiling_paint_gal"] },
    { section: "Walls", items: ["wall_paint_gal", "outlet_standard", "switch_standard", "cover_plate"] },
    { section: "Trim", items: ["baseboard_lf", "casing_lf", "caulk_tube", "quarter_round_lf"] },
    { section: "Doors", items: ["door_interior_slab", "door_hinges_set", "door_knob"] },
    { section: "Flooring", items: ["lvp_sqft", "transition_strip", "shoe_nails"] },
  ],
  Bathroom: [
    { section: "Ceiling", items: ["bath_fan", "ceiling_paint_gal"] },
    { section: "Walls", items: ["wall_paint_gal", "gfi_outlet", "cover_plate", "tile_sqft", "backerboard_sqft", "waterproof_gal", "thinset_bag", "grout_bag"] },
    { section: "Trim", items: ["baseboard_lf", "caulk_tube", "quarter_round_lf"] },
    { section: "Doors", items: ["door_interior_slab", "door_hinges_set", "door_knob"] },
    { section: "Flooring", items: ["lvp_sqft", "transition_strip", "shoe_nails"] },
    { section: "Plumbing", items: ["vanity_30", "faucet_bath", "toilet"] },
  ],
  Kitchen: [
    { section: "Ceiling", items: ["kitchen_flushmount", "ceiling_paint_gal"] },
    { section: "Walls", items: ["wall_paint_gal", "gfi_kit_3pack", "cover_plate"] },
    { section: "Trim", items: ["baseboard_lf", "casing_lf", "caulk_tube", "quarter_round_lf"] },
    { section: "Doors", items: ["door_interior_slab", "door_hinges_set", "door_knob"] },
    { section: "Flooring", items: ["lvp_sqft", "transition_strip", "shoe_nails"] },
  ],
  Hallway: [
    { section: "Ceiling", items: ["smoke_detector", "flushmount_light", "ceiling_paint_gal"] },
    { section: "Walls", items: ["wall_paint_gal", "cover_plate"] },
    { section: "Trim", items: ["baseboard_lf", "caulk_tube", "quarter_round_lf"] },
    { section: "Flooring", items: ["lvp_sqft", "transition_strip", "shoe_nails"] },
  ],
  Entryway: [
    { section: "Ceiling", items: ["flushmount_light", "ceiling_paint_gal"] },
    { section: "Walls", items: ["wall_paint_gal", "cover_plate"] },
    { section: "Trim", items: ["baseboard_lf", "caulk_tube", "quarter_round_lf"] },
    { section: "Flooring", items: ["lvp_sqft", "transition_strip", "shoe_nails"] },
  ],
  Closet: [
    { section: "Ceiling", items: ["ceiling_paint_gal"] },
    { section: "Walls", items: ["wall_paint_gal"] },
    { section: "Trim", items: ["baseboard_lf", "caulk_tube"] },
    { section: "Flooring", items: ["lvp_sqft"] },
  ],
};

// Types
type Opening = { widthFt?: number; heightFt?: number; count?: number };
type Room = {
  id?: string;
  type: string;
  name: string;
  lengthFt: number | string;
  widthFt: number | string;
  heightFt?: number | string;
  doors?: Opening[];
  windows?: Opening[];
  openingsEnabled?: boolean;
  photos?: string[];
  notes?: string;
  items?: Record<string, any>;
};

// Pure calculator
function computeQuantitiesPure(room: Room, settings = DEFAULTS) {
  const L = toNumber(room.lengthFt);
  const W = toNumber(room.widthFt);
  const H = toNumber(room.heightFt ?? settings.defaultCeilingHeightFt ?? DEFAULTS.defaultCeilingHeightFt);
  const perimeter = 2 * (L + W);
  const area = L * W;
  const doorsWidth = room.openingsEnabled
    ? (room.doors ?? []).reduce((s, d) => s + toNumber(d.widthFt) * toNumber(d.count), 0)
    : 0;
  const doorArea = room.openingsEnabled
    ? (room.doors ?? []).reduce((s, d) => s + toNumber(d.widthFt) * toNumber(settings.defaultDoorHeightFt) * toNumber(d.count), 0)
    : 0;
  const windowsArea = room.openingsEnabled
    ? (room.windows ?? []).reduce((s, w) => s + toNumber(w.widthFt) * toNumber(w.heightFt) * toNumber(w.count), 0)
    : 0;

  const floorSqft = area > 0 ? roundUp(area * (1 + settings.flooringWaste), 1) : 0;
  const baseboardLf = perimeter > 0 ? roundUp((perimeter - doorsWidth) * (1 + settings.trimWaste), 1) : 0;

  const wallAreaForPaint = Math.max(perimeter * H - windowsArea, 0);
  const wallPaintGalRaw = wallAreaForPaint > 0 ? (wallAreaForPaint * settings.wallCoats) / settings.paintCoverageSqftPerGallon : 0;
  const wallPaintGal = roundUp(wallPaintGalRaw, 1);

  const ceilingArea = area;
  const ceilPaintGalRaw = ceilingArea > 0 ? (ceilingArea * settings.ceilingCoats) / settings.paintCoverageSqftPerGallon : 0;
  const ceilingPaintGal = roundUp(ceilPaintGalRaw, 1);

  const wallAreaForDrywall = Math.max(perimeter * H - windowsArea - doorArea, 0);
  const drywallArea = wallAreaForDrywall + (settings.drywallIncludeCeiling ? ceilingArea : 0);

  return { floorSqft, baseboardLf, wallPaintGal, ceilingPaintGal, drywallArea };
}

function drywallSheetsFor(areaSqft: number, sheetLenFt: number, settings = DEFAULTS) {
  const sheetSqft = 4 * sheetLenFt;
  const withWaste = areaSqft * (1 + settings.drywallWaste);
  return roundUp(withWaste / sheetSqft, 1);
}

// CSV helpers
type CsvRow = {
  Retailer: string;
  SKU: string;
  "Item Name": string;
  Quantity: number;
  Unit: string;
  Room: string;
  Property: string;
  Notes: string;
};
function buildCsvString(rows: CsvRow[]) {
  const headers = ["Retailer","SKU","Item Name","Quantity","Unit","Room","Property","Notes"];
  const esc = (v: any) => {
    const s = String(v ?? "").replaceAll('"', '""');
    return '"' + s + '"';
  };
  const out = [headers.join(",")];
  for (const r of rows) out.push(headers.map((h) => esc((r as any)[h] ?? "")).join(","));
  return out.join("\n");
}
function toCsv(rows: CsvRow[]) {
  const csv = buildCsvString(rows);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lowes-order.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Room model
function emptyRoom(type = "Living Room"): Room {
  return {
    id: uid(),
    type,
    name: `${type}`,
    lengthFt: "",
    widthFt: "",
    heightFt: DEFAULTS.defaultCeilingHeightFt,
    doors: [{ widthFt: 2.5, count: 1 }],
    windows: [{ widthFt: 3, heightFt: 4, count: 1 }],
    openingsEnabled: false,
    photos: [],
    notes: "",
    items: {},
  };
}
function sampleProject() {
  return {
    property: "",
    rooms: [emptyRoom("Living Room")],
    settings: { ...DEFAULTS },
    skuOverrides: {} as Record<string, string>,
  };
}

// UI bits
function Th({ children }: {children: React.ReactNode}) {
  return <th className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</th>;
}
function NumberField({ label, value, onChange, suffix, step = 1 }:{label:string; value:any; onChange:(v:number)=>void; suffix?:string; step?:number}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2 py-1">
        <input type="number" step={step} className="w-full bg-transparent p-1 focus:outline-none" value={value as any} onChange={(e) => onChange(toNumber(e.target.value, 0))} />
        {suffix ? <span className="text-xs text-slate-500">{suffix}</span> : null}
      </div>
    </label>
  );
}
function ComputedBadge({ label, value }:{label:string; value:string}) {
  return <div className="mb-1 rounded-lg bg-slate-50 px-2 py-1 text-xs"><span className="font-medium">{label}:</span> {value}</div>;
}
function RoomAdder({ onAdd }:{onAdd:(type:string)=>void}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("Living Room");
  return (
    <div className="relative">
      <button className="rounded-xl bg-black px-3 py-1.5 text-sm text-white shadow-sm" onClick={() => setOpen((v) => !v)}>Add room</button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <label className="text-xs text-slate-600">Room type</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
            {Object.keys(ROOM_TEMPLATES).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white" onClick={() => { onAdd(type); setOpen(false); }}>Create</button>
        </div>
      )}
    </div>
  );
}
function OpeningsEditor({ title, items, onChange, fields }:{title:string; items:Opening[]; onChange:(x:Opening[])=>void; fields:{key:"widthFt"|"heightFt"; label:string}[]}) {
  const add = () => {
    const base:any = Object.fromEntries(fields.map((f) => [f.key, 0]));
    onChange([...(items || []), { ...base, count: 1 }]);
  };
  const update = (idx:number, key:"widthFt"|"heightFt"|"count", value:any) => onChange(items.map((it, i) => (i === idx ? { ...it, [key]: toNumber(value, 0) } : it)));
  const remove = (idx:number) => onChange(items.filter((_, i) => i !== idx));
  return (
    <div>
      <div className="mb-1 text-sm font-medium">{title}</div>
      <div className="space-y-2">
        {(items || []).map((it, i) => (
          <div key={i} className="grid grid-cols-12 items-end gap-2">
            {fields.map((f, j) => (
              <label key={j} className="col-span-5 text-xs">
                <span className="text-slate-600">{f.label}</span>
                <input type="number" className="mt-1 w-full rounded-lg border border-slate-300 p-1" value={(it as any)[f.key] ?? 0} onChange={(e) => update(i, f.key, e.target.value)} />
              </label>
            ))}
            <label className="col-span-2 text-xs">
              <span className="text-slate-600">Count</span>
              <input type="number" className="mt-1 w-full rounded-lg border border-slate-300 p-1" value={it.count ?? 1} onChange={(e) => update(i, "count", e.target.value)} />
            </label>
            <button className="col-span-12 justify-self-end rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" onClick={() => remove(i)}>Remove</button>
          </div>
        ))}
        <button className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" onClick={add}>Add {title.slice(0, -1)}</button>
      </div>
    </div>
  );
}
function ItemRow({ room, itemKey, catalog, compute, onChange, skuOverride, preferredDrywallLen }:{room:Room; itemKey:string; catalog:Record<string,CatItem>; compute:()=>ReturnType<typeof computeQuantitiesPure>; onChange:(patch:any)=>void; skuOverride?:string; preferredDrywallLen?:number}) {
  const calc = compute();
  const c = catalog[itemKey];
  const current = (room.items ?? {})[itemKey] || {};

  let defaultQty = 0;
  if (itemKey === "lvp_sqft") defaultQty = calc.floorSqft;
  if (itemKey === "baseboard_lf" || itemKey === "base_3_1_4_lf" || itemKey === "base_5_1_4_lf" || itemKey === "quarter_round_lf") defaultQty = calc.baseboardLf;
  if (itemKey === "wall_paint_gal") defaultQty = calc.wallPaintGal;
  if (itemKey === "ceiling_paint_gal") defaultQty = calc.ceilingPaintGal;
  if (itemKey.startsWith("drywall_1_2_4x")) {
    const len = Number(itemKey.replace("drywall_1_2_4x", "").replace("_mmr", "").replace("_m2tech", ""));
    if (len === (preferredDrywallLen ?? DEFAULTS.drywallSheetPreference)) {
      defaultQty = drywallSheetsFor(calc.drywallArea || computeQuantitiesPure(room, DEFAULTS).drywallArea, len, DEFAULTS);
    } else {
      defaultQty = 0;
    }
  }

  const include = current.include ?? (defaultQty > 0);
  const qty = current.qty ?? defaultQty;
  const sku = current.sku ?? skuOverride ?? c.defaultSku;

  return (
    <div className="grid grid-cols-12 items-center gap-2 rounded-lg border border-slate-200 p-2">
      <label className="col-span-12 flex items-center gap-2 text-sm md:col-span-5">
        <input type="checkbox" checked={!!include} onChange={(e) => onChange({ include: e.target.checked })} />
        <span className="font-medium">{c.name}</span>
        <span className="text-xs text-slate-500">({c.unit})</span>
      </label>
      <label className="col-span-6 text-xs md:col-span-2">
        <span className="text-slate-600">Qty</span>
        <input type="number" className="mt-1 w-full rounded-lg border border-slate-300 p-1" value={qty} onChange={(e) => onChange({ qty: toNumber(e.target.value, 0) })} />
      </label>
      <label className="col-span-6 text-xs md:col-span-3">
        <span className="text-slate-600">SKU</span>
        <input className="mt-1 w-full rounded-lg border border-slate-300 p-1" value={sku} onChange={(e) => onChange({ sku: e.target.value })} />
      </label>
      <label className="col-span-12 text-xs md:col-span-2">
        <span className="text-slate-600">Notes</span>
        <input className="mt-1 w-full rounded-lg border border-slate-300 p-1" placeholder="Color, size, style" value={current.notes || ""} onChange={(e) => onChange({ notes: e.target.value })} />
      </label>
    </div>
  );
}

// Main App
export default function App() {
  const [project, setProject] = useState(() => {
    try {
      const raw = localStorage.getItem("rentify:project:full");
      return raw ? JSON.parse(raw) : sampleProject();
    } catch {
      return sampleProject();
    }
  });
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(() => project.rooms?.[0]?.id);

  useEffect(() => {
    localStorage.setItem("rentify:project:full", JSON.stringify(project));
  }, [project]);

  const activeRoom: Room | undefined = project.rooms.find((r:Room) => r.id === activeRoomId);

  const computeQuantities = (room: Room) => computeQuantitiesPure(room, project.settings);

  const setRoom = (id: string, patch: Partial<Room>) => {
    setProject((p:any) => ({
      ...p,
      rooms: p.rooms.map((r:Room) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  };

  const addRoom = (type: string) => {
    const r = emptyRoom(type);
    setProject((p:any) => ({ ...p, rooms: [...p.rooms, r] }));
    setActiveRoomId(r.id);
  };

  const removeRoom = (id: string) => {
    setProject((p:any) => {
      const newRooms = p.rooms.filter((r:Room) => r.id !== id);
      const nextActive = activeRoomId === id ? newRooms[0]?.id : activeRoomId;
      if (nextActive !== activeRoomId) setActiveRoomId(nextActive);
      return { ...p, rooms: newRooms };
    });
  };

  const handlePhotoAdd = async (room: Room, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRoom(room.id as string, { photos: [...(room.photos ?? []), reader.result as string] });
    };
    reader.readAsDataURL(file);
  };

  const orderRows = useMemo(() => {
    const rows: CsvRow[] = [];
    for (const room of project.rooms as Room[]) {
      const q = computeQuantities(room);
      const template = ROOM_TEMPLATES[room.type] || [];
      for (const group of template) {
        for (const key of group.items) {
          const cat = (CATALOG as any)[key] as CatItem | undefined;
          if (!cat) continue;

          let defaultQty = 0;
          if (key === "lvp_sqft") defaultQty = q.floorSqft;
          if (key === "baseboard_lf" || key === "base_3_1_4_lf" || key === "base_5_1_4_lf" || key === "quarter_round_lf") defaultQty = q.baseboardLf;
          if (key === "wall_paint_gal") defaultQty = q.wallPaintGal;
          if (key === "ceiling_paint_gal") defaultQty = q.ceilingPaintGal;
          if (key.startsWith("drywall_1_2_4x")) {
            const len = Number(key.replace("drywall_1_2_4x", "").replace("_mmr", "").replace("_m2tech", ""));
            if (len === project.settings.drywallSheetPreference) {
              defaultQty = drywallSheetsFor(q.drywallArea, len, project.settings);
            } else {
              defaultQty = 0;
            }
          }

          const itm = (room.items ?? {})[key] || {};
          const include = itm.include ?? (defaultQty > 0);
          const qty = toNumber(itm.qty ?? defaultQty, defaultQty);
          const sku = itm.sku || (project.skuOverrides as any)[key] || cat.defaultSku || "";
          const notes = itm.notes || "";

          if (include && qty > 0) {
            rows.push({
              Retailer: "Lowes",
              SKU: sku,
              "Item Name": cat.name,
              Quantity: qty,
              Unit: (cat as any).unit,
              Room: room.name,
              Property: project.property,
              Notes: notes,
            } as CsvRow);
          }
        }
      }
    }

    const grouped = new Map<string, CsvRow>();
    for (const r of rows) {
      const gk = `${r.SKU}|${r["Item Name"]}|${r.Unit}`;
      const prev = grouped.get(gk);
      if (prev) {
        prev.Quantity += r.Quantity;
        prev.Room = prev.Room + ", " + r.Room;
      } else {
        grouped.set(gk, { ...r });
      }
    }
    return Array.from(grouped.values());
  }, [project.rooms, project.property, project.settings]);

  const copyText = async () => {
    const lines = [
      `Property: ${project.property}`,
      "",
      ...orderRows.map((r) => `${r.Quantity} ${r.Unit} - ${r["Item Name"]} - SKU ${r.SKU} - Rooms: ${r.Room}`),
    ];
    const txt = lines.join("\\n");
    try {
      await navigator.clipboard.writeText(txt);
      alert("Order copied to clipboard");
    } catch (e) {
      console.error(e);
      alert("Copy failed. You can still export CSV.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rentify Field Ordering</h1>
            <p className="text-sm text-slate-600">Guided by room from ceiling to floor</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="w-72 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none"
              placeholder="Property address or nickname"
              value={project.property}
              onChange={(e) => setProject({ ...project, property: e.target.value })}
            />
            <button className="rounded-xl bg-black px-4 py-2 text-white shadow-sm hover:opacity-90" onClick={() => toCsv(orderRows)}>Download Lowe's CSV</button>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 shadow-sm hover:bg-slate-100" onClick={copyText}>Copy order text</button>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Rooms</h2>
                <RoomAdder onAdd={addRoom} />
              </div>
              <div className="mt-2 divide-y">
                {project.rooms.map((r:Room) => (
                  <div key={r.id} className={`flex items-center justify-between gap-2 p-2 ${activeRoomId === r.id ? "bg-slate-50" : ""}`}>
                    <button onClick={() => setActiveRoomId(r.id as string)} className="flex-1 text-left">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.type}</div>
                    </button>
                    <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => removeRoom(r.id as string)} title="Remove room">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <h3 className="text-base font-semibold">Settings</h3>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <NumberField label="Paint coverage per gallon" suffix="sqft" value={project.settings.paintCoverageSqftPerGallon} onChange={(v) => setProject({ ...project, settings: { ...project.settings, paintCoverageSqftPerGallon: v } })} />
                <NumberField label="Wall coats" value={project.settings.wallCoats} onChange={(v) => setProject({ ...project, settings: { ...project.settings, wallCoats: v } })} />
                <NumberField label="Ceiling coats" value={project.settings.ceilingCoats} onChange={(v) => setProject({ ...project, settings: { ...project.settings, ceilingCoats: v } })} />
                <NumberField label="Flooring waste" suffix="ratio" step={0.01} value={project.settings.flooringWaste} onChange={(v) => setProject({ ...project, settings: { ...project.settings, flooringWaste: v } })} />
                <NumberField label="Trim waste" suffix="ratio" step={0.01} value={project.settings.trimWaste} onChange={(v) => setProject({ ...project, settings: { ...project.settings, trimWaste: v } })} />
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 p-3">
                <div className="mb-2 text-sm font-semibold">Drywall preferences</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={project.settings.drywallIncludeCeiling} onChange={(e) => setProject({ ...project, settings: { ...project.settings, drywallIncludeCeiling: e.target.checked } })} />
                    Include ceiling in drywall calc
                  </label>
                  <NumberField label="Drywall waste" suffix="ratio" step={0.01} value={project.settings.drywallWaste} onChange={(v) => setProject({ ...project, settings: { ...project.settings, drywallWaste: v } })} />
                  <label className="grid gap-1 text-sm">
                    <span className="text-slate-600">Preferred sheet length</span>
                    <select className="rounded-lg border border-slate-300 bg-white px-2 py-1" value={project.settings.drywallSheetPreference} onChange={(e) => setProject({ ...project, settings: { ...project.settings, drywallSheetPreference: toNumber(e.target.value, 12) } })}>
                      <option value={8}>8 ft</option>
                      <option value={10}>10 ft</option>
                      <option value={12}>12 ft</option>
                    </select>
                  </label>
                  <NumberField label="Door height" suffix="ft" step={0.1} value={project.settings.defaultDoorHeightFt} onChange={(v) => setProject({ ...project, settings: { ...project.settings, defaultDoorHeightFt: v } })} />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <h3 className="text-base font-semibold">SKU Overrides</h3>
              <p className="mb-2 text-xs text-slate-500">Preloaded where known. Edit as needed.</p>
              <div className="max-h-52 overflow-y-auto pr-2 text-sm">
                {Object.entries(CATALOG).map(([key, c]) => (
                  <div className="mb-2 grid grid-cols-5 items-center gap-2" key={key}>
                    <div className="col-span-3 truncate" title={c.name}>{c.name}</div>
                    <input
                      className="col-span-2 rounded-lg border border-slate-300 bg-white px-2 py-1"
                      placeholder={c.defaultSku}
                      value={(project.skuOverrides as any)[key] || ""}
                      onChange={(e) => setProject({ ...project, skuOverrides: { ...(project.skuOverrides as any), [key]: e.target.value } })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!activeRoom ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-slate-500">Add a room to begin</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xl font-semibold" value={activeRoom.name} onChange={(e) => setRoom(activeRoom.id as string, { name: e.target.value })} />
                      <div className="mt-1 text-xs text-slate-500">Type: {activeRoom.type}</div>
                    </div>
                    <div className="flex gap-2">
                      <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" value={activeRoom.type} onChange={(e) => setRoom(activeRoom.id as string, { type: e.target.value })}>
                        {Object.keys(ROOM_TEMPLATES).map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setRoom(activeRoom.id as string, emptyRoom(activeRoom.type))} title="Reset room to defaults">Reset</button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <NumberField label="Length" suffix="ft" value={activeRoom.lengthFt} onChange={(v) => setRoom(activeRoom.id as string, { lengthFt: v })} />
                    <NumberField label="Width" suffix="ft" value={activeRoom.widthFt} onChange={(v) => setRoom(activeRoom.id as string, { widthFt: v })} />
                    <NumberField label="Height" suffix="ft" value={activeRoom.heightFt as any} onChange={(v) => setRoom(activeRoom.id as string, { heightFt: v })} />
                    <div className="rounded-xl border border-slate-200 p-3 text-sm">
                      {(() => { const cq = computeQuantities(activeRoom); return (
                        <>
                          <ComputedBadge label="Floor area" value={`${cq.floorSqft} sqft`} />
                          <ComputedBadge label="Baseboard" value={`${cq.baseboardLf} lf`} />
                          <ComputedBadge label="Wall paint" value={`${cq.wallPaintGal} gal`} />
                          <ComputedBadge label="Ceiling paint" value={`${cq.ceilingPaintGal} gal`} />
                          <ComputedBadge label="Drywall area" value={`${cq.drywallArea} sqft`} />
                        </>
                      ); })()}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 p-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input type="checkbox" checked={!!activeRoom.openingsEnabled} onChange={(e) => setRoom(activeRoom.id as string, { openingsEnabled: e.target.checked })} />
                      Subtract doors and windows from calculations
                    </label>
                    {activeRoom.openingsEnabled && (
                      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <OpeningsEditor
                          title="Doors"
                          items={activeRoom.doors ?? []}
                          onChange={(items) => setRoom(activeRoom.id as string, { doors: items })}
                          fields={[{ key: "widthFt", label: "Width ft" }]}
                        />
                        <OpeningsEditor
                          title="Windows"
                          items={activeRoom.windows ?? []}
                          onChange={(items) => setRoom(activeRoom.id as string, { windows: items })}
                          fields={[{ key: "widthFt", label: "Width ft" }, { key: "heightFt", label: "Height ft" }]}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Photos</div>
                      <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm hover:bg-slate-100">
                        Add photo
                        <input type="file" accept="image/*" capture className="hidden" onChange={(e) => handlePhotoAdd(activeRoom, e.target.files?.[0])} />
                      </label>
                    </div>
                    {(activeRoom.photos ?? []).length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">No photos yet</p>
                    ) : (
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {(activeRoom.photos ?? []).map((src, i) => (
                          <div key={i} className="relative overflow-hidden rounded-xl border">
                            <img src={src} alt={`Room photo ${i + 1}`} className="h-32 w-full object-cover" />
                            <button className="absolute right-1 top-1 rounded bg-white/80 px-2 text-xs" onClick={() => setRoom(activeRoom.id as string, { photos: (activeRoom.photos ?? []).filter((_, idx) => idx !== i) })}>Remove</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-semibold">Guided list</h3>
                  <p className="text-xs text-slate-500">Start at the ceiling and work down to the floor</p>
                  <div className="mt-3 space-y-6">
                    {(ROOM_TEMPLATES[activeRoom.type] || []).map((group) => (
                      <div key={group.section} className="rounded-xl border border-slate-100 p-3">
                        <div className="mb-2 text-sm font-semibold">{group.section}</div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {group.items.map((key) => (
                            <ItemRow
                              key={key}
                              room={activeRoom}
                              itemKey={key}
                              catalog={CATALOG}
                              compute={() => computeQuantities(activeRoom)}
                              onChange={(patch) => setRoom(activeRoom.id as string, { items: { ...(activeRoom.items ?? {}), [key]: { ...(activeRoom.items ?? {})[key], ...patch } } })}
                              skuOverride={(project.skuOverrides as any)[key]}
                              preferredDrywallLen={project.settings.drywallSheetPreference}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <textarea className="w-full rounded-xl border border-slate-300 p-3 text-sm" rows={3} placeholder="Room notes" value={activeRoom.notes ?? ""} onChange={(e) => setRoom(activeRoom.id as string, { notes: e.target.value })} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-semibold">Order preview</h3>
                  <div className="mt-2 max-h-72 overflow-auto rounded-xl border">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <Th>Qty</Th>
                          <Th>Unit</Th>
                          <Th>Item</Th>
                          <Th>SKU</Th>
                          <Th>Rooms</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderRows.length === 0 ? (
                          <tr><td className="p-3 text-slate-500" colSpan={5}>No items yet</td></tr>
                        ) : (
                          orderRows.map((r, i) => (
                            <tr key={i} className="odd:bg-white even:bg-slate-50">
                              <td className="p-3">{r.Quantity}</td>
                              <td className="p-3">{r.Unit}</td>
                              <td className="p-3">{r["Item Name"]}</td>
                              <td className="p-3">{r.SKU}</td>
                              <td className="p-3">{r.Room}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <DevTests />
              </div>
            )}
          </div>
        </div>

        <footer className="mt-6 pb-8 text-center text-xs text-slate-500">
          <p>This is a prototype. Confirm quantities with your standards before ordering.</p>
        </footer>
      </div>
    </div>
  );
}

// Dev tests
function DevTests() {
  const [results, setResults] = useState<{name:string; pass:boolean; details:string}[]>([]);

  const run = () => {
    const res: {name:string; pass:boolean; details:string}[] = [];
    const push = (name:string, cond:any, details = "") => res.push({ name, pass: !!cond, details });

    // Test 1: computeQuantitiesPure basic 10x12x8
    const room1: Room = { type:"Living Room", name:"LR", lengthFt: 10, widthFt: 12, heightFt: 8, openingsEnabled: false };
    const q1 = computeQuantitiesPure(room1, DEFAULTS);
    push("floorSqft 10x12 with 10 percent waste", q1.floorSqft === 132, `got ${q1.floorSqft}`);
    push("baseboard 44lf with 10 percent waste", q1.baseboardLf === 49, `got ${q1.baseboardLf}`);
    push("wall paint gallons", q1.wallPaintGal === 3, `got ${q1.wallPaintGal}`);
    push("ceiling paint gallons", q1.ceilingPaintGal === 1, `got ${q1.ceilingPaintGal}`);

    // Test 2: openings subtraction
    const room2: Room = { type:"Living Room", name:"LR2", lengthFt: 10, widthFt: 12, heightFt: 8, openingsEnabled: true, doors: [{ widthFt: 3, count: 1 }], windows: [{ widthFt: 3, heightFt: 4, count: 1 }] };
    const q2 = computeQuantitiesPure(room2, DEFAULTS);
    push("baseboard subtract door width", q2.baseboardLf === 46, `got ${q2.baseboardLf}`);
    push("wall area subtract window reduces paint", q2.wallPaintGal === 2, `got ${q2.wallPaintGal}`);

    // Test 3: CSV builder basic
    const csv = buildCsvString([
      { Retailer: "Lowes", SKU: "111", "Item Name": "Item A", Quantity: 1, Unit: "ea", Room: "LR", Property: "P1", Notes: "" },
      { Retailer: "Lowes", SKU: "222", "Item Name": "Item B", Quantity: 2, Unit: "ea", Room: "BR", Property: "P1", Notes: "" },
    ] as any);
    const lines = csv.split("\\n");
    push("CSV has header plus 2 rows", lines.length === 3, `got ${lines.length}`);

    // Test 4: drywall sheets suggestion is finite
    const sheets8 = drywallSheetsFor(q2.drywallArea, 8, DEFAULTS);
    push("drywall 8ft sheets finite", Number.isFinite(sheets8) && sheets8 >= 1, `got ${sheets8}`);

    // Test 5: CSV escapes quotes and commas
    const csv2 = buildCsvString([
      { Retailer: "Lowes", SKU: 'A\"1', "Item Name": 'Thing, \"quoted\"', Quantity: 1, Unit: "ea", Room: "LR", Property: "P2", Notes: "note, more" },
    ] as any);
    push("CSV escapes internal quotes", csv2.includes('\"\"quoted\"\"'));

    // Test 6: drywall without ceiling when toggle off
    const q4 = computeQuantitiesPure({ type:"Living Room", name:"X", lengthFt: 10, widthFt: 12, heightFt: 8, openingsEnabled: false }, { ...DEFAULTS, drywallIncludeCeiling: false });
    push("drywall area excludes ceiling when off", q4.drywallArea === 44 * 8, `got ${q4.drywallArea}`);

    // Test 7: roundUp step behavior
    push("roundUp steps to multiple", roundUp(10.1, 5) === 15, `got ${roundUp(10.1, 5)}`);

    // Test 8: preferred drywall length is 8 ft only by default
    const pref = DEFAULTS.drywallSheetPreference;
    const area = q1.drywallArea;
    const suggest = (len:number) => (len === pref ? drywallSheetsFor(area, len, DEFAULTS) : 0);
    push("drywall default 8ft positive", suggest(8) > 0, `got ${suggest(8)}`);
    push("drywall default 10ft zero", suggest(10) === 0, `got ${suggest(10)}`);

    setResults(res);
  };

  return (
    <div className="mt-6">
      <button className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs shadow-sm hover:bg-slate-100" onClick={run}>Run tests</button>
      {results.length > 0 && (
        <div className="mx-auto mt-2 max-w-xl overflow-hidden rounded-xl border text-left">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr><th className="p-2 text-left">Test</th><th className="p-2">Result</th><th className="p-2 text-left">Details</th></tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.pass ? "✅" : "❌"}</td>
                  <td className="p-2">{r.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
