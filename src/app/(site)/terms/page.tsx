import type { Metadata } from "next";
import { SiteContentShell } from "../_components/site-content-shell";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Terms and conditions for using the Buyora website and services.",
};

export default function TermsPage() {
  return (
    <SiteContentShell>
      <header>
        <h1 className="raleway text-3xl md:text-4xl font-bold text-rose-600 border-b-4 border-rose-600 pb-3 inline-block">
          Terms and conditions
        </h1>
        <p className="mt-4 exo text-sm text-neutral-500">
          Last updated: March 29, 2026
        </p>
      </header>

      <div className="mt-10 exo text-neutral-700 leading-relaxed space-y-8 text-[0.95rem] md:text-base">
        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            1. Agreement
          </h2>
          <p>
            By accessing or using the Buyora website and related services
            (“Services”), you agree to these Terms and Conditions. If you do not
            agree, please do not use the Services.
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            2. Eligibility & accounts
          </h2>
          <p>
            You must be able to form a binding contract in your jurisdiction to
            use the Services. You are responsible for maintaining the
            confidentiality of your account credentials and for all activity
            under your account.
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            3. Products & pricing
          </h2>
          <p>
            We strive to display accurate descriptions, images, and prices.
            Errors may occur; we reserve the right to correct them and to refuse or
            cancel orders placed at incorrect prices or with unavailable items.
            Prices and availability are subject to change without notice until
            your order is confirmed.
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            4. Orders & payment
          </h2>
          <p>
            When you place an order, you offer to purchase the items in your cart
            subject to these terms. We will confirm acceptance by email or on the
            order screen. Payment must be authorized at checkout using our
            supported payment methods.
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            5. Shipping & risk
          </h2>
          <p>
            Delivery timelines are estimates. Title and risk of loss pass to you
            upon delivery to the carrier unless otherwise required by law. See our{" "}
            <a
              href="/policies#shipping-policy"
              className="text-rose-600 underline underline-offset-2 hover:text-rose-700"
            >
              Shipping policy
            </a>{" "}
            for more detail.
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            6. Returns & refunds
          </h2>
          <p>
            Our return and refund rules are described in our{" "}
            <a
              href="/policies#return-refund-policy"
              className="text-rose-600 underline underline-offset-2 hover:text-rose-700"
            >
              Return & refund policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            7. Intellectual property
          </h2>
          <p>
            Content on this site—including text, graphics, logos, and layout—is
            owned by Buyora or its licensors and is protected by applicable
            intellectual property laws. You may not copy, modify, or distribute
            it without permission.
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            8. Limitation of liability
          </h2>
          <p>
            To the fullest extent permitted by law, Buyora is not liable for
            indirect, incidental, or consequential damages arising from your use
            of the Services. Our total liability for any claim related to an
            order is limited to the amount you paid for that order.
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            9. Changes
          </h2>
          <p>
            We may update these terms from time to time. The “Last updated” date
            will change when we do. Continued use of the Services after changes
            constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="raleway text-xl font-semibold text-neutral-900 mb-3">
            10. Contact
          </h2>
          <p>
            For questions about these terms, contact us using the details in the
            site footer.
          </p>
        </section>
      </div>
    </SiteContentShell>
  );
}
