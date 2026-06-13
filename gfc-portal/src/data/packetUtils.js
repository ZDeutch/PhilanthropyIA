import { INVEST_AMERICA_FUND } from './organizations';

// Generates the approval packet JSON object per the §530A spec schema.
// This is the central artifact of the demo — the machine-readable contribution
// specification that Treasury verifies without ever receiving beneficiary names.
export function generatePacket({ rail, orgData, classData, economicsData, authData, confirmationNum }) {
  const now = new Date().toISOString();
  const snapshotDate = now.split('T')[0];

  const contributor = rail === 'fund'
    ? {
        legal_name: INVEST_AMERICA_FUND.name,
        ein: INVEST_AMERICA_FUND.ein,
        teos_status: '501(c)(3) — Pub 78 listed',
        teos_verified_at: now,
      }
    : {
        legal_name: orgData.org.name,
        ein: orgData.org.ein,
        teos_status: `${orgData.org.type} — ${orgData.org.pub78 ? 'Pub 78 listed' : 'Not Pub 78 listed'}`,
        teos_verified_at: now,
      };

  const count = classData.beneficiaryCount;
  const perChild = economicsData.perChild;
  const total = economicsData.total;
  const driftBand = authData?.driftBand || [
    parseFloat((perChild * 0.85).toFixed(2)),
    parseFloat((perChild * 1.15).toFixed(2)),
  ];

  // Generate a plausible wire reference
  const wireRef = `FRB-${snapshotDate.replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;

  return {
    packet_id: confirmationNum,
    submitted_at: now,
    rail,
    contributor,
    class_spec: {
      geography: {
        type: classData.statutory ? 'statutory_class' : 'unit_union',
        units: classData.unitCodes || [],
      },
      birth_years: classData.birthYears || [],
      snapshot_count: count,
      snapshot_date: snapshotDate,
    },
    funding: {
      total: parseFloat(total.toFixed(2)),
      per_beneficiary_at_snapshot: parseFloat(perChild.toFixed(2)),
      wire_reference: wireRef,
      count_drift_authorized: authData?.driftAuthorized ?? true,
      authorized_band: driftBand,
      fallback_election: authData?.fallback || 'expand_to_county',
    },
    attestations: ['eligibility', 'class_validity', 'audit_consent'],
    prevalidation: {
      floor_check: count >= 5000 || classData.statutory
        ? `PASS (${count.toLocaleString()} >= 5,000)`
        : `FAIL (${count.toLocaleString()} < 5,000)`,
      minimum_check: perChild >= 25
        ? `PASS ($${perChild.toFixed(2)} >= $25.00)`
        : `FAIL ($${perChild.toFixed(2)} < $25.00)`,
      ofac_screen: 'PASS',
    },
    batch_members: [],
  };
}
