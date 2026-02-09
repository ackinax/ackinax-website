import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-[800px] mx-auto px-6 md:px-10 pt-28 pb-20">
        <h1 className="font-mono-brand text-2xl md:text-3xl font-bold mb-2">ACKINAX – PRIVACY NOTICE</h1>
        <p className="text-dim text-sm mb-10">Date: 27 May 2025</p>

        <div className="space-y-8 text-muted-foreground text-[15px] leading-relaxed font-body">

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">1. INTRODUCTION</h2>
            <p>The security and protection of your personal data is a priority of SYKS sàrl (Swiss ID CHE-274.038.278), with its registered address at Esplanade de Pont-Rouge 9A, 1212 Grand-Lancy, Switzerland (hereinafter "SYKS", "AckiNax", "we", "us", or "our"). SYKS operates the AckiNax platform (the "Platform").</p>
            <p className="mt-3">This Privacy Notice explains how we collect, use, share and protect your personal data when you visit our website, create an account or delegate maintenance and operation of blockchain nodes through the Platform (collectively, the "Services"). It should be read together with our Terms of Service.</p>
            <p className="mt-3">We comply with the Swiss Federal Act on Data Protection ("FADP") and, where applicable, the EU General Data Protection Regulation ("GDPR").</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">2. DEFINITIONS</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">"Delegation Services"</strong> – Maintenance, operation and monitoring of blockchain validator or other nodes delegated to SYKS via the Platform.</li>
              <li><strong className="text-foreground">"Data Controller"</strong> – SYKS sàrl.</li>
              <li><strong className="text-foreground">"Third-Party Payment Provider"</strong> – The external payment processor that accepts cryptocurrency payments for the Services.</li>
            </ul>
            <p className="mt-3">Other capitalised terms have the meanings given in the Terms of Service.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">3. SCOPE</h2>
            <p>This Privacy Notice applies to all personal data we process in connection with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your visit to any AckiNax website (the "Website");</li>
              <li>Your creation and use of an AckiNax account;</li>
              <li>Your use of the Delegation Services.</li>
            </ul>
            <p className="mt-3">We do not sell node licences. Any references to the purchase or sale of node licences have been removed from this Notice.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">4. ACCEPTANCE</h2>
            <p>By accessing the Website or using the Services you acknowledge that you have read and understood this Privacy Notice. IF YOU DO NOT ACCEPT IT, PLEASE STOP USING THE PLATFORM IMMEDIATELY.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">5. PROCESSING PRINCIPLES</h2>
            <p>We process personal data lawfully, fairly and transparently; limit processing to specified purposes; minimise the data collected; keep data accurate and up-to-date; store it only as long as necessary; and protect it with appropriate technical and organisational measures.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">6. PERSONAL DATA WE COLLECT</h2>

            <h3 className="font-mono-brand text-base text-foreground mb-2">6.1 Website Usage ("Cookies Data")</h3>
            <p>We may collect standard web analytics data such as IP address, browser type, pages visited and timestamps.</p>

            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.2 Contacting Us</h3>
            <p>If you email or otherwise contact us we collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your name, email address and any other information you choose to provide.</li>
            </ul>

            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.3 Account Registration &amp; Wallet Data</h3>
            <p>To create an AckiNax account you provide an email address and password. We collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>First and last name;</li>
              <li>Email address;</li>
              <li>Profile picture (if you use Google sign-in);</li>
              <li>Preferred language.</li>
            </ul>
            <p className="mt-3">When you link an EVM-compatible wallet we collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Public wallet address;</li>
              <li>On-chain transaction history relating to Delegation Services;</li>
              <li>Technical connection data.</li>
            </ul>

            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.4 Service Usage ("Platform Data")</h3>
            <p>When you delegate nodes we collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Delegated Node identifiers and performance metrics;</li>
              <li>Service configuration choices;</li>
              <li>Support tickets and chat transcripts;</li>
              <li>Logs of your interactions with the Platform dashboard.</li>
            </ul>

            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.5 Payment Data</h3>
            <p>All service fees are settled in cryptocurrency via the Third-Party Payment Provider. We never see or store your private keys. We receive only:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your public wallet address;</li>
              <li>Transaction hash, amount and status.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">7. LEGAL BASES FOR PROCESSING</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Contract</strong> – Processing Registration, Wallet, Platform and Payment Data to provide the Services.</li>
              <li><strong className="text-foreground">Legitimate Interests</strong> – Ensuring security, preventing fraud, analysing service performance, improving the Platform.</li>
              <li><strong className="text-foreground">Consent</strong> – Where required for optional cookies, marketing or when you voluntarily provide additional information.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">8. HOW WE USE YOUR DATA</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To create and manage your account;</li>
              <li>To provide and bill the Delegation Services;</li>
              <li>To monitor and optimise node performance;</li>
              <li>To respond to your enquiries.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">9. DATA DISCLOSURE</h2>
            <p>We may share your data with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Third-Party Payment Provider – to process crypto payments;</li>
              <li>Sub-contracted Node-operators – strictly as needed to perform Delegation Services;</li>
              <li>IT and hosting providers in Switzerland and the EEA;</li>
              <li>Regulators or law-enforcement where required by law.</li>
            </ul>
            <p className="mt-3">Whenever data leaves Switzerland/EEA we ensure appropriate safeguards (e.g., Standard Contractual Clauses).</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">10. DATA RETENTION</h2>
            <p>We keep personal data only as long as necessary for the purposes described or to meet legal obligations (typically 5 years for contractual records, 12 months for server logs, unless a longer period is mandated).</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">11. SECURITY MEASURES</h2>
            <p>We apply encryption in transit and at rest, multi-factor access controls, least-privilege policies and routine penetration testing. In the unlikely event of a personal-data breach we will notify the Swiss Federal Data Protection and Information Commissioner and affected users without undue delay, in accordance with law.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">12. PRIVACY BY DESIGN &amp; BY DEFAULT</h2>
            <p>We embed privacy into product design and default settings, collecting the minimum data required and pseudonymising where practical.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">13. YOUR RIGHTS</h2>
            <p>Under the FADP (and GDPR where applicable) you can request to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access, correct or erase your personal data;</li>
              <li>Restrict or object to certain processing;</li>
              <li>Receive a copy in machine-readable format (data portability);</li>
              <li>Withdraw consent at any time (without affecting prior processing).</li>
            </ul>
            <p className="mt-3">You can exercise these rights via your dashboard or by emailing <a href="mailto:talk@ackinax.com" className="text-primary hover:underline">talk@ackinax.com</a> with proof of identity. Requests are free unless manifestly unfounded or excessive.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">14. DATA CONTROLLER</h2>
            <p>SYKS sàrl – AckiNax Platform</p>
            <p>Esplanade de Pont-Rouge 9A</p>
            <p>1212 Grand-Lancy, Switzerland</p>
            <p>Email: <a href="mailto:talk@ackinax.com" className="text-primary hover:underline">talk@ackinax.com</a></p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">15. CHANGES TO THIS NOTICE</h2>
            <p>We may update this Privacy Notice from time to time. The latest version is always available on the Website. Material changes will be announced via email or the dashboard.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">16. GOVERNING LAW &amp; JURISDICTION</h2>
            <p>This Privacy Notice is governed by Swiss law. The courts of Geneva, Switzerland have exclusive jurisdiction, subject to mandatory statutory venues.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">17. CONTACT &amp; COMPLAINTS</h2>
            <p>If you have questions or wish to lodge a complaint, please contact us at <a href="mailto:talk@ackinax.com" className="text-primary hover:underline">talk@ackinax.com</a>. You also have the right to complain to the Swiss Federal Data Protection and Information Commissioner (FDPIC), Feldeggweg 1, 3003 Bern, Switzerland.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
