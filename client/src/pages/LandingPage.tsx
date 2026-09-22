import { Link } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { 
  ArrowRight, Shield, Leaf, Truck, AlertTriangle, 
  Map, BarChart2, CheckCircle2, User, Building2, List 
} from 'lucide-react';

export function LandingPage() {
  return (
    <PublicLayout>
      {/* 2. Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-text leading-tight mb-6">
              Connecting communities to <span className="text-primary">cleaner cities.</span>
            </h1>
            <p className="text-lg text-text-muted mb-8 max-w-lg">
              A comprehensive civic waste intelligence and municipal operations platform designed to streamline waste collection and public issue resolution.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-dark transition-colors">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#how-it-works" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  window.history.replaceState(null, '', '#how-it-works');
                }}
                className="flex items-center gap-2 bg-background border border-border text-charcoal px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Learn How It Works
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
              <div className="text-3xl font-bold text-primary mb-2">247</div>
              <div className="text-sm text-text-muted font-medium">Issues Resolved This Month</div>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
              <div className="text-3xl font-bold text-primary mb-2">89%</div>
              <div className="text-sm text-text-muted font-medium">Resolution Rate</div>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
              <div className="text-3xl font-bold text-primary mb-2">5</div>
              <div className="text-sm text-text-muted font-medium">Service Areas</div>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
              <div className="text-3xl font-bold text-primary mb-2">12</div>
              <div className="text-sm text-text-muted font-medium">Active Collectors</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section id="how-it-works" className="py-16 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">How It Works</h2>
            <p className="text-text-muted max-w-2xl mx-auto">Two distinct workflows designed to keep your city clean and responsive.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-background rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Private Pickup</h3>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium mb-1">Request</h4>
                    <p className="text-sm text-text-muted">Citizens schedule a pickup for recyclable or hazardous waste.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium mb-1">Assign</h4>
                    <p className="text-sm text-text-muted">Independent collectors accept the job based on route availability.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium mb-1">Collect</h4>
                    <p className="text-sm text-text-muted">Waste is collected and tracked through to proper disposal.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-2xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-status-warningBg text-status-warning rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">Public Issue Reporting</h3>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-status-warning text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium mb-1">Report</h4>
                    <p className="text-sm text-text-muted">Citizens photograph and report illegal dumping or overflowing bins.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-status-warning text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium mb-1">Triage</h4>
                    <p className="text-sm text-text-muted">Authorities verify the issue and dispatch municipal teams.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-status-warning text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium mb-1">Resolve</h4>
                    <p className="text-sm text-text-muted">Issue is resolved, reporters notified, and hotspot data updated.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. For Citizens */}
      <section id="citizens" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-primary font-semibold mb-2">
            <User className="w-5 h-5" /> For Citizens
          </div>
          <h2 className="text-3xl font-bold text-text">Empower your community</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-surface border border-border rounded-xl">
            <Truck className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Request Pickup</h3>
            <p className="text-sm text-text-muted">Schedule specialized waste collection directly from your home.</p>
          </div>
          <div className="p-6 bg-surface border border-border rounded-xl">
            <AlertTriangle className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Report Issues</h3>
            <p className="text-sm text-text-muted">Alert authorities to public waste problems in your neighborhood.</p>
          </div>
          <div className="p-6 bg-surface border border-border rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Track Resolution</h3>
            <p className="text-sm text-text-muted">Get real-time updates when your reports are addressed.</p>
          </div>
          <div className="p-6 bg-surface border border-border rounded-xl">
            <Leaf className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Impact</h3>
            <p className="text-sm text-text-muted">See your personal contribution to a cleaner environment.</p>
          </div>
        </div>
      </section>

      {/* 5. For Collectors */}
      <section className="py-16 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <Truck className="w-5 h-5" /> For Collectors
            </div>
            <h2 className="text-3xl font-bold text-text">Streamline your routes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
              <Map className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">View Pickups</h3>
              <p className="text-sm text-text-muted">Browse available collection requests in your service area.</p>
            </div>
            <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
              <Truck className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Manage Route</h3>
              <p className="text-sm text-text-muted">Accept jobs that fit your schedule and capacity.</p>
            </div>
            <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Record Stats</h3>
              <p className="text-sm text-text-muted">Log weights and categories of waste collected.</p>
            </div>
            <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
              <BarChart2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Performance</h3>
              <p className="text-sm text-text-muted">Track your earnings and environmental impact over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. For Authorities */}
      <section id="authorities" className="py-16 bg-[#F5F5F3] px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <Building2 className="w-5 h-5" /> For Municipal Authorities
            </div>
            <h2 className="text-3xl font-bold text-text">Data-driven operations</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-surface border border-border rounded-xl shadow-sm">
              <List className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Triage Reports</h3>
              <p className="text-sm text-text-muted">Review, merge, and verify citizen-reported issues.</p>
            </div>
            <div className="p-6 bg-surface border border-border rounded-xl shadow-sm">
              <User className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Assign Teams</h3>
              <p className="text-sm text-text-muted">Dispatch municipal workers to critical problem areas.</p>
            </div>
            <div className="p-6 bg-surface border border-border rounded-xl shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Track Resolution</h3>
              <p className="text-sm text-text-muted">Monitor SLAs and resolution timelines across the city.</p>
            </div>
            <div className="p-6 bg-surface border border-border rounded-xl shadow-sm">
              <Map className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Monitor Hotspots</h3>
              <p className="text-sm text-text-muted">Identify recurring problem zones for targeted intervention.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Public Issue Reporting */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-text mb-4">Comprehensive Issue Tracking</h2>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">Citizens can report a wide variety of public waste problems, helping authorities maintain clean neighborhoods.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-gray-100 text-charcoal rounded-full text-sm font-medium border border-gray-200">Illegal Dumping</span>
            <span className="px-4 py-2 bg-gray-100 text-charcoal rounded-full text-sm font-medium border border-gray-200">Overflowing Bins</span>
            <span className="px-4 py-2 bg-gray-100 text-charcoal rounded-full text-sm font-medium border border-gray-200">Damaged Infrastructure</span>
            <span className="px-4 py-2 bg-gray-100 text-charcoal rounded-full text-sm font-medium border border-gray-200">Dead Animals</span>
            <span className="px-4 py-2 bg-gray-100 text-charcoal rounded-full text-sm font-medium border border-gray-200">Street Sweeping Required</span>
          </div>
        </div>
      </section>

      {/* 9. Area Intelligence */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text mb-4">Area Intelligence</h2>
              <p className="text-text-muted mb-6">
                WasteConnect calculates a dynamic Hotspot Score for every service area based on report frequency, severity, and resolution times. This helps authorities proactively deploy resources.
              </p>
              <p className="text-xs text-text-muted mb-8 italic">This is a project-defined scoring metric.</p>
            </div>
            <div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-right text-gray-500">LOW</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-1/5 h-full bg-status-success"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-right text-gray-500">MODERATE</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-status-info"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-right text-gray-500">ELEVATED</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-status-warning"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-right text-gray-500">HIGH</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-orange-500"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-right text-gray-500">CRITICAL</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-status-error"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Platform Security */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-text mb-4">Enterprise-Grade Security</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <h3 className="font-semibold mb-2">JWT Authentication</h3>
            <p className="text-sm text-text-muted">Secure, stateless sessions for all platform users.</p>
          </div>
          <div className="text-center p-4">
            <h3 className="font-semibold mb-2">Role-Based Access</h3>
            <p className="text-sm text-text-muted">Strict separation between citizens, collectors, and authorities.</p>
          </div>
          <div className="text-center p-4">
            <h3 className="font-semibold mb-2">Server Validation</h3>
            <p className="text-sm text-text-muted">Comprehensive backend authorization on every request.</p>
          </div>
          <div className="text-center p-4">
            <h3 className="font-semibold mb-2">Encrypted Data</h3>
            <p className="text-sm text-text-muted">Industry-standard encryption for sensitive user information.</p>
          </div>
        </div>
      </section>

      {/* 11. Call to Action */}
      <section className="py-20 bg-primary px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to connect your community?</h2>
        <p className="text-primary-muted max-w-2xl mx-auto mb-8 text-lg">Join WasteConnect today to streamline operations and create a cleaner environment.</p>
        <Link to="/register" className="inline-block bg-white text-primary px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors">
          Get Started Now
        </Link>
      </section>
    </PublicLayout>
  );
}
