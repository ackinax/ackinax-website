import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-[800px] mx-auto px-6 md:px-10 pt-28 pb-20">
        <h1 className="font-mono-brand text-2xl md:text-3xl font-bold mb-2">ACKINAX – TERMS OF SERVICE</h1>
        <p className="text-dim text-sm mb-10">Date: 27 May 2025</p>

        <div className="prose-tos space-y-8 text-muted-foreground text-[15px] leading-relaxed font-body">

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">1. INTRODUCTION</h2>
            <p>Welcome to AckiNax, an online platform operated by SYKS sàrl, a company registered in Switzerland under the identification number CHE-274.038.278, having its registered address at Esplanade de Pont-Rouge 9A, 1212 Grand-Lancy, Switzerland (hereinafter "SYKS", the "Company", "we", "us" or "our").</p>
            <p className="mt-3">These terms of service (together with all appendices and exhibits hereto, which are hereby incorporated by reference, these "Terms" or this "Agreement") set out the legal conditions under which you, either personally or on behalf of a legal entity ("you", the "User"), may access and use the AckiNax platform (the "Platform") and the delegation-of-service offering described in Section 4 (the "Services").</p>
            <p className="mt-3">If you do not agree to these Terms in full, you must not access the Platform or use the Services.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">2. ACCEPTANCE OF TERMS</h2>
            <p>By accessing, browsing or using any part of the Platform, or by clicking any button or checkbox marked "I agree", "Accept" or similar, you:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>represent that you have read, understood and agree to be bound by these Terms and our Privacy Notice; and</li>
              <li>warrant that you have the legal capacity and authority required to do so on your own behalf or on behalf of the entity you represent.</li>
            </ul>
            <p className="mt-3">If you cannot make these statements truthfully, you are not authorised to use the Platform.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">3. DEFINITIONS</h2>
            <p>Capitalised terms used in these Terms have the meanings set out below.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border border-border">
                <thead><tr className="border-b border-border bg-card"><th className="text-left p-3 text-foreground">Term</th><th className="text-left p-3 text-foreground">Meaning</th></tr></thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 font-medium">Account</td><td className="p-3">The user account created on the Platform after successful registration.</td></tr>
                  <tr><td className="p-3 font-medium">Delegation Agreement or NaaS Agreement</td><td className="p-3">The contract between the User and the Company under which the Company maintains and operates the User's Node(s).</td></tr>
                  <tr><td className="p-3 font-medium">Distributed Ledger Technology (DLT)</td><td className="p-3">A decentralised peer-to-peer ledger or blockchain and any associated technology or protocol.</td></tr>
                  <tr><td className="p-3 font-medium">Force Majeure Event</td><td className="p-3">Any event outside the reasonable control of the affected party, including but not limited to natural disasters, war, terrorism, civil unrest, governmental action, pandemics, cyber-attacks, power failures or internet outages.</td></tr>
                  <tr><td className="p-3 font-medium">Intellectual Property Rights</td><td className="p-3">All current and future copyrights, trademarks, trade secrets, patents, database rights and other proprietary rights, whether registered or unregistered, anywhere in the world.</td></tr>
                  <tr><td className="p-3 font-medium">Node</td><td className="p-3">A blockchain validation, oracle or other infrastructure component owned or controlled by the User that participates in a DLT network.</td></tr>
                  <tr><td className="p-3 font-medium">Platform</td><td className="p-3">The AckiNax online platform made available by the Company.</td></tr>
                  <tr><td className="p-3 font-medium">Services</td><td className="p-3">The delegation of Node maintenance and operation described in Section 4.</td></tr>
                  <tr><td className="p-3 font-medium">User / you</td><td className="p-3">The natural or legal person that accesses or uses the Platform.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">4. THE PLATFORM AND THE SERVICES</h2>
            <h3 className="font-mono-brand text-base text-foreground mb-2">4.1 The Platform</h3>
            <p>AckiNax is a specialised infrastructure service that enables Users who already own or control one or more Nodes to outsource the technical maintenance, monitoring and operation of those Nodes to the Company. The Platform provides a streamlined interface for (i) onboarding Nodes, (ii) entering into a Delegation Agreement, (iii) tracking performance metrics and (iv) managing fee payments.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">4.2 The Services</h3>
            <p>Through the Platform, Users may enter into a Delegation of Node Maintenance and Operation service (Node-as-a-Service or NaaS). Under the NaaS model, SYKS, either directly or through vetted third-party providers, performs all tasks required to keep the User's Node(s) online, updated, secure and compliant with the rules of the underlying blockchain network.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">5. REGISTRATION PROCESS</h2>
            <h3 className="font-mono-brand text-base text-foreground mb-2">5.1 Eligibility</h3>
            <p>To register an Account you must meet the eligibility requirements set out on the Platform.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">5.2 Account Creation</h3>
            <p>Account creation currently requires authentication via a supported single-sign-on (e.g., Google) and connection of a compatible wallet. If you do not yet have an EVM-compatible wallet, the Platform can generate one for you via a regulated custody provider. You may disconnect your wallet at any time, but certain functionality will become unavailable until it is re-connected.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">5.3 Security</h3>
            <p>You are fully responsible for keeping your login credentials and wallet keys secure and for all activity that occurs under your Account. Notify us immediately at talk@ackinax.com if you suspect unauthorised access.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">6. DELEGATION OF NODE MAINTENANCE AND OPERATION</h2>
            <h3 className="font-mono-brand text-base text-foreground mb-2">6.1 Delegation Agreement</h3>
            <p>By opting into the NaaS service, you and the Company automatically enter into a Delegation Agreement governing Node operation, uptime targets, reporting standards, fees and termination rights. The latest version of the Delegation Agreement is always available on the Platform before you confirm delegation.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.2 Company's Responsibilities</h3>
            <p>SYKS will perform (or subcontract) the following tasks for each delegated Node:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provisioning and secure hosting;</li>
              <li>Installation of required client software and updates;</li>
              <li>24/7 monitoring, alerting and incident response;</li>
              <li>Periodic performance optimisation; and</li>
              <li>Generation of technical reports available through the Platform.</li>
            </ul>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.3 Rewards</h3>
            <p>All on-chain rewards generated by the Node accrue directly to the wallet you designate. SYKS does not take custody of your rewards and makes no representation regarding their value.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.4 Fees</h3>
            <p>The service fee (flat or percentage-based) applicable to each Node is displayed on the Platform before you confirm delegation. Fees are charged in either fiat or cryptocurrency according to Section 8.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.5 User Responsibilities</h3>
            <p>You retain legal ownership of the Node and must ensure that delegating its operation to SYKS does not breach any applicable law or contract. You must also maintain possession of any licence keys, staking credentials or other materials that prove ownership of the Node.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">6.6 Termination of Delegation</h3>
            <p>You may terminate a Delegation Agreement at any time via the Platform, subject to any notice period stated in that agreement and provided you have the technical capability to resume operation of the Node yourself. SYKS may likewise terminate for cause (e.g., non-payment, breach of these Terms) or for convenience with reasonable notice.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">7. USE OF THE SERVICES AND THE PLATFORM</h2>
            <h3 className="font-mono-brand text-base text-foreground mb-2">7.1 Access</h3>
            <p>SYKS grants you a limited, revocable, non-transferable right to access and use the Platform solely for the purpose of delegating and monitoring your Node(s).</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">7.2 Prohibited Conduct</h3>
            <p>You must not:</p>
            <ol className="list-decimal pl-6 mt-2 space-y-1">
              <li>use the Platform for any unlawful purpose;</li>
              <li>interfere with the security of the Platform or another User's Account;</li>
              <li>attempt to reverse-engineer or hack any part of the Platform;</li>
              <li>use automated scripts, bots or scrapers without our prior written consent; or</li>
              <li>infringe the Intellectual Property Rights of SYKS or any third party.</li>
            </ol>
            <p className="mt-3">Violation may result in immediate suspension or termination of your Account and, where appropriate, legal action.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">7.3 Prohibition of Web Scraping and Automated Data Collection</h3>
            <p>Automated extraction of data from the Platform, including training AI models, is strictly prohibited without SYKS's prior written consent.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">8. PAYMENTS</h2>
            <h3 className="font-mono-brand text-base text-foreground mb-2">8.1 Fiat Payments</h3>
            <p>Fiat payments (e.g., CHF, EUR, USD) are processed by Stripe or another authorised payment processor. By paying in fiat you agree to the processor's terms. All charges are due immediately and are non-refundable unless required by law.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">8.2 Cryptocurrency Payments</h3>
            <p>Cryptocurrency payments (e.g., ETH, BTC, USDT, USDC) are processed through a regulated third-party crypto-payment gateway. Network ("gas") fees are your responsibility. Transactions are final once confirmed on the relevant blockchain.</p>
            <p className="mt-3">SYKS reserves the right to screen wallets using KYT tools and to refuse or refund payments that appear tainted or otherwise non-compliant with AML laws.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">9. INTELLECTUAL PROPERTY RIGHTS</h2>
            <p>The Platform and all associated content are protected by Intellectual Property Rights owned by SYKS or its licensors. We grant you a non-exclusive, non-transferable, revocable licence to access the Platform for its intended purpose. Any other use (copying, distribution, reverse-engineering, etc.) is prohibited unless expressly authorised by us.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">10. BREACH OF THE TERMS</h2>
            <p>We may investigate any suspected violation of these Terms and may suspend or terminate your Account without notice if we reasonably believe that you have breached them.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">11. TERMINATION</h2>
            <h3 className="font-mono-brand text-base text-foreground mb-2">11.1 By the User</h3>
            <p>You may cease using the Platform at any time. Termination does not affect any accrued payment obligations.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">11.2 By the Company</h3>
            <p>We may suspend or terminate your access for (i) breach of these Terms, (ii) attempted fraud or abuse, (iii) legal or regulatory reasons, or (iv) any Force Majeure Event that makes provision of the Services impossible.</p>
            <h3 className="font-mono-brand text-base text-foreground mb-2 mt-4">11.3 Effect of Termination</h3>
            <p>Upon termination SYKS will relinquish operational control of your Node(s) as soon as reasonably practicable, provided you meet the technical prerequisites to assume direct control.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">12. DISCLAIMER OF WARRANTIES</h2>
            <p>The Platform is provided "as is" and "as available". To the fullest extent permitted by law, SYKS disclaims all warranties (express, implied or statutory), including any implied warranty of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Services will be uninterrupted, error-free or secure, or that Node rewards will have any particular value.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">13. DOWNTIME</h2>
            <p>Because the Services rely on the internet and the underlying blockchain networks, temporary outages or downtime may occur. SYKS is not liable for any loss resulting from such interruptions.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">14. USER RESPONSIBILITY FOR UPDATES AND COMPATIBILITY</h2>
            <p>You are responsible for ensuring that your devices and software remain compatible with the Platform.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">15. LIMITATION OF LIABILITY</h2>
            <p>Except in cases of gross negligence or fraud, SYKS's total aggregate liability for any claim arising out of or relating to the Platform or the Services will not exceed the total fees you paid to SYKS for the Services in the 12 months preceding the event giving rise to the claim.</p>
            <p className="mt-3">SYKS will not be liable for any indirect, incidental, special, consequential or punitive damages, including loss of profits, revenue, data or goodwill.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">16. INDEMNIFICATION</h2>
            <p>You agree to defend, indemnify and hold SYKS, its affiliates and their respective officers, directors and employees harmless from and against any claim, loss, damage or expense (including reasonable legal fees) arising out of or related to: (i) your breach of these Terms, (ii) your misuse of the Platform, or (iii) your violation of any law or third-party right.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">17. CHANGES TO TERMS</h2>
            <p>We may amend these Terms at any time. The updated version will take effect upon posting on the Platform (or on the effective date stated). Continued use after the update constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">18. MISCELLANEOUS</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Entire Agreement.</strong> These Terms (including any documents incorporated by reference) constitute the entire agreement between you and SYKS.</li>
              <li><strong className="text-foreground">Severability.</strong> If any provision is held invalid, the remaining provisions remain in effect.</li>
              <li><strong className="text-foreground">No Waiver.</strong> Failure to enforce a provision is not a waiver of the right to enforce it later.</li>
              <li><strong className="text-foreground">Assignment.</strong> You may not assign your rights or obligations without our prior written consent. We may assign these Terms without restriction.</li>
              <li><strong className="text-foreground">Governing Law.</strong> These Terms are governed by the laws of Switzerland. Any dispute shall be subject to the exclusive jurisdiction of the competent courts of the Canton of Geneva, Switzerland, subject to appeal to the Swiss Supreme Court.</li>
              <li><strong className="text-foreground">Language.</strong> These Terms are drafted in English; translations are for convenience only. In case of discrepancy, the English version prevails.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">19. TERRITORIAL RESTRICTIONS</h2>
            <p>The Platform is not intended for distribution or use in any jurisdiction where such distribution or use would violate local law or regulation. We may restrict access at our discretion.</p>
          </section>

          <section>
            <h2 className="font-mono-brand text-lg text-foreground mb-3">20. CONTACT</h2>
            <p>If you have any questions about these Terms or the Services, please contact us at:</p>
            <p className="mt-2">Email: <a href="mailto:talk@ackinax.com" className="text-primary hover:underline">talk@ackinax.com</a></p>
            <p>Address: SYKS sàrl, Esplanade de Pont-Rouge 9A, 1212 Grand-Lancy, Switzerland</p>
            <p className="mt-4 text-dim text-sm">© 2025 SYKS sàrl. All rights reserved.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
