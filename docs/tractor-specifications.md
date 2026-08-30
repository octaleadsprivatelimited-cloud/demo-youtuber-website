# Tractor specifications and comparison

## Admin workflow

Open **Admin → Tractors → New record / Edit**. Select the actual brand and model. If multiple variants are listed, enter a variant label; new records receive a variant-specific slug. Existing URLs are preserved when editing.

The grouped specification fields are optional. Record only figures verified for that model and variant. Use exact engine HP when known; otherwise leave it empty and use the manufacturer’s power category text. Missing values display as “Not provided”, not zero or “No”. Engine HP and PTO HP are separate fields.

For upload, download the CSV template inside the tractor editor. Keep its `field,value` header, fill the value column, select the CSV, review the preview and select **Apply to form**. Finally select **Save tractor**. Uploading or previewing alone does not save anything. Blank CSV values leave existing fields unchanged. To clear a value, clear it in the form and save. Files must be under 64 KB. Values containing commas or line breaks must be quoted; features and compatible implements use one entry per line inside the quoted CSV cell.

Numbers are entered without units or thousands separators. Units are shown in labels: HP, cc, rpm, Nm, kg, L, mm, km/h and L/min. Gear and cylinder counts require whole numbers. Tyre sizes, PTO speed options, transmission names and warranty terms remain text to preserve the manufacturer’s notation. Optional equipment should be explicitly labelled. Do not enter unsupported mileage, compatibility, safety, or warranty claims.

## Public display

Saved fields populate both the model’s grouped Specifications section and `/compare`. Comparison selects up to three distinct published models, updates when the catalog changes, preserves slots in its URL, and supports sharing and a differences-only filter. Unknown values are not treated as known differences. Deleted/unpublished selections are shown as unavailable. No winning model is inferred from larger numbers.

## Research references

Field categories were reviewed on 28 August 2026 against official manufacturer pages:

- [Mahindra 575 DI XP Plus](https://www.mahindratractor.com/tractors/mahindra-575-di-xp-plus): engine, torque, cylinders, rated RPM, drive, steering, clutch, gears, braking, tyre sizing, lift capacity, PTO and service interval.
- [John Deere 5310 PowerTech](https://www.deere.co.in/en/tractors/e-series-tractors/5310e-tractor/): cooling, filtration, transmission variants, PTO, hydraulic lift, fuel capacity, electrical system, weights and dimensions.
- [Swaraj 744 FE](https://www.swarajtractors.com/swaraj-744-fe-tractor): power category, engine displacement, gearing options, brakes, tyres, electrical equipment and dimensions.

These references inform the field checklist only. No manufacturer values or sample tractors were inserted into the live catalog. Values can vary between model generations, drive configurations and optional packages; use the exact variant’s source URL in each record.

## Editing saved records

Only Brand and Model are required for a tractor. All specifications, prices and images can be left blank, filled later or removed. Open Admin → Tractors → Edit to load the latest saved values. Existing lists, image previews and model variants are retained. Use Save changes to update the same record. The model slug remains stable when its name changes.

This edit workflow is shared by the content, homepage, promotions, SEO, settings, contact inbox and archived subscriber modules. Display order can be left blank for automatic placement; clearing it on an existing record keeps its current position. Lead CRM also supports correcting contact details and clearing optional details while preserving notes and source. New inbox/subscriber entries still originate from website submissions. Analytics is a report; account access changes remain protected by the existing authentication permissions.

The editor submits changed fields only. If another admin saves the record while your form is open, the save is rejected with instructions to reopen the latest record, rather than silently overwriting their changes. Editing has no time limit.
