import type { Metadata } from "next";
import { SiteContentShell } from "../_components/site-content-shell";

export const metadata: Metadata = {
  title: "Return, privacy & shipping",
  description:
    "Return and refund, privacy, and shipping policies for ShopOnline customers.",
};

export default function PoliciesPage() {
  return (
    <SiteContentShell>
      <header>
        <h1 className="raleway text-2xl font-bold text-[#212121] border-b-4 border-[#212121] pb-3 inline-block sm:text-3xl md:text-4xl">
          Store policies
        </h1>
        <p className="mt-4 exo text-sm text-neutral-500">
          Return & refund, privacy, and shipping for ShopOnline — clothes,
          footwear, furniture, electronics, and more.
        </p>
      </header>

      <div className="mt-8 exo text-neutral-700 leading-relaxed space-y-10 text-sm sm:mt-10 sm:space-y-14 sm:text-[0.95rem] md:text-base">
        <section id="return-refund-policy" className="scroll-mt-24">
          <h2 className="raleway text-lg font-bold text-[#212121] border-b-2 border-[#212121]/20 pb-2 mb-4 sm:text-2xl sm:mb-6 md:text-3xl">
            Return & refund policy
          </h2>
          <div className="space-y-4">
            <p>
              We want you to love your purchase from{" "}
              <strong className="font-semibold text-neutral-900">ShopOnline</strong>.
              If an item is not right, you may request a return or exchange for
              eligible products within{" "}
              <strong className="font-semibold text-neutral-900">14 days</strong> of
              delivery, subject to the rules below.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                Items must be{" "}
                <strong className="font-semibold text-neutral-900">unworn</strong>,{" "}
                <strong className="font-semibold text-neutral-900">unwashed</strong>,
                and in original condition with all tags and packaging intact where
                supplied.
              </li>
              <li>
                Footwear and accessories should be returned in the original box or
                pouch if one was included.
              </li>
              <li>
                For hygiene reasons, certain categories (for example innerwear,
                socks, or opened personal-care items) may be marked
                non-returnable on the product page. Clearance or final-sale items
                marked as non-returnable cannot be returned unless they are
                defective.
              </li>
              <li>
                If you receive the wrong item, a damaged product, or a manufacturing
                defect, contact us as soon as possible with your order number and
                photos; we will help with a replacement or refund as appropriate.
              </li>
            </ul>
            <p>
              To start a return or exchange, email{" "}
              <a
                href="mailto:johndoe@shoponline.com"
                className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
              >
                johndoe@shoponline.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:+919876543210"
                className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
              >
                +91 98765 43210
              </a>{" "}
              with your order number and reason. We will share return instructions
              (including the return address). Refunds, when approved, are processed
              to the original payment method after we receive and inspect the item.
              Unless the return is due to our error or a defective product, original
              shipping charges are non-refundable.
            </p>
          </div>
        </section>

        <section id="privacy-policy" className="scroll-mt-24">
          <h2 className="raleway text-lg font-bold text-[#212121] border-b-2 border-[#212121]/20 pb-2 mb-4 sm:text-2xl sm:mb-6 md:text-3xl">
            Privacy policy
          </h2>
          <p className="mb-4 text-sm text-neutral-500">
            Last updated: May 11, 2026
          </p>
          <div className="space-y-4">
            <p>
              This policy explains how{" "}
              <strong className="font-semibold text-neutral-900">ShopOnline</strong>{" "}
              collects, uses, and protects personal information when you shop on
              shoponline.com.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                Information we collect:
              </strong>{" "}
              name, phone number, email, delivery and billing addresses, order and
              payment history, items purchased, device and usage data (such as pages
              viewed), and messages you send to customer support. If you create an
              account through a provider such as Clerk, we may receive profile
              details according to your settings with that provider.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                How we use it:
              </strong>{" "}
              to process and ship orders, send order updates, handle returns and
              support, improve our catalogue and website experience, prevent fraud,
              and meet legal requirements.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Sharing:</strong>{" "}
              we share data only as needed with payment partners, logistics and
              courier companies, and other service providers who help us run the
              store, under appropriate safeguards. We do not sell your personal
              information.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                Your choices:
              </strong>{" "}
              you can update certain account details where the platform allows it,
              opt out of non-essential marketing where offered, or email{" "}
              <a
                href="mailto:johndoe@shoponline.com"
                className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
              >
                johndoe@shoponline.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:+919876543210"
                className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
              >
                +91 98765 43210
              </a>{" "}
              for privacy-related requests (such as access or deletion) where
              applicable law gives you those rights.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Security:</strong>{" "}
              we use reasonable technical and organisational measures to protect your
              data. No online transmission is completely risk-free.
            </p>
          </div>
        </section>

        <section id="shipping-policy" className="scroll-mt-24">
          <h2 className="raleway text-lg font-bold text-[#212121] border-b-2 border-[#212121]/20 pb-2 mb-4 sm:text-2xl sm:mb-6 md:text-3xl">
            Shipping policy
          </h2>
          <div className="space-y-4">
            <p>
              We ship orders to addresses within India (and any other regions we
              enable at checkout). Clothing and accessories are typically packed
              within{" "}
              <strong className="font-semibold text-neutral-900">
                1–2 business days
              </strong>{" "}
              after confirmation; during sales, launches, or holidays processing may
              take longer.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                Delivery times
              </strong>{" "}
              depend on your location and the courier. Estimates shown at checkout
              are indicative, not guaranteed. When your order ships, we will share
              tracking details by email or SMS where available.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Fees:</strong>{" "}
              shipping is calculated at checkout from weight, dimensions, and
              service level. Any free-shipping offers will be shown clearly on the
              site or at checkout.
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">
                Damaged or missing items:
              </strong>{" "}
              please check your parcel when it arrives. If the package is damaged
              or an item is missing, email{" "}
              <a
                href="mailto:johndoe@shoponline.com"
                className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
              >
                johndoe@shoponline.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:+919876543210"
                className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
              >
                +91 98765 43210
              </a>{" "}
              within 48 hours with your order number and photos if possible so we
              can assist.
            </p>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24">
          <h2 className="raleway text-lg font-bold text-[#212121] border-b-2 border-[#212121]/20 pb-2 mb-4 sm:text-2xl sm:mb-6 md:text-3xl">
            Contact
          </h2>
          <div className="space-y-2">
            <p>
              <strong className="font-semibold text-neutral-900">Contact:</strong>{" "}
              John Doe
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Brand:</strong>{" "}
              ShopOnline — shoponline.com
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Email:</strong>{" "}
              <a
                href="mailto:johndoe@shoponline.com"
                className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
              >
                johndoe@shoponline.com
              </a>
            </p>
            <p>
              <strong className="font-semibold text-neutral-900">Phone:</strong>{" "}
              <a
                href="tel:+919876543210"
                className="text-[#212121] underline underline-offset-2 hover:text-[#FBC02D]"
              >
                +91 98765 43210
              </a>
            </p>
          </div>
        </section>
      </div>
    </SiteContentShell>
  );
}
