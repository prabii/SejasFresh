import { useState } from 'react'
import './App.css'

// Direct APK download URL - Google Drive direct download link
// Converted from: https://drive.google.com/file/d/1TgbLa_Z5iR5pbhw3wvC6Sp4qw2s7osv0/view?usp=drive_link
const DIRECT_APK_URL = 'https://drive.google.com/uc?export=download&id=1TgbLa_Z5iR5pbhw3wvC6Sp4qw2s7osv0'

// Expo build page URL (fallback)
const EXPO_BUILD_URL = 'https://expo.dev/accounts/prabii/projects/MeatDeliveryUserApp/builds/ce7cf39e-12d0-455c-8118-35f29183834d'

function App() {
  const [loading, setLoading] = useState(false)

  // Features of the app
  const features = [
    {
      icon: '🥩',
      title: 'Fresh Meat Delivery',
      description: 'Get premium quality fresh meat delivered right to your doorstep'
    },
    {
      icon: '⚡',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery service to ensure freshness'
    },
    {
      icon: '📱',
      title: 'Easy Ordering',
      description: 'Simple and intuitive interface for seamless ordering experience'
    },
    {
      icon: '🎯',
      title: 'Track Orders',
      description: 'Real-time order tracking to know exactly when your order arrives'
    },
    {
      icon: '💳',
      title: 'Secure Payment',
      description: 'Multiple payment options with secure and encrypted transactions'
    },
    {
      icon: '🎁',
      title: 'Exclusive Offers',
      description: 'Special discounts and coupons for regular customers'
    }
  ]

  // Handle direct APK download
  const handleDownload = async () => {
    setLoading(true)
    try {
      // For Google Drive, we need to handle it differently
      // Google Drive direct download format: https://drive.google.com/uc?export=download&id=FILE_ID
      const downloadUrl = DIRECT_APK_URL
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = 'SejasFresh.apk' // Set the filename for download
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // For Google Drive, sometimes it redirects, so we also open in a new tab as backup
      // This ensures the user can download even if the direct link doesn't work
      setTimeout(() => {
        // Open the original Google Drive link as fallback
        window.open('https://drive.google.com/file/d/1TgbLa_Z5iR5pbhw3wvC6Sp4qw2s7osv0/view?usp=drive_link', '_blank')
      }, 1000)
    } catch (error) {
      console.error('Error downloading APK:', error)
      // Fallback: Open the Google Drive link
      window.open('https://drive.google.com/file/d/1TgbLa_Z5iR5pbhw3wvC6Sp4qw2s7osv0/view?usp=drive_link', '_blank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🥩</span>
            <span className="logo-text">Sejas Fresh</span>
          </div>
          <button className="download-btn-nav" onClick={handleDownload} disabled={loading}>
            {loading ? 'Loading...' : 'Download APK'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨ Fresh Meat Delivery</span>
          </div>
          <h1 className="hero-title">
            Get Premium Quality
            <span className="gradient-text"> Fresh Meat</span>
            <br />
            Delivered to Your Door
          </h1>
          <p className="hero-description">
            Experience the convenience of ordering fresh, premium quality meat with just a few taps. 
            Fast delivery, secure payments, and exclusive offers await you.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn-primary" 
              onClick={handleDownload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Downloading...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download APK Now
                </>
              )}
            </button>
            <a 
              href={EXPO_BUILD_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              View on Expo
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Orders Delivered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.8★</div>
              <div className="stat-label">App Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Sejas Fresh?</h2>
            <p className="section-description">
              Everything you need for a seamless meat delivery experience
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="download-section">
        <div className="container">
          <div className="download-card">
            <div className="download-content">
              <h2 className="download-title">Ready to Get Started?</h2>
              <p className="download-description">
                Download the Sejas Fresh app now and enjoy fresh meat delivery at your fingertips
              </p>
              <button 
                className="btn-download-large" 
                onClick={handleDownload}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download APK (Android)
                  </>
                )}
              </button>
              <p className="download-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Safe & Secure • No Registration Required
              </p>
            </div>
            <div className="download-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-preview">
                    <div className="app-header">Sejas Fresh</div>
                    <div className="app-content">
                      <div className="preview-item"></div>
                      <div className="preview-item"></div>
                      <div className="preview-item"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">🥩</span>
                <span className="logo-text">Sejas Fresh</span>
              </div>
              <p className="footer-description">
                Your trusted partner for fresh meat delivery. Quality guaranteed, delivered fresh.
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#download">Download</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href={EXPO_BUILD_URL} target="_blank" rel="noopener noreferrer">Help Center</a>
                <a href={EXPO_BUILD_URL} target="_blank" rel="noopener noreferrer">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Sejas Fresh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
