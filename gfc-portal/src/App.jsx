import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WizardStepper from './components/WizardStepper';
import Gate1EntityType from './components/Gate1EntityType';
import Gate2DirectionTiers from './components/Gate2DirectionTiers';
import CampaignList from './components/CampaignList';
import CampaignAmount from './components/CampaignAmount';
import GeneralFundAmount from './components/GeneralFundAmount';
import ClassBuilder from './components/ClassBuilder';
import Step1EntityVerification from './components/steps/Step1EntityVerification';
import Certify from './components/Certify';
import SigningCeremony from './components/SigningCeremony';
import FundingStep from './components/FundingStep';
import Step5Confirmation, {
  CampaignConfirmation,
  GeneralFundConfirmation,
} from './components/steps/Step5Confirmation';
import AdminDashboard from './components/admin/AdminDashboard';

// ─── Wizard step label configs ────────────────────────────────────────────────
const STEPS_DIRECT = [
  { num: 1, label: 'Entity Type' },
  { num: 2, label: 'Verify EIN' },
  { num: 3, label: 'Class & Amount' },
  { num: 4, label: 'Certification' },
  { num: 5, label: 'Sign Docs' },
  { num: 6, label: 'Fund' },
  { num: 7, label: 'Confirmation' },
];
const STEPS_FUND_DESIGNATE = [
  { num: 1, label: 'Entity Type' },
  { num: 2, label: 'Direction' },
  { num: 3, label: 'Class & Amount' },
  { num: 4, label: 'Certification' },
  { num: 5, label: 'Sign Docs' },
  { num: 6, label: 'Fund' },
  { num: 7, label: 'Confirmation' },
];
const STEPS_FUND_CAMPAIGN = [
  { num: 1, label: 'Entity Type' },
  { num: 2, label: 'Direction' },
  { num: 3, label: 'Campaign' },
  { num: 4, label: 'Fund' },
  { num: 5, label: 'Confirmation' },
];
const STEPS_FUND_GENERAL = [
  { num: 1, label: 'Entity Type' },
  { num: 2, label: 'Direction' },
  { num: 3, label: 'Fund' },
  { num: 4, label: 'Confirmation' },
];

function getStepConfig(screen, rail, tier) {
  if (rail === 'fund') {
    if (tier === 'campaign') {
      const map = { gate2: 2, campaign_list: 3, campaign_amount: 3, fund: 4, confirm: 5 };
      return { steps: STEPS_FUND_CAMPAIGN, currentStep: map[screen] || 1 };
    }
    if (tier === 'general') {
      const map = { gate2: 2, general_amount: 3, fund: 3, confirm: 4 };
      return { steps: STEPS_FUND_GENERAL, currentStep: map[screen] || 1 };
    }
    // designate
    const map = { gate2: 2, classbuilder: 3, certify: 4, sign_docs: 5, fund: 6, confirm: 7 };
    return { steps: STEPS_FUND_DESIGNATE, currentStep: map[screen] || 1 };
  }
  // direct
  const map = { ein_verify: 2, classbuilder: 3, certify: 4, sign_docs: 5, fund: 6, confirm: 7 };
  return { steps: STEPS_DIRECT, currentStep: map[screen] || 1 };
}

const INITIAL_WIZARD = {
  screen: 'gate1',
  rail: null,
  tier: null,
  orgData: null,
  classData: null,
  economicsData: null,
  authData: null,
  certData: null,
  campaignData: null,
  generalAmount: null,
  signData: null,
  fundData: null,
};

export default function App() {
  const [view, setView] = useState('portal');
  const [wiz, setWiz] = useState(INITIAL_WIZARD);
  const [sessionContributions, setSessionContributions] = useState([]);

  const go = (updates) => setWiz(prev => ({ ...prev, ...updates }));
  const restart = () => setWiz(INITIAL_WIZARD);

  const addSessionContribution = (contrib) =>
    setSessionContributions(prev => [contrib, ...prev]);

  const updateContributionStatus = (id, status, extra = {}) => {
    setSessionContributions(prev =>
      prev.map(c => c.id === id ? { ...c, status, ...extra } : c)
    );
  };

  const handleSimulateWire = (id) => {
    const receivedAt = new Date().toISOString();
    updateContributionStatus(id, 'Wire Received', { wireReceivedAt: receivedAt });
    if (wiz.screen === 'confirm' && wiz.certData?.confirmationNum === id) {
      setWiz(prev => ({ ...prev, fundData: { ...prev.fundData, status: 'funds_received', receivedAt } }));
    }
  };

  const handleFastForwardDeadline = (id) => {
    updateContributionStatus(id, 'expired_unfunded');
    if (wiz.screen === 'confirm' && wiz.certData?.confirmationNum === id) {
      setWiz(prev => ({ ...prev, fundData: { ...prev.fundData, status: 'expired_unfunded' } }));
    }
  };

  const { screen, rail, tier } = wiz;
  const { steps, currentStep } = getStepConfig(screen, rail, tier);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header view={view} setView={setView} />

      {view === 'admin' ? (
        <main className="flex-1 py-6">
          <AdminDashboard
            sessionContributions={sessionContributions}
            onSimulateWire={handleSimulateWire}
            onFastForwardDeadline={handleFastForwardDeadline}
          />
        </main>
      ) : (
        <main className="flex-1">
          <WizardStepper steps={steps} currentStep={currentStep} />

          <div className="max-w-5xl mx-auto px-4 py-6">

            {screen === 'gate1' && (
              <Gate1EntityType
                onDirect={() => go({ screen: 'ein_verify', rail: 'direct' })}
                onFund={() => go({ screen: 'gate2', rail: 'fund' })}
              />
            )}

            {screen === 'gate2' && (
              <Gate2DirectionTiers
                onDesignate={() => go({ screen: 'classbuilder', tier: 'designate' })}
                onCampaign={() => go({ screen: 'campaign_list', tier: 'campaign' })}
                onGeneral={() => go({ screen: 'general_amount', tier: 'general' })}
                onBack={() => go({ screen: 'gate1', rail: null })}
              />
            )}

            {screen === 'ein_verify' && (
              <Step1EntityVerification
                onNext={(orgData) => go({ screen: 'classbuilder', orgData })}
                onBack={() => go({ screen: 'gate1', rail: null })}
                onFundRailRedirect={() => go({ screen: 'gate2', rail: 'fund', tier: null })}
              />
            )}

            {screen === 'classbuilder' && (
              <ClassBuilder
                isFundRail={rail === 'fund'}
                onNext={({ classData, economicsData, authData }) =>
                  go({ screen: 'certify', classData, economicsData, authData })
                }
                onBack={() => go(rail === 'direct' ? { screen: 'ein_verify' } : { screen: 'gate2' })}
              />
            )}

            {screen === 'certify' && (
              <Certify
                rail={wiz.rail}
                orgData={wiz.orgData}
                classData={wiz.classData}
                economicsData={wiz.economicsData}
                authData={wiz.authData}
                onNext={(certData) => go({ screen: 'sign_docs', certData })}
                onBack={() => go({ screen: 'classbuilder' })}
              />
            )}

            {screen === 'sign_docs' && (
              <SigningCeremony
                rail={wiz.rail}
                orgData={wiz.orgData}
                classData={wiz.classData}
                economicsData={wiz.economicsData}
                authData={wiz.authData}
                certData={wiz.certData}
                onNext={(signData) => go({ screen: 'fund', signData })}
                onBack={() => go({ screen: 'certify' })}
              />
            )}

            {screen === 'fund' && (
              <FundingStep
                rail={wiz.rail}
                tier={wiz.tier}
                amount={wiz.economicsData?.total ?? wiz.campaignData?.amount ?? wiz.generalAmount ?? 0}
                packet={wiz.certData?.packet}
                onNext={(fundData) => {
                  if (wiz.certData) {
                    addSessionContribution({
                      id: wiz.certData.confirmationNum,
                      rail: wiz.rail,
                      entity: wiz.rail === 'fund'
                        ? "Invest America Children's Fund"
                        : wiz.orgData?.org?.name,
                      ein: wiz.rail === 'fund' ? '88-1234567' : wiz.orgData?.org?.ein,
                      classSummary: wiz.classData?.classUnits?.join(', '),
                      beneficiaries: wiz.classData?.beneficiaryCount,
                      total: wiz.economicsData?.total,
                      perChild: wiz.economicsData?.perChild,
                      status: fundData.method === 'wire' ? 'Awaiting Wire' : 'Processing',
                      auditFlag: null,
                      timestamp: new Date().toISOString(),
                      packet: wiz.certData.packet,
                    });
                  }
                  go({ screen: 'confirm', fundData });
                }}
                onBack={() => {
                  if (wiz.signData) go({ screen: 'sign_docs' });
                  else if (wiz.campaignData) go({ screen: 'campaign_amount' });
                  else go({ screen: 'general_amount' });
                }}
              />
            )}

            {/* Designated class / direct rail confirmation */}
            {screen === 'confirm' && wiz.certData && (
              <Step5Confirmation
                rail={wiz.rail}
                orgData={wiz.orgData}
                classData={wiz.classData}
                economicsData={wiz.economicsData}
                certData={wiz.certData}
                signData={wiz.signData}
                fundData={wiz.fundData}
                onRestart={restart}
              />
            )}

            {screen === 'campaign_list' && (
              <CampaignList
                onSelect={(campaign) => go({ screen: 'campaign_amount', campaignData: { campaign } })}
                onBack={() => go({ screen: 'gate2' })}
              />
            )}

            {screen === 'campaign_amount' && wiz.campaignData?.campaign && (
              <CampaignAmount
                campaign={wiz.campaignData.campaign}
                onNext={({ campaign, amount }) =>
                  go({ screen: 'fund', campaignData: { campaign, amount } })
                }
                onBack={() => go({ screen: 'campaign_list' })}
              />
            )}

            {/* Campaign confirmation */}
            {screen === 'confirm' && wiz.campaignData?.amount != null && !wiz.certData && (
              <CampaignConfirmation campaignData={wiz.campaignData} fundData={wiz.fundData} onRestart={restart} />
            )}

            {screen === 'general_amount' && (
              <GeneralFundAmount
                onNext={({ amount }) => go({ screen: 'fund', generalAmount: amount })}
                onBack={() => go({ screen: 'gate2' })}
              />
            )}

            {/* General fund confirmation */}
            {screen === 'confirm' && wiz.generalAmount != null && !wiz.certData && !wiz.campaignData?.amount && (
              <GeneralFundConfirmation amount={wiz.generalAmount} fundData={wiz.fundData} onRestart={restart} />
            )}

          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
