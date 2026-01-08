import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-44 md:pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-12">
            Last updated: December 10, 2024
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Fortivus ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                mobile application and website (collectively, the "Service"). Please read this privacy policy 
                carefully. If you do not agree with the terms of this privacy policy, please do not access 
                the Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Information We Collect
              </h2>
              
              <h3 className="text-xl font-heading font-medium text-foreground mb-3 mt-6">
                Personal Information
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide when you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Register for an account (email address, name)</li>
                <li>Complete your fitness profile (age, fitness goals, experience level)</li>
                <li>Subscribe to our premium services (payment information processed securely by Stripe)</li>
                <li>Participate in community features (forum posts, messages, testimonies)</li>
                <li>Contact our support team</li>
              </ul>

              <h3 className="text-xl font-heading font-medium text-foreground mb-3 mt-6">
                Health and Fitness Data
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                With your consent, we collect health and fitness information including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Workout logs (exercises, sets, reps, weights)</li>
                <li>Running and GPS data (routes, distance, pace)</li>
                <li>Progress photos and body measurements</li>
                <li>Nutrition and calorie tracking data</li>
                <li>Sleep quality and mood check-in data</li>
                <li>Data from connected wearables (Apple Health, Google Fit) when authorized</li>
              </ul>

              <h3 className="text-xl font-heading font-medium text-foreground mb-3 mt-6">
                Automatically Collected Information
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you access the Service, we may automatically collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Device information (device type, operating system, unique device identifiers)</li>
                <li>Log data (access times, pages viewed, app crashes)</li>
                <li>Location data (with your permission, for GPS run tracking)</li>
              </ul>

              {/* NO TRACKING Section - CRITICAL for App Store Guideline 5.1.2 */}
              <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-xl mb-4 mt-6">
                <h3 className="font-heading text-xl font-semibold mb-4 text-green-700 dark:text-green-400 flex items-center gap-2">
                  🔒 No Tracking - Your Privacy is Protected
                </h3>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground">
                    Fortivus does NOT track you across apps or websites. We do NOT use:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>No tracking cookies</strong> - We don't use cookies for advertising or cross-site tracking</li>
                    <li><strong>No advertising identifiers (IDFA)</strong> - We don't collect or use Apple's advertising identifier</li>
                    <li><strong>No third-party analytics</strong> - We don't use Google Analytics, Facebook Pixel, or similar tracking services</li>
                    <li><strong>No data broker sharing</strong> - We never sell or share your data with data brokers</li>
                    <li><strong>No cross-app tracking</strong> - We don't link your activity with other apps or websites</li>
                  </ul>
                  <p className="mt-4">
                    We only use first-party local storage (localStorage) for essential app functionality such as 
                    remembering your UI preferences (e.g., sidebar state). This data stays entirely on your device 
                    and is never transmitted to any servers or third parties.
                  </p>
                  <p className="font-medium text-foreground mt-4">
                    Your fitness journey data is stored securely in our database solely for providing you 
                    the app's features. We do not monetize your data in any way.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Personalize your fitness recommendations and AI coaching</li>
                <li>Process your transactions and manage your subscription</li>
                <li>Enable community features and accountability partnerships</li>
                <li>Send you updates, newsletters, and promotional communications (with your consent)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Monitor and analyze usage patterns to improve user experience</li>
                <li>Detect, prevent, and address technical issues or fraudulent activity</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                How We Share Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  <strong>Service Providers:</strong> With third-party vendors who perform services on our behalf 
                  (e.g., payment processing via Stripe, email delivery via Resend)
                </li>
                <li>
                  <strong>Community Features:</strong> Information you choose to share publicly in forums, 
                  testimonies, or activity feeds is visible to other users
                </li>
                <li>
                  <strong>Accountability Partners:</strong> When you connect with an accountability partner, 
                  you share check-ins, prayer requests, and progress updates with them
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law, regulation, or legal process
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. 
                These measures include encryption, secure servers, and access controls. However, no method 
                of transmission over the Internet or electronic storage is 100% secure, and we cannot 
                guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Data Retention
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to 
                provide you with our services. We may retain certain information as required by law or for 
                legitimate business purposes, such as resolving disputes or enforcing our agreements. 
                Workout logs, progress data, and health information are retained to provide you with 
                historical tracking and progress visualization.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Your Rights and Choices
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request access to the personal information we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal information, subject to 
                  legal retention requirements
                </li>
                <li>
                  <strong>Data Portability:</strong> Request a copy of your data in a portable format
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Revoke consent for data processing where consent 
                  is the legal basis
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@fortivus.com.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Third-Party Services
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our Service integrates with third-party services that have their own privacy policies:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Stripe:</strong> For secure payment processing</li>
                <li><strong>Apple Health / Google Fit:</strong> For wearable data synchronization (when authorized)</li>
                <li><strong>Social Login Providers:</strong> Google, Apple, Facebook, GitHub (when used for authentication)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We encourage you to review the privacy policies of these third-party services.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you are a parent or guardian and believe your child 
                has provided us with personal information, please contact us at privacy@fortivus.com, and 
                we will take steps to delete such information.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                International Users
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are accessing our Service from outside the United States, please be aware that your 
                information may be transferred to, stored, and processed in the United States where our 
                servers are located. By using our Service, you consent to the transfer of your information 
                to the United States.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
                advised to review this Privacy Policy periodically for any changes. Changes are effective 
                when posted on this page.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-6 bg-muted/30 rounded-lg">
                <p className="text-foreground font-medium">Fortivus</p>
                <p className="text-muted-foreground">Email: privacy@fortivus.com</p>
                <p className="text-muted-foreground">Support: support@fortivus.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
