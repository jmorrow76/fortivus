import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 md:pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-12">
            Last updated: December 10, 2024
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Agreement */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Agreement to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Fortivus ("the Service"), you agree to be bound by these Terms of 
                Service ("Terms"). If you disagree with any part of these terms, you may not access the 
                Service. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Description of Service
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Fortivus is a faith-based fitness platform designed for Christian men over 40. The Service 
                provides fitness tracking, workout programming, nutrition guidance, AI coaching, community 
                features, and accountability tools. The Service is available through our website and mobile 
                applications.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                User Accounts
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and current 
                information. Failure to do so constitutes a breach of the Terms.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>You are responsible for safeguarding the password used to access the Service</li>
                <li>You agree not to share your account credentials with any third party</li>
                <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account</li>
                <li>You may not use as a username the name of another person or entity without authorization</li>
                <li>You must be at least 18 years old to create an account</li>
              </ul>
            </section>

            {/* Subscriptions and Payments */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Subscriptions and Payments
              </h2>
              
              <h3 className="text-xl font-heading font-medium text-foreground mb-3 mt-6">
                Free and Paid Services
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Fortivus offers both free and paid subscription tiers. Free users have access to limited 
                features, while Elite subscribers gain access to premium features including AI coaching, 
                advanced workout tracking, calorie tracking, and wearable integration.
              </p>

              <h3 className="text-xl font-heading font-medium text-foreground mb-3 mt-6">
                Billing and Renewal
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>You authorize us to charge your payment method on file for renewal fees</li>
                <li>Prices are subject to change with reasonable notice</li>
              </ul>

              <h3 className="text-xl font-heading font-medium text-foreground mb-3 mt-6">
                Cancellation and Refunds
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>No refunds are provided for partial subscription periods</li>
                <li>Lifetime memberships are non-refundable after 14 days from purchase</li>
              </ul>

              <h3 className="text-xl font-heading font-medium text-foreground mb-3 mt-6">
                Payment Processing
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                All payments are processed securely through Stripe. We do not store your complete credit 
                card information on our servers. By providing payment information, you represent that you 
                are authorized to use the payment method.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                User Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As a user of the Service, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                <li>Provide accurate information about yourself and your fitness level</li>
                <li>Consult with a healthcare professional before beginning any fitness program</li>
                <li>Take responsibility for your own health and safety during workouts</li>
                <li>Respect other users and maintain a supportive community environment</li>
                <li>Report any bugs, errors, or security vulnerabilities you discover</li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Prohibited Activities
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Posting content that is offensive, blasphemous, profane, or contrary to Christian values</li>
                <li>Harassing, threatening, or intimidating other users</li>
                <li>Impersonating another person or entity</li>
                <li>Posting spam, advertisements, or promotional content without authorization</li>
                <li>Attempting to gain unauthorized access to other users' accounts or our systems</li>
                <li>Using the Service to distribute malware or engage in hacking activities</li>
                <li>Scraping, data mining, or using automated tools to access the Service</li>
                <li>Circumventing any security measures or access controls</li>
                <li>Using the Service for any illegal or unauthorized purpose</li>
                <li>Sharing account credentials or allowing others to use your account</li>
              </ul>
            </section>

            {/* Community Guidelines */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Community Guidelines
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Fortivus is a faith-based community. All content and interactions must align with Christian 
                values and biblical principles. We expect all users to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Treat others with respect, kindness, and encouragement</li>
                <li>Keep discussions appropriate and edifying</li>
                <li>Support fellow members in their fitness and faith journeys</li>
                <li>Honor accountability partnerships with integrity</li>
                <li>Protect the privacy of other users</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We reserve the right to moderate, remove, or restrict any content or user that violates 
                these guidelines at our sole discretion.
              </p>
            </section>

            {/* User Content */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                User Content
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You retain ownership of any content you post to the Service, including forum posts, 
                testimonies, progress photos, and messages. By posting content, you grant us a 
                non-exclusive, worldwide, royalty-free license to use, display, and distribute your 
                content within the Service.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You are solely responsible for the content you post. You represent that you have the 
                right to share any content you post and that it does not violate any third-party rights.
              </p>
            </section>

            {/* Health Disclaimer */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Health and Fitness Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
                IMPORTANT: The Service is not a substitute for professional medical advice, diagnosis, 
                or treatment.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Always consult your physician before starting any exercise program</li>
                <li>AI coaching and recommendations are for informational purposes only</li>
                <li>You assume all risks associated with physical activity and exercise</li>
                <li>Stop exercising immediately if you experience pain, dizziness, or discomfort</li>
                <li>Nutrition recommendations are general guidance and not personalized medical advice</li>
                <li>Body composition analysis provides estimates and should not replace professional assessment</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By using the Service, you acknowledge that you are participating in fitness activities 
                at your own risk and that Fortivus is not liable for any injuries or health issues that 
                may result from using our recommendations.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content (excluding user content), features, and functionality 
                are owned by Fortivus and are protected by international copyright, trademark, patent, 
                trade secret, and other intellectual property laws. You may not copy, modify, distribute, 
                sell, or lease any part of the Service without our prior written consent.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Third-Party Links and Services
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service may contain links to third-party websites or services, including affiliate 
                product recommendations. We are not responsible for the content, privacy policies, or 
                practices of any third-party sites or services. You acknowledge and agree that we shall 
                not be liable for any damage or loss caused by your use of any third-party content, 
                goods, or services.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, FORTIVUS AND ITS DIRECTORS, EMPLOYEES, PARTNERS, 
                AGENTS, SUPPLIERS, OR AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>Personal injury or property damage resulting from your use of the Service</li>
                <li>Unauthorized access to or use of our servers or personal information</li>
                <li>Interruption or cessation of transmission to or from the Service</li>
                <li>Any bugs, viruses, or similar issues transmitted through the Service</li>
                <li>Any errors or omissions in any content</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                In no event shall our total liability exceed the amount you paid to us in the twelve (12) 
                months preceding the claim.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Disclaimer of Warranties
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF 
                ANY KIND, WHETHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE 
                UNINTERRUPTED, SECURE, OR ERROR-FREE. WE MAKE NO WARRANTIES REGARDING THE ACCURACY OR 
                RELIABILITY OF ANY INFORMATION OBTAINED THROUGH THE SERVICE, INCLUDING AI-GENERATED 
                RECOMMENDATIONS.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Indemnification
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to defend, indemnify, and hold harmless Fortivus and its officers, directors, 
                employees, and agents from any claims, damages, obligations, losses, liabilities, costs, 
                or expenses arising from: (a) your use of the Service; (b) your violation of these Terms; 
                (c) your violation of any third-party rights; or (d) any content you post to the Service.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Termination
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason, including without limitation if you breach these Terms. Upon termination:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Your right to use the Service will immediately cease</li>
                <li>You may request a copy of your data within 30 days of termination</li>
                <li>We may delete your account and all associated data</li>
                <li>Provisions that by their nature should survive termination will survive</li>
              </ul>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United 
                States, without regard to its conflict of law provisions. Any disputes arising under these 
                Terms shall be resolved through binding arbitration in accordance with the rules of the 
                American Arbitration Association.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is 
                material, we will provide at least 30 days' notice prior to any new terms taking effect. 
                What constitutes a material change will be determined at our sole discretion. By continuing 
                to access or use the Service after revisions become effective, you agree to be bound by 
                the revised terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="mt-4 p-6 bg-muted/30 rounded-lg">
                <p className="text-foreground font-medium">Fortivus</p>
                <p className="text-muted-foreground">Email: legal@fortivus.com</p>
                <p className="text-muted-foreground">Support: support@fortivus.com</p>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-6">
                For privacy-related inquiries, please see our{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
