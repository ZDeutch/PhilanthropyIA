// Geographic unit seed data — beneficiary counts are enrolled Trump Account holders
// All counts are simulated. Base layer is ZIP codes; counties/districts computed from union.

export const STATES = [
  { id: 'state-CA', type: 'state', code: 'FIPS:06',  name: 'California',     abbr: 'CA', beneficiaries: 2100000 },
  { id: 'state-TX', type: 'state', code: 'FIPS:48',  name: 'Texas',          abbr: 'TX', beneficiaries: 1840000 },
  { id: 'state-NY', type: 'state', code: 'FIPS:36',  name: 'New York',       abbr: 'NY', beneficiaries: 1230000 },
  { id: 'state-FL', type: 'state', code: 'FIPS:12',  name: 'Florida',        abbr: 'FL', beneficiaries: 1150000 },
  { id: 'state-VA', type: 'state', code: 'FIPS:51',  name: 'Virginia',       abbr: 'VA', beneficiaries:  520000 },
  { id: 'state-IL', type: 'state', code: 'FIPS:17',  name: 'Illinois',       abbr: 'IL', beneficiaries:  740000 },
  { id: 'state-WA', type: 'state', code: 'FIPS:53',  name: 'Washington',     abbr: 'WA', beneficiaries:  430000 },
  { id: 'state-MA', type: 'state', code: 'FIPS:25',  name: 'Massachusetts',  abbr: 'MA', beneficiaries:  380000 },
];

export const ZIPS = [
  // San Mateo County
  { id: 'zip-94025', type: 'zip', code: 'ZCTA:94025', name: '94025 — Menlo Park, CA',                  zip: '94025', county: 'county-san-mateo',      district: 'dist-palo-alto-usd',            beneficiaries: 1840 },
  { id: 'zip-94027', type: 'zip', code: 'ZCTA:94027', name: '94027 — Atherton, CA',                    zip: '94027', county: 'county-san-mateo',      district: 'dist-sequoia-uhsd',             beneficiaries:  720 },
  { id: 'zip-94061', type: 'zip', code: 'ZCTA:94061', name: '94061 — Redwood City, CA',                zip: '94061', county: 'county-san-mateo',      district: 'dist-redwood-city-sd',          beneficiaries: 2340 },
  { id: 'zip-94062', type: 'zip', code: 'ZCTA:94062', name: '94062 — Redwood City / Woodside, CA',     zip: '94062', county: 'county-san-mateo',      district: 'dist-sequoia-uhsd',             beneficiaries: 1120 },
  { id: 'zip-94063', type: 'zip', code: 'ZCTA:94063', name: '94063 — Redwood City (East), CA',         zip: '94063', county: 'county-san-mateo',      district: 'dist-redwood-city-sd',          beneficiaries: 3210 },
  { id: 'zip-94065', type: 'zip', code: 'ZCTA:94065', name: '94065 — Redwood Shores, CA',              zip: '94065', county: 'county-san-mateo',      district: 'dist-sequoia-uhsd',             beneficiaries:  980 },
  { id: 'zip-94301', type: 'zip', code: 'ZCTA:94301', name: '94301 — Palo Alto (North), CA',           zip: '94301', county: 'county-santa-clara',    district: 'dist-palo-alto-usd',            beneficiaries: 1650 },
  { id: 'zip-94303', type: 'zip', code: 'ZCTA:94303', name: '94303 — Palo Alto / East Palo Alto, CA',  zip: '94303', county: 'county-santa-clara',    district: 'dist-ravenswood-sd',            beneficiaries: 4200 },
  { id: 'zip-94306', type: 'zip', code: 'ZCTA:94306', name: '94306 — Palo Alto (South), CA',           zip: '94306', county: 'county-santa-clara',    district: 'dist-palo-alto-usd',            beneficiaries: 1490 },
  { id: 'zip-94401', type: 'zip', code: 'ZCTA:94401', name: '94401 — San Mateo, CA',                   zip: '94401', county: 'county-san-mateo',      district: 'dist-san-mateo-foster-city-sd', beneficiaries: 2810 },
  { id: 'zip-94403', type: 'zip', code: 'ZCTA:94403', name: '94403 — San Mateo (South), CA',           zip: '94403', county: 'county-san-mateo',      district: 'dist-san-mateo-foster-city-sd', beneficiaries: 2190 },
  { id: 'zip-94404', type: 'zip', code: 'ZCTA:94404', name: '94404 — Foster City, CA',                 zip: '94404', county: 'county-san-mateo',      district: 'dist-san-mateo-foster-city-sd', beneficiaries: 1730 },
  // Santa Clara County
  { id: 'zip-95126', type: 'zip', code: 'ZCTA:95126', name: '95126 — San Jose (West), CA',             zip: '95126', county: 'county-santa-clara',    district: 'dist-santa-clara-usd',          beneficiaries: 3100 },
  { id: 'zip-95128', type: 'zip', code: 'ZCTA:95128', name: '95128 — San Jose (Campbell), CA',         zip: '95128', county: 'county-santa-clara',    district: 'dist-santa-clara-usd',          beneficiaries: 2870 },
  { id: 'zip-95131', type: 'zip', code: 'ZCTA:95131', name: '95131 — San Jose (Berryessa), CA',        zip: '95131', county: 'county-santa-clara',    district: 'dist-santa-clara-usd',          beneficiaries: 3450 },
  // Alameda County
  { id: 'zip-94601', type: 'zip', code: 'ZCTA:94601', name: '94601 — Oakland (Fruitvale), CA',         zip: '94601', county: 'county-alameda',        district: 'dist-oakland-usd',              beneficiaries: 3800 },
  { id: 'zip-94605', type: 'zip', code: 'ZCTA:94605', name: '94605 — Oakland (East), CA',              zip: '94605', county: 'county-alameda',        district: 'dist-oakland-usd',              beneficiaries: 4100 },
  { id: 'zip-94621', type: 'zip', code: 'ZCTA:94621', name: '94621 — Oakland (Coliseum), CA',          zip: '94621', county: 'county-alameda',        district: 'dist-oakland-usd',              beneficiaries: 3620 },
  { id: 'zip-94703', type: 'zip', code: 'ZCTA:94703', name: '94703 — Berkeley, CA',                    zip: '94703', county: 'county-alameda',        district: 'dist-berkeley-usd',             beneficiaries: 2240 },
  // San Francisco
  { id: 'zip-94102', type: 'zip', code: 'ZCTA:94102', name: '94102 — San Francisco (Civic Center), CA', zip: '94102', county: 'county-sf',           district: 'dist-sf-usd',                   beneficiaries: 2980 },
  { id: 'zip-94110', type: 'zip', code: 'ZCTA:94110', name: '94110 — San Francisco (Mission), CA',     zip: '94110', county: 'county-sf',            district: 'dist-sf-usd',                   beneficiaries: 3560 },
  { id: 'zip-94124', type: 'zip', code: 'ZCTA:94124', name: '94124 — San Francisco (Bayview), CA',     zip: '94124', county: 'county-sf',            district: 'dist-sf-usd',                   beneficiaries: 3090 },
  // Virginia
  { id: 'zip-22031', type: 'zip', code: 'ZCTA:22031', name: '22031 — Fairfax, VA',                     zip: '22031', county: 'county-fairfax',       district: 'dist-fairfax-county-ps',        beneficiaries: 2650 },
  { id: 'zip-22039', type: 'zip', code: 'ZCTA:22039', name: '22039 — Burke, VA',                       zip: '22039', county: 'county-fairfax',       district: 'dist-fairfax-county-ps',        beneficiaries: 2190 },
  { id: 'zip-22046', type: 'zip', code: 'ZCTA:22046', name: '22046 — Falls Church, VA',                zip: '22046', county: 'county-fairfax',       district: 'dist-fairfax-county-ps',        beneficiaries: 1870 },
];

export const COUNTIES = [
  { id: 'county-san-mateo',   type: 'county', code: 'FIPS:06081', name: 'San Mateo County, CA',                   state: 'CA', beneficiaries: 0 },
  { id: 'county-santa-clara', type: 'county', code: 'FIPS:06085', name: 'Santa Clara County, CA',                 state: 'CA', beneficiaries: 0 },
  { id: 'county-alameda',     type: 'county', code: 'FIPS:06001', name: 'Alameda County, CA',                     state: 'CA', beneficiaries: 0 },
  { id: 'county-sf',          type: 'county', code: 'FIPS:06075', name: 'City and County of San Francisco, CA',   state: 'CA', beneficiaries: 0 },
  { id: 'county-fairfax',     type: 'county', code: 'FIPS:51059', name: 'Fairfax County, VA',                     state: 'VA', beneficiaries: 0 },
  { id: 'county-arlington',   type: 'county', code: 'FIPS:51013', name: 'Arlington County, VA',                   state: 'VA', beneficiaries: 3820 },
  { id: 'county-los-angeles', type: 'county', code: 'FIPS:06037', name: 'Los Angeles County, CA',                 state: 'CA', beneficiaries: 284000 },
  { id: 'county-king',        type: 'county', code: 'FIPS:53033', name: 'King County, WA',                        state: 'WA', beneficiaries: 68200 },
];

export const DISTRICTS = [
  { id: 'dist-sequoia-uhsd',         type: 'district', code: 'NCES_LEA:0634080', name: 'Sequoia Union High School District',        state: 'CA', beneficiaries: 0 },
  { id: 'dist-redwood-city-sd',      type: 'district', code: 'NCES_LEA:0634320', name: 'Redwood City School District',               state: 'CA', beneficiaries: 0 },
  { id: 'dist-palo-alto-usd',        type: 'district', code: 'NCES_LEA:0630900', name: 'Palo Alto Unified School District',          state: 'CA', beneficiaries: 0 },
  { id: 'dist-ravenswood-sd',        type: 'district', code: 'NCES_LEA:0633570', name: 'Ravenswood City School District',            state: 'CA', beneficiaries: 0 },
  { id: 'dist-san-mateo-foster-city-sd', type: 'district', code: 'NCES_LEA:0635280', name: 'San Mateo–Foster City School District',  state: 'CA', beneficiaries: 0 },
  { id: 'dist-santa-clara-usd',      type: 'district', code: 'NCES_LEA:0636630', name: 'Santa Clara Unified School District',       state: 'CA', beneficiaries: 0 },
  { id: 'dist-oakland-usd',          type: 'district', code: 'NCES_LEA:0628050', name: 'Oakland Unified School District',           state: 'CA', beneficiaries: 0 },
  { id: 'dist-berkeley-usd',         type: 'district', code: 'NCES_LEA:0607680', name: 'Berkeley Unified School District',          state: 'CA', beneficiaries: 0 },
  { id: 'dist-sf-usd',               type: 'district', code: 'NCES_LEA:0638190', name: 'San Francisco Unified School District',     state: 'CA', beneficiaries: 0 },
  { id: 'dist-fairfax-county-ps',    type: 'district', code: 'NCES_LEA:5101920', name: 'Fairfax County Public Schools',             state: 'VA', beneficiaries: 0 },
  { id: 'dist-los-angeles-usd',      type: 'district', code: 'NCES_LEA:0622710', name: 'Los Angeles Unified School District',       state: 'CA', beneficiaries: 42000 },
  { id: 'dist-nyc-ps',               type: 'district', code: 'NCES_LEA:3620580', name: 'New York City Public Schools',              state: 'NY', beneficiaries: 180000 },
];

export const BIRTH_YEARS = Array.from({ length: 19 }, (_, i) => 2008 + i);

function computeFromZips() {
  const countyMap = {};
  const districtMap = {};
  ZIPS.forEach(z => {
    countyMap[z.county] = (countyMap[z.county] || 0) + z.beneficiaries;
    districtMap[z.district] = (districtMap[z.district] || 0) + z.beneficiaries;
  });
  COUNTIES.forEach(c => { if (c.beneficiaries === 0 && countyMap[c.id]) c.beneficiaries = countyMap[c.id]; });
  DISTRICTS.forEach(d => { if (d.beneficiaries === 0 && districtMap[d.id]) d.beneficiaries = districtMap[d.id]; });
}
computeFromZips();

// Returns { total, statutory, unitCodes }
export function computeUnionBeneficiaries(selectedIds, birthYearFilter) {
  const selectedSet = new Set(selectedIds);
  const coveredZipIds = new Set();
  const unitCodes = new Set();
  const COHORT_YEARS = 19; // 2008–2026

  const applyBirthYear = (n) =>
    birthYearFilter && birthYearFilter.length > 0
      ? Math.round(n * (birthYearFilter.length / COHORT_YEARS))
      : n;

  const selectedStates = STATES.filter(s => selectedSet.has(s.id));
  if (selectedStates.length > 0 || selectedSet.has('all')) {
    let total = 0;
    selectedStates.forEach(s => { total += s.beneficiaries; unitCodes.add(s.code); });
    if (selectedSet.has('all')) STATES.forEach(s => unitCodes.add(s.code));
    return { total: applyBirthYear(total), statutory: true, unitCodes: [...unitCodes] };
  }

  // For counties/districts that have no ZIP-level breakdown in the seed data,
  // accumulate their stored beneficiary count directly.
  let directTotal = 0;

  const selectedCounties = COUNTIES.filter(c => selectedSet.has(c.id));
  selectedCounties.forEach(county => {
    unitCodes.add(county.code);
    const countyZips = ZIPS.filter(z => z.county === county.id);
    if (countyZips.length > 0) {
      countyZips.forEach(z => coveredZipIds.add(z.id));
    } else {
      directTotal += county.beneficiaries;
    }
  });

  const selectedDistricts = DISTRICTS.filter(d => selectedSet.has(d.id));
  selectedDistricts.forEach(district => {
    unitCodes.add(district.code);
    const districtZips = ZIPS.filter(z => z.district === district.id);
    if (districtZips.length > 0) {
      districtZips.forEach(z => coveredZipIds.add(z.id));
    } else {
      directTotal += district.beneficiaries;
    }
  });

  ZIPS.filter(z => selectedSet.has(z.id)).forEach(z => {
    coveredZipIds.add(z.id);
    const parentCountySelected = selectedCounties.some(c => c.id === z.county);
    const parentDistrictSelected = selectedDistricts.some(d => d.id === z.district);
    if (!parentCountySelected && !parentDistrictSelected) unitCodes.add(z.code);
  });

  let total = directTotal;
  coveredZipIds.forEach(zipId => {
    const zip = ZIPS.find(z => z.id === zipId);
    if (zip) total += zip.beneficiaries;
  });

  return { total: applyBirthYear(total), statutory: false, unitCodes: [...unitCodes] };
}

export function suggestAdditions(selectedIds, currentTotal) {
  const gap = 5000 - currentTotal;
  if (gap <= 0) return [];
  const selectedSet = new Set(selectedIds);
  return [
    ...ZIPS.filter(z => !selectedSet.has(z.id)),
    ...COUNTIES.filter(c => !selectedSet.has(c.id) && c.beneficiaries > 0),
    ...DISTRICTS.filter(d => !selectedSet.has(d.id) && d.beneficiaries > 0),
  ]
    .filter(u => u.beneficiaries > 0 && u.beneficiaries <= gap * 2)
    .sort((a, b) => Math.abs(a.beneficiaries - gap) - Math.abs(b.beneficiaries - gap))
    .slice(0, 3);
}

export { ZIPS as ZIP_CODES };
