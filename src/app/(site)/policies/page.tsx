import type { Metadata } from "next";
import { SiteContentShell } from "../_components/site-content-shell";

export const metadata: Metadata = {
  title: "Return, privacy & shipping policies",
  description:
    "Return and refund, privacy, and shipping policies for Buyora customers.",
};

export default function PoliciesPage() {
  return (
    <SiteContentShell>
      <header>
        <h1 className="raleway text-3xl md:text-4xl font-bold text-rose-600 border-b-4 border-rose-600 pb-3 inline-block">
          Store policies
        </h1>
        <p className="mt-4 exo text-sm text-neutral-500">
          Return & refund, privacy, and shipping information for Buyora
          shoppers.
        </p>
      </header>

      <div className="mt-10 exo text-neutral-700 leading-relaxed space-y-14 text-[0.95rem] md:text-base">
        <section id="return-refund-policy" className="scroll-mt-24">
          <h2 className="raleway text-2xl md:text-3xl font-bold text-rose-600 border-b-2 border-indigo-200 pb-2 mb-6">
            Return & refund policy
          </h2>
          <div className="space-y-4">
            <p>
              We want you to be happy with your party supplies. If something is
              not right, you may return eligible items within{" "}
              <strong className="font-semibold text-neutral-900">14 days</strong>{" "}
              of delivery for a refund or exchange, subject to the rules below.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Items must be unused, in original packaging, and with tags
                attached where applicable.
              </li>
              <li>
                Personalized, custom, or clearance items marked “final sale” may
                not be returnable unless defective.
              </li>
              <li>
                Opened consumables (e.g., certain confetti or food-contact items)
                may not be eligible for hygiene reasons.
              </li>
            </ul>
            <p>
              To start a return, contact us with your order number and reason. We
              will provide return instructions. Refunds are issued to the original
              payment method after we receive and inspect the return. Shipping
              costs are non-refundable unless we shipped the wrong item or the
              product is defective.
            </p>
          </div>
        </section>

        <section id="privacy-policy" className="scroll-mt-24">
          <h2 className="raleway text-2xl md:text-3xl font-bold text-rose-600 border-b-2 border-indigo-200 pb-2 mb-6">
            Privacy policy
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            Last updated: March 29, 2026
          </p>
          <div className="space-y-4">
            <p>
              This policy describes how Buyora collects, uses, and protects
              information when you visit our site or place an order.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                Information we collect:
              </strong>{" "}
              contact and shipping details you provide, order history, device and
              usage data (such as pages viewed), and communications with support.
              If you use an account provider (e.g., Clerk), we may receive
              profile details according to your settings with that provider.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                How we use it:
              </strong>{" "}
              to process and deliver orders, communicate about purchases, improve
              our store, prevent fraud, and comply with legal obligations.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Sharing:</strong>{" "}
              we may share data with payment processors, shipping carriers, and
              service providers who assist our operations, under strict
              agreements. We do not sell your personal information.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                Your choices:
              </strong>{" "}
              you may update account information where applicable, opt out of
              non-essential marketing emails, or contact us to exercise rights
              available in your region (such as access or deletion requests,
              where applicable).
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Security:</strong>{" "}
              we use reasonable technical and organizational measures to protect
              data, but no method of transmission over the internet is 100%
              secure.
            </p>
          </div>
        </section>

        <section id="shipping-policy" className="scroll-mt-24">
          <h2 className="raleway text-2xl md:text-3xl font-bold text-rose-600 border-b-2 border-indigo-200 pb-2 mb-6">
            Shipping policy
          </h2>
          <div className="space-y-4">
            <p>
              We ship to addresses within the regions shown at checkout. Orders
              are typically processed within{" "}
              <strong className="font-semibold text-neutral-900">
                1–2 business days
              </strong>
              ; processing may take longer during sales or holidays.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                Delivery times
              </strong>{" "}
              depend on the carrier and destination. Estimates shown at checkout
              are not guaranteed. You will receive tracking information when your
              order ships, when available.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Fees:</strong>{" "}
              shipping costs are calculated at checkout based on weight,
              dimensions, and service level. Free shipping may be offered on
              qualifying orders as displayed on the site.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                Damaged or missing items:
              </strong>{" "}
              inspect your package on arrival. If something is damaged or
              missing, contact us within 48 hours with photos if possible so we can
              help.
            </p>
          </div>
        </section>
      </div>
    </SiteContentShell>
  );
}
