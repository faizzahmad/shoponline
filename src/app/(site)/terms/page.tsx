import type { Metadata } from "next";
import { SiteContentShell } from "../_components/site-content-shell";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description:
    "Terms and conditions for shopping at ShopOnline (shoponline.com).",
};

export default function TermsPage() {
  return (
    <SiteContentShell>
      <header>
        <h1 className="raleway text-2xl font-bold text-[#212121] border-b-4 border-[#212121] pb-3 inline-block sm:text-3xl md:text-4xl">
          Terms and conditions
        </h1>
        <p className="mt-4 exo text-sm text-neutral-500">
          Last updated: May 11, 2026
        </p>
      </header>

      <div className="mt-8 exo text-neutral-700 leading-relaxed space-y-6 text-sm sm:mt-10 sm:space-y-8 sm:text-[0.95rem] md:text-base">
        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            1. Agreement
          </h2>
          <p>
            These Terms and Conditions govern your use of the website and online
            store operated by <strong className="font-semibold text-neutral-900">ShopOnline</strong> at{" "}
            <strong className="font-semibold text-neutral-900">shoponline.com</strong>{" "}
            (together, the “Services”). By browsing, creating an account, or placing
            an order for products across our catalog, you agree to these terms. If
            you do not agree, please do not use the Services.
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            2. Eligibility & accounts
          </h2>
          <p>
            You must be legally able to enter into a contract in your jurisdiction.
            You are responsible for keeping your login details confidential and for
            all activity under your account. If you sign in through a third-party
            provider (such as Clerk), their terms may also apply where relevant.
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            3. Products, images & pricing
          </h2>
          <p>
            We sell products across categories such as clothes, footwear, furniture,
            electronics, and more, as described on each product
            page. We aim for accurate titles, descriptions, size information, and
            photography. Colours and textures may vary slightly due to lighting,
            screen settings, or manufacturing batches. Measurements and fits are
            provided as a guide only. If a price, discount, or stock level is shown
            in error, we may refuse or cancel that order before dispatch and will
            refund any amount already paid for cancelled items.
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            4. Orders & payment
          </h2>
          <p>
            When you checkout, you offer to buy the items in your cart at the prices
            shown (plus applicable taxes and shipping). We accept your order when we
            confirm it by email or on your order screen. Payment must be completed
            using the payment methods shown at checkout. You agree that you are
            authorised to use the chosen payment method.
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            5. Shipping & risk
          </h2>
          <p>
            We ship within India (or other regions we enable at checkout). Delivery
            dates are estimates and depend on couriers. Risk of loss for your order
            passes to you when the carrier takes possession of the parcel, except
            where local law says otherwise. Full details are in our{" "}
            <a
              href="/policies#shipping-policy"
              className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
            >
              Shipping policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            6. Returns, exchanges & refunds
          </h2>
          <p>
            Our rules for returns, exchanges, and refunds for products and
            accessories are set out in our{" "}
            <a
              href="/policies#return-refund-policy"
              className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
            >
              Return & refund policy
            </a>
            . Please read them before you buy, especially for sale items and
            hygiene-sensitive categories.
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            7. Intellectual property
          </h2>
          <p>
            All content on this site—including ShopOnline name and branding, text,
            graphics, product images, and layout—is owned by ShopOnline or its
            licensors and is protected by copyright and other intellectual property
            laws. You may not copy, scrape, resell, or reuse our content for
            commercial purposes without written permission.
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            8. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, ShopOnline is not
            liable for indirect or consequential loss (including loss of profit or
            goodwill) arising from your use of the Services. Our total liability for
            any claim relating to a specific order is limited to the amount you
            paid us for that order. Nothing in these terms excludes liability that
            cannot legally be excluded.
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            9. Changes
          </h2>
          <p>
            We may update these terms from time to time. When we do, we will change
            the “Last updated” date above. Continued use of the Services after
            changes are posted means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="raleway text-lg font-semibold text-neutral-900 mb-3 sm:text-xl">
            10. Governing law & contact
          </h2>
          <p>
            These terms are governed by the laws of India, subject to mandatory
            consumer protections where you live. For questions about these terms
            or your order, contact{" "}
            <a
              href="mailto:johndoe@shoponline.com"
              className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
            >
              johndoe@shoponline.com
            </a>{" "}
            or{" "}
            <a
              href="tel:+919876543210"
              className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
            >
              +91 98765 43210
            </a>
            . You can also see our{" "}
            <a
              href="/policies#contact"
              className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
            >
              Policies — Contact
            </a>{" "}
            section.
          </p>
        </section>
      </div>
    </SiteContentShell>
  );
}
