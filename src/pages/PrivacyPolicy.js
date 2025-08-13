import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Mail, FileText, Users } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Your privacy and data protection are our top priorities at the Tourism Office of Rosario
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8"
        >
          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tourism Office of Rosario, Cavite</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Tourism Office of Rosario, Cavite is committed to protecting and securing your personal data 
              as required by Republic Act No. 10173 or the Data Privacy Act of 2012. We will process your 
              personal data as you access the Tourism Office of Rosario's official website and utilize our 
              tourism services.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              This privacy policy sets out how the Tourism Office of Rosario uses and protects any information 
              that you provide when you use this website and its services. The Tourism Office of Rosario is 
              committed to ensuring that your privacy is protected. Should we ask you to provide certain 
              information by which you can be identified when using this website and its services, you can be 
              assured that it will only be used in accordance with this Privacy Policy.
            </p>
            <p className="text-gray-700 leading-relaxed">
              The Tourism Office of Rosario may change this policy from time to time by updating this page. 
              You should check this page periodically to ensure that you are satisfied with any changes. 
              This policy is effective from {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
            </p>
          </div>

          {/* What We Collect */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">What Information We Collect</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect the following personal information when you use our tourism website and services:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Personal Identification:</strong>
                    <span className="text-gray-700"> First name, last name, and email address for account registration and tour bookings</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Contact Information:</strong>
                    <span className="text-gray-700"> Email address and phone number for booking confirmations and communication</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Booking Details:</strong>
                    <span className="text-gray-700"> Tour dates, preferred times, number of guests, special requests, visit purpose, and organization/school information</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Documentation:</strong>
                    <span className="text-gray-700"> Permission letters and authorization documents for institutional tours</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Correspondence:</strong>
                    <span className="text-gray-700"> Messages sent through our contact forms and inquiry submissions</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Technical Information:</strong>
                    <span className="text-gray-700"> Browser type, device information, and IP address for website functionality and security</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* How We Use Information */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">How We Use Your Information</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect and use your personal information to provide you with better tourism services and for the following specific purposes:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Tour Booking Management:</strong> Processing and confirming your tour reservations for Casa Hacienda de Tejeros and other Rosario tourism destinations</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Communication:</strong> Sending booking confirmations, tour updates, and responding to your inquiries about Rosario tourism</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Account Management:</strong> Creating and maintaining your user account for personalized tourism experiences</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Service Improvement:</strong> Analyzing user preferences to enhance our tourism offerings and website functionality</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Legal Compliance:</strong> Meeting requirements for visitor documentation and safety protocols</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Tourism Promotion:</strong> Customizing content and recommendations based on your interests (with your consent)</span>
                </li>
              </ul>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                <strong>Important:</strong> We will never sell, rent, or share your personal information with third parties for commercial purposes. Your data is used exclusively for tourism services provided by the Municipality of Rosario, Cavite.
              </p>
            </div>
          </div>

          {/* Data Security */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Data Security and Protection</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Tourism Office of Rosario is committed to ensuring that your information is secure. We have implemented comprehensive security measures to safeguard your personal data:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Encryption:</strong> All sensitive data is encrypted during transmission and storage using industry-standard protocols</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Firebase Security:</strong> Your data is stored on Google Firebase, which provides enterprise-level security and data protection</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Access Control:</strong> Only authorized tourism office personnel have access to your personal information</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Email Verification:</strong> Passwordless authentication system ensures secure account access without password vulnerabilities</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700"><strong>Regular Monitoring:</strong> Continuous monitoring for unauthorized access attempts and security threats</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Retention */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Data Retention and Your Rights</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Under the Data Privacy Act of 2012, you have several rights regarding your personal data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Your Rights Include:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Right to access your personal data</li>
                  <li>• Right to correct inaccurate information</li>
                  <li>• Right to delete your account and data</li>
                  <li>• Right to data portability</li>
                  <li>• Right to object to data processing</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Data Retention Period:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Active accounts: Until account deletion</li>
                  <li>• Booking records: 3 years for reporting</li>
                  <li>• Contact inquiries: 1 year</li>
                  <li>• Website analytics: 6 months</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cookies and Tracking */}
          <div className="mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h4 className="font-semibold text-amber-900 mb-3">Cookies and Website Analytics</h4>
              <p className="text-amber-800 mb-3">
                Our website uses minimal cookies and local storage to provide essential functionality such as:
              </p>
              <ul className="space-y-1 text-amber-800">
                <li>• Maintaining your login session</li>
                <li>• Remembering your booking preferences</li>
                <li>• Improving website performance</li>
                <li>• Analyzing visitor patterns to enhance our services</li>
              </ul>
              <p className="text-amber-800 mt-3">
                We do not use third-party tracking cookies or share your browsing data with external advertising networks.
              </p>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h4 className="font-semibold text-red-900 mb-3">Data Sharing and Disclosure</h4>
              <p className="text-red-800 mb-3">
                The Tourism Office of Rosario does not sell, trade, or transfer your personal information to external parties except:
              </p>
              <ul className="space-y-1 text-red-800">
                <li>• When required by law or legal process</li>
                <li>• To protect the safety and security of our visitors</li>
                <li>• With your explicit consent for specific tourism partnerships</li>
                <li>• To other government agencies within Cavite Province for legitimate tourism promotion (anonymized data only)</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-primary-900">Contact Our Data Protection Officer</h3>
            </div>
            <p className="text-primary-800 mb-4">
              For any questions, concerns, or requests regarding your personal data and privacy rights, please contact our Data Protection Officer:
            </p>
            <div className="space-y-2 text-primary-800">
              <p><strong>Tourism Office of Rosario, Cavite</strong></p>
              <p><strong>Email:</strong> dataprivacy.tourism@rosario.gov.ph</p>
              <p><strong>Address:</strong> Municipal Tourism Office, Rosario, Cavite</p>
              <p><strong>Phone:</strong> Contact through main tourism office</p>
            </div>
            <div className="mt-4 bg-white rounded-lg p-4">
              <p className="text-primary-900 font-medium">
                We are committed to responding to your privacy concerns within 30 days and will work with you to resolve any data protection issues in accordance with the Data Privacy Act of 2012.
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              This Privacy Policy is part of our commitment to transparent and responsible tourism services in Rosario, Cavite. 
              By using our website and services, you acknowledge that you have read and understood this policy.
            </p>
            <p className="text-center text-gray-500 mt-2 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
