import type { AdminField } from './admin-sections';
export type TractorSpecField = {
  key: string; label: string; type: 'text' | 'number' | 'textarea' | 'lines' | 'select';
  readKey?: string; unit?: string; min?: number; integer?: boolean; help?: string;
  options?: { value: string; label: string }[];
};
const number = (key: string, label: string, unit?: string, integer = false, min = 0.001): TractorSpecField => ({ key, label, type: 'number', unit, integer, min });
const text = (key: string, label: string, help?: string): TractorSpecField => ({ key, label, type: 'text', help });
export const tractorSpecGroups: { key: string; title: string; description: string; fields: TractorSpecField[] }[] = [
  { key: 'engine', title: 'Engine & power', description: 'Use the exact variant’s published figures. Leave unavailable values empty.', fields: [
    { ...number('horsepower', 'Engine power', 'HP'), readKey: 'hp', help: 'Exact rated HP, if supplied. Use power category below when only a range is published.' },
    text('powerCategory', 'Power category', 'Optional manufacturer range, including units, e.g. 46–50 HP.'),
    number('engineCapacityCc', 'Engine displacement', 'cc'), number('cylinders', 'Cylinders', undefined, true, 1),
    number('ratedRpm', 'Rated engine speed', 'rpm', true, 1), number('torqueNm', 'Maximum torque', 'Nm'),
    text('fuelType', 'Fuel type'), text('coolingSystem', 'Cooling system'), text('airFilter', 'Air filter'),
  ] },
  { key: 'transmission', title: 'Transmission, steering & brakes', description: 'Record the selected variant, not several incompatible options.', fields: [
    text('transmission', 'Transmission type', 'For example: Sliding Mesh, Partial Constant Mesh, Synchromesh or HST.'),
    text('clutchType', 'Clutch type'), number('forwardGears', 'Forward gears', undefined, true, 0), number('reverseGears', 'Reverse gears', undefined, true, 0),
    { key: 'driveType', label: 'Drive type', type: 'select', options: ['2WD', '4WD'].map(value => ({ value, label: value })) },
    text('steeringType', 'Steering type'), text('brakeType', 'Brake type'), number('maxForwardSpeedKmph', 'Maximum forward speed', 'km/h'),
  ] },
  { key: 'pto', title: 'PTO & hydraulics', description: 'Keep engine HP and PTO HP separate. Note optional equipment in the feature list.', fields: [
    number('ptoHp', 'PTO power', 'HP'), text('ptoType', 'PTO type'), text('ptoSpeeds', 'PTO speeds', 'Include rated speeds and options exactly as specified, e.g. 540 / 540E rpm.'),
    number('liftingCapacityKg', 'Hydraulic lifting capacity', 'kg'), text('hydraulicControls', 'Hydraulic controls'),
    number('hydraulicPumpFlowLpm', 'Hydraulic pump flow', 'L/min'), text('linkageCategory', 'Three-point linkage category'),
  ] },
  { key: 'dimensions', title: 'Tyres, dimensions & capacities', description: 'Use consistent units and tyre notation from the manufacturer.', fields: [
    text('frontTyres', 'Front tyre size'), text('rearTyres', 'Rear tyre size'), number('fuelTankLitres', 'Fuel tank capacity', 'L'),
    number('weightKg', 'Tractor weight', 'kg'), number('wheelbaseMm', 'Wheelbase', 'mm'), number('groundClearanceMm', 'Ground clearance', 'mm'),
    number('lengthMm', 'Overall length', 'mm'), number('widthMm', 'Overall width', 'mm'), number('heightMm', 'Overall height', 'mm'), text('battery', 'Battery / electrical system'),
  ] },
  { key: 'features', title: 'Features, implements & ownership', description: 'Separate standard and optional features. Warranty terms can vary by component.', fields: [
    { key: 'features', label: 'Key features', type: 'lines', help: 'One feature per line. Include safety/comfort equipment only when verified; mark optional features clearly.' },
    { key: 'compatibleImplements', label: 'Compatible implements', type: 'lines', help: 'One implement per line. Enter only manufacturer-confirmed compatibility.' },
    text('warranty', 'Warranty terms', 'Include the term, operating-hour limit and exclusions where available.'), number('serviceIntervalHours', 'Service interval', 'hours'),
    { key: 'specificationNotes', label: 'Specification / variant notes', type: 'textarea', help: 'Record measurement conditions, variants or optional equipment. Do not enter an unsupported mileage claim.' },
    text('specificationSourceUrl', 'Manufacturer specification URL', 'Optional link to the official model page or brochure used to verify these figures.'),
  ] },
];
export const tractorSpecFields = tractorSpecGroups.flatMap(group => group.fields);
export const tractorBaseFields: AdminField[] = [
  { key: 'brandId', label: 'Brand', type: 'select', source: 'brands', required: true }, { key: 'model', label: 'Model', required: true },
  { key: 'variant', label: 'Variant / trim (optional)' }, { key: 'condition', label: 'Condition', type: 'select', options: ['new', 'used'].map(value => ({ value, label: value === 'new' ? 'New' : 'Used' })) },
  { key: 'price', label: 'Starting price (₹)', type: 'number' }, { key: 'maxPrice', label: 'Maximum price (₹)', type: 'number' },
  { key: 'popular', label: 'Show in Popular tractors', type: 'boolean' },
  { key: 'upcoming', label: 'Upcoming model (not yet available)', type: 'boolean' },
  { key: 'inDemand', label: 'Show In demand badge', type: 'boolean' },
  { key: 'image', label: 'Tractor image', type: 'image' }, { key: 'description', label: 'Overview', type: 'textarea' },
];
export const tractorAdminFields: AdminField[] = [...tractorBaseFields, ...tractorSpecFields.map(field => ({ ...field, label: field.label + (field.unit ? ' (' + field.unit + ')' : '') }))];
export const tractorSpecificationSources = [
  { title: 'Mahindra tractor specifications', url: 'https://www.mahindratractor.com/tractors/mahindra-575-di-xp-plus' },
  { title: 'John Deere tractor specifications', url: 'https://www.deere.co.in/en/tractors/e-series-tractors/5310e-tractor/' },
  { title: 'Swaraj tractor specifications', url: 'https://www.swarajtractors.com/swaraj-744-fe-tractor' },
];
