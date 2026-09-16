export function TermsPage() {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h1>Terms of Service</h1>
        <p className="policy-meta">Version 1.0 &mdash; Effective: September 15, 2026</p>

        <section>
          <h2>1. About This Application</h2>
          <p>
            USCIS Case Status Checker ("the App") is a private tool that lets invited users
            look up the status of their U.S. immigration cases using the USCIS TORCH API.
            The App is operated by Saurabh Pundir ("we," "us," or "our").
          </p>
          <p>
            Access is limited to users who have received an invitation. By signing in and
            using the App, you agree to these Terms of Service ("Terms").
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old and have received a valid invitation code to
            use the App. By accepting these Terms, you confirm you meet these requirements.
          </p>
        </section>

        <section>
          <h2>3. Permitted Use</h2>
          <p>You may use the App to:</p>
          <ul>
            <li>Look up the current status of USCIS immigration cases using a receipt number.</li>
            <li>View the history of status changes for a case.</li>
          </ul>
          <p>You may not:</p>
          <ul>
            <li>Attempt to access case information you are not authorized to view.</li>
            <li>Use automated tools or scripts to bulk-query the App.</li>
            <li>Reverse-engineer, modify, or redistribute the App.</li>
            <li>Use the App for any unlawful purpose.</li>
          </ul>
        </section>

        <section>
          <h2>4. Account and Access</h2>
          <p>
            You sign in with your Google account. You are responsible for keeping your
            Google credentials secure. Notify us immediately if you believe your account
            has been compromised.
          </p>
          <p>
            We reserve the right to suspend or revoke access for violations of these Terms
            or for any other reason at our sole discretion.
          </p>
        </section>

        <section>
          <h2>5. Data and Privacy</h2>
          <p>
            Our Privacy Policy explains what data we collect, how we use it, and your
            rights. By using the App, you agree to our Privacy Policy.
          </p>
          <p>
            <a href="/privacy">Read the Privacy Policy &rarr;</a>
          </p>
        </section>

        <section>
          <h2>6. Data Deletion</h2>
          <p>
            You may request permanent deletion of your account and all associated data at
            any time. To submit a deletion request, email{' '}
            <a href="mailto:saurabh.pundir@gmail.com">saurabh.pundir@gmail.com</a> with
            the subject line "Data Deletion Request." We will complete the deletion within
            30 days of receiving your verified request.
          </p>
          <p>
            To close your account, send the same email. After closure, we retain only
            minimal records required by law.
          </p>
        </section>

        <section>
          <h2>7. Accuracy of Information</h2>
          <p>
            Case status data is retrieved directly from USCIS via the TORCH API. We do not
            modify or interpret this data. We are not responsible for errors or delays in
            USCIS systems. Always verify important information on the official USCIS website
            (uscis.gov).
          </p>
        </section>

        <section>
          <h2>8. Intellectual Property</h2>
          <p>
            All software, design, and content in the App (excluding USCIS data) belong to
            us. You may not copy, reproduce, or distribute any part of the App without our
            written permission.
          </p>
        </section>

        <section>
          <h2>9. Disclaimer of Warranties</h2>
          <p>
            The App is provided "as is" without warranties of any kind. We do not guarantee
            that the App will be available at all times, error-free, or that case status
            data will be current.
          </p>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we are not liable for any indirect,
            incidental, or consequential damages arising from your use of the App. Our total
            liability to you shall not exceed the amount you paid to use the App (which is
            zero).
          </p>
        </section>

        <section>
          <h2>11. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. When we do, we will notify you the
            next time you sign in and ask for your active consent before you may continue
            using the App. We will provide a plain-language summary of what changed.
          </p>
          <p>
            Continued use after accepting updated Terms means you agree to the new version.
          </p>
        </section>

        <section>
          <h2>12. Transfer of Ownership</h2>
          <p>
            If the App or our business is transferred, sold, or shut down, we will notify
            you in advance. You will have the option to permanently delete your data before
            any transfer takes effect.
          </p>
        </section>

        <section>
          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Maryland, United States.
            Any disputes will be resolved in the courts of Maryland.
          </p>
        </section>

        <section>
          <h2>14. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:saurabh.pundir@gmail.com">saurabh.pundir@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
