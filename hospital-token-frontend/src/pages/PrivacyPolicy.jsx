import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShieldCheck, FileText, Cookie, Lock, Mail, ExternalLink, Calendar, CheckCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    document.title = 'Privacy Policy | GMC Chest Hospital Token Management System';
    window.scrollTo(0, 0);
  }, []);

  const TABS = [
    { id: 'all', label: 'Full Policy', icon: FileText },
    { id: 'definitions', label: 'Definitions', icon: ShieldCheck },
    { id: 'collection', label: 'Data Collection', icon: Lock },
    { id: 'cookies', label: 'Cookies & Tracking', icon: Cookie },
    { id: 'contact', label: 'Contact Us', icon: Mail }
  ];

  return (
    <div className="home-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Header />

      <main style={{ flex: 1, padding: '3rem 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          
          {/* Header Card */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              padding: '2.5rem',
              borderRadius: '16px',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff0088', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              <ShieldCheck size={18} /> Official Legal Documentation
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Privacy Policy for gmcchtsrtoken.in
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              <Calendar size={15} />
              <span>Last updated: June 03, 2021</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '2rem',
              background: '#ffffff',
              padding: '0.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.15rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2.5rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              color: '#334155',
              lineHeight: 1.7,
              fontSize: '0.925rem'
            }}
          >
            
            {/* OVERVIEW / INTRO (Visible in 'all' or specific tabs) */}
            {(activeTab === 'all' || activeTab === 'definitions') && (
              <section style={{ marginBottom: '2.5rem' }}>
                <p style={{ marginBottom: '1.25rem' }}>
                  This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the{' '}
                  <a href="https://www.privacypolicies.com/privacy-policy-generator/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
                    Privacy Policy Generator <ExternalLink size={13} style={{ display: 'inline' }} />
                  </a>.
                </p>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2rem', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Interpretation and Definitions
                </h2>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                  Interpretation
                </h3>
                <p style={{ marginBottom: '1.25rem' }}>
                  The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.75rem' }}>
                  Definitions
                </h3>
                <p style={{ marginBottom: '1rem' }}>For the purposes of this Privacy Policy:</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Account:</strong> means a unique account created for You to access our Service or parts of our Service.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Company:</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to gmcchtsrtoken.in.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Cookies:</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Country:</strong> refers to: Kerala, India.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Device:</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Personal Data:</strong> is any information that relates to an identified or identifiable individual.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Service:</strong> refers to the Website.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Service Provider:</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Usage Data:</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>Website:</strong> refers to gmcchtsrtoken.in, accessible from{' '}
                    <a href="https://gmcchtsrtoken.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      https://gmcchtsrtoken.in/
                    </a>.
                  </li>
                  <li style={{ background: '#f8fafc', padding: '0.85rem 1.15rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <strong style={{ color: '#0f172a' }}>You:</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
                  </li>
                </ul>
              </section>
            )}

            {/* DATA COLLECTION & USAGE */}
            {(activeTab === 'all' || activeTab === 'collection') && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Collecting and Using Your Personal Data
                </h2>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.75rem' }}>
                  Types of Data Collected
                </h3>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  Personal Data
                </h4>
                <p style={{ marginBottom: '1rem' }}>
                  While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
                </p>
                <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={15} style={{ color: 'var(--primary)' }} /> Email address
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={15} style={{ color: 'var(--primary)' }} /> Usage Data
                  </li>
                </ul>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                  Usage Data
                </h4>
                <p style={{ marginBottom: '1rem' }}>
                  Usage Data is collected automatically when using the Service.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                </p>
                <p style={{ marginBottom: '1rem' }}>
                  When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.
                </p>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                  Use of Your Personal Data
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  The Company may use Personal Data for the following purposes:
                </p>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><strong>To provide and maintain our Service:</strong> including to monitor the usage of our Service.</li>
                  <li><strong>To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</li>
                  <li><strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</li>
                  <li><strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</li>
                  <li><strong>To provide You with news, special offers and general information:</strong> about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.</li>
                  <li><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</li>
                  <li><strong>For business transfers:</strong> We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.</li>
                  <li><strong>For other purposes:</strong> We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</li>
                </ul>

                <p style={{ marginBottom: '1rem' }}>
                  We may share Your personal information in the following situations:
                </p>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><strong>With Service Providers:</strong> We may share Your personal information with Service Providers to monitor and analyze the use of our Service, to contact You.</li>
                  <li><strong>For business transfers:</strong> We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
                  <li><strong>With Affiliates:</strong> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>
                  <li><strong>With business partners:</strong> We may share Your information with Our business partners to offer You certain products, services or promotions.</li>
                  <li><strong>With other users:</strong> when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.</li>
                  <li><strong>With Your consent:</strong> We may disclose Your personal information for any other purpose with Your consent.</li>
                </ul>
              </section>
            )}

            {/* TRACKING TECHNOLOGIES & COOKIES */}
            {(activeTab === 'all' || activeTab === 'cookies') && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Tracking Technologies and Cookies
                </h2>
                <p style={{ marginBottom: '1rem' }}>
                  We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Cookies or Browser Cookies:</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may use Cookies.
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Flash Cookies:</strong> Certain features of our Service may use local stored objects (or Flash Cookies) to collect and store information about Your preferences or Your activity on our Service. Flash Cookies are not managed by the same browser settings as those used for Browser Cookies. For more information on how You can delete Flash Cookies, please read "Where can I change the settings for disabling, or deleting local shared objects?" available at{' '}
                    <a href="https://helpx.adobe.com/flash-player/kb/disable-local-shared-objects-flash.html#main_Where_can_I_change_the_settings_for_disabling__or_deleting_local_shared_objects_" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>
                      Adobe Flash Player Knowledge Base <ExternalLink size={12} style={{ display: 'inline' }} />
                    </a>.
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a' }}>Web Beacons:</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics.
                  </div>
                </div>

                <p style={{ marginBottom: '1rem' }}>
                  Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser. Learn more about cookies:{' '}
                  <a href="https://www.privacypolicies.com/blog/cookies/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    What Are Cookies? <ExternalLink size={13} style={{ display: 'inline' }} />
                  </a>.
                </p>

                <p style={{ marginBottom: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  We use both Session and Persistent Cookies for the purposes set out below:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Necessary / Essential Cookies</h5>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Type: Session Cookies | Administered by: Us</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Cookies Policy / Notice Acceptance</h5>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Type: Persistent Cookies | Administered by: Us</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      These Cookies identify if users have accepted the use of cookies on the Website.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.25rem' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>Functionality Cookies</h5>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>Type: Persistent Cookies | Administered by: Us</p>
                    <p style={{ fontSize: '0.875rem', margin: 0 }}>
                      These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference.
                    </p>
                  </div>

                </div>
              </section>
            )}

            {/* RETENTION, TRANSFER, SECURITY, CHILDREN & CHANGES */}
            {(activeTab === 'all' || activeTab === 'definitions' || activeTab === 'collection') && (
              <section style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  Data Retention, Security &amp; Compliance
                </h2>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                  Retention of Your Personal Data
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                  Transfer of Your Personal Data
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                  Security of Your Personal Data
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                  Children's Privacy
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                  Links to Other Websites
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.
                </p>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                  Changes to this Privacy Policy
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                  We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top.
                </p>
              </section>
            )}

            {/* CONTACT US */}
            {(activeTab === 'all' || activeTab === 'contact') && (
              <section 
                style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                  padding: '1.75rem', 
                  borderRadius: '12px', 
                  border: '1px solid #cbd5e1', 
                  marginTop: '2rem' 
                }}
              >
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail style={{ color: 'var(--primary)' }} size={20} /> Contact Us
                </h2>
                <p style={{ marginBottom: '1rem', color: '#475569' }}>
                  If you have any questions about this Privacy Policy, You can contact us:
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, color: 'var(--primary)' }}>
                  <Mail size={18} />
                  <a href="mailto:gmcchtsrtokenproject@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                    gmcchtsrtokenproject@gmail.com
                  </a>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem', margin: '1rem 0 0 0' }}>
                  Generated using{' '}
                  <a href="https://www.privacypolicies.com/privacy-policy-generator/" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'underline' }}>
                    Privacy Policies Generator
                  </a>
                </p>
              </section>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
