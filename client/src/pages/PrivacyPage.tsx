import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function PrivacyPage() {
  return (
    <>
      <Header variant="app" />
      <div className="policy-page">
      <div className="policy-container">
        <h1>Privacy Policy</h1>
        <p className="policy-meta">Version 1.0 &mdash; Effective: September 15, 2026</p>

        <section>
          <h2>1. Who We Are</h2>
          <p>
            USCIS Case Status Checker ("the App") is operated by MyUSCISCase.org
            (hello@myusciscase.org). This policy explains how we collect, use, store,
            and protect your personal information when you use the App.
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <p>We collect only what is necessary to provide the service:</p>
          <ul>
            <li>
              <strong>Account data:</strong> Your name, email address, and profile picture
              from your Google account (provided when you sign in).
            </li>
            <li>
              <strong>Authentication data:</strong> A secure token issued by your Google
              account. We do not store your Google password.
            </li>
            <li>
              <strong>Case lookup data:</strong> USCIS receipt numbers you enter when
              searching for case status. We do not store these after the response is
              returned.
            </li>
            <li>
              <strong>Usage data:</strong> The date and time of your logins and consent
              records (when you accepted these policies).
            </li>
          </ul>
          <p>
            We do not collect geolocation data, financial information, medical information,
            or your contacts.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <p>We use your data only to:</p>
          <ul>
            <li>Verify your identity and provide secure access to the App.</li>
            <li>Forward receipt numbers to the USCIS TORCH API and return results to you.</li>
            <li>Keep records that you have agreed to our Terms of Service and Privacy Policy.</li>
            <li>Communicate with you about changes to the App or these policies.</li>
          </ul>
          <p>
            We do not use your data for advertising, profiling, or any purpose beyond
            operating the App.
          </p>
        </section>

        <section>
          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your data. We do not share your data for profit or any monetary
            transaction.
          </p>
          <p>We share data only in these limited circumstances:</p>
          <ul>
            <li>
              <strong>USCIS TORCH API:</strong> Receipt numbers you search are sent to
              USCIS to retrieve case status. USCIS receives only the receipt number, not
              your personal account information.
            </li>
            <li>
              <strong>Google:</strong> Sign-in is handled by Google OAuth. Google&rsquo;s
              own privacy policy governs how Google processes your authentication.
            </li>
            <li>
              <strong>Hosting infrastructure:</strong> The App runs on cloud infrastructure.
              That provider processes data only to host and deliver the service and is bound
              by data processing agreements consistent with this policy.
            </li>
            <li>
              <strong>Legal requirements:</strong> We may disclose information if required
              by law or in response to a valid legal request.
            </li>
          </ul>
          <p>
            Third parties are prohibited from using or disclosing your information
            (including any de-identified, anonymized, or pseudonymized form) for any reason
            without your active consent. All third-party providers are bound by terms
            consistent with this Privacy Policy.
          </p>
          <p>
            We do not share de-identified, anonymized, or pseudonymized versions of your
            data with marketers or research firms.
          </p>
        </section>

        <section>
          <h2>5. Your Data-Sharing Choices</h2>
          <p>
            Signing in with Google is the only sign-in method. By signing in, you authorize
            Google to share your basic profile (name, email, avatar) with the App. If you
            prefer not to share that data, you may choose not to use the App.
          </p>
          <p>
            Your data is not shared with other users of the App. Case status lookups are
            visible only to you.
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We keep your account data for as long as your account is active. If your
            account is dormant (no logins) for more than 24 months, we will email you
            before deleting your account and data.
          </p>
          <p>
            Consent records (date and version of policies you accepted) are kept for as
            long as required by law or until you request deletion.
          </p>
        </section>

        <section>
          <h2>7. Data Deletion</h2>
          <p>
            You may request permanent deletion of all your data at any time. Email{' '}
            <a href="mailto:hello@myusciscase.org">hello@myusciscase.org</a> with
            the subject line "Data Deletion Request." We will confirm receipt within 5
            business days and complete deletion within 30 days.
          </p>
          <p>
            To close your account, use the same process. After deletion, your data will not
            be recoverable.
          </p>
        </section>

        <section>
          <h2>8. Data Security</h2>
          <p>
            We use industry-standard security measures, including encrypted connections
            (HTTPS) and secure storage for credentials and API keys. Access to production
            data is restricted to authorized personnel only.
          </p>
          <p>
            If a data breach occurs, we will notify affected users within 72 hours of
            becoming aware of it. The notification will describe what happened, what data
            was involved, and any steps you should take to protect yourself.
          </p>
        </section>

        <section>
          <h2>9. California Consumer Privacy Act (CCPA)</h2>
          <p>
            If you are a California resident, you have the right to:
          </p>
          <ul>
            <li>Know what personal data we collect and how we use it.</li>
            <li>Request deletion of your personal data (see Section 7).</li>
            <li>Opt out of the sale of personal data. We do not sell personal data.</li>
            <li>Not be discriminated against for exercising your privacy rights.</li>
          </ul>
          <p>
            To exercise any CCPA right, contact us at{' '}
            <a href="mailto:hello@myusciscase.org">hello@myusciscase.org</a>.
          </p>
        </section>

        <section>
          <h2>10. Transfer of Ownership</h2>
          <p>
            If the App or our business is sold, transferred, or shut down, we will notify
            you before any transfer of your data occurs. The acquiring party will be
            required to honor this Privacy Policy. You will have the option to permanently
            delete your data before the transfer takes effect.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Policy</h2>
          <p>
            When we update this Privacy Policy, we will notify you the next time you sign
            in and ask for your active consent before you can continue using the App. We
            will provide a plain-language summary of what changed.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            For privacy questions or requests, contact:{' '}
            <a href="mailto:hello@myusciscase.org">hello@myusciscase.org</a>
          </p>
        </section>
      </div>
      </div>
      <Footer />
    </>
  );
}
