import { useState } from 'react'
import './App.css'

// Google Drive file ID for direct download
const GOOGLE_DRIVE_FILE_ID = '1TgbLa_Z5iR5pbhw3wvC6Sp4qw2s7osv0'

// Expo build page URL (for reference)
const EXPO_BUILD_URL = 'https://expo.dev/accounts/prabii/projects/MeatDeliveryUserApp/builds/ce7cf39e-12d0-455c-8118-35f29183834d'

function App() {
  const [loading, setLoading] = useState(false)

  // Features of the app
  const features = [
    {
      icon: '/images/icon.png',
      iconType: 'image',
      title: 'Fresh Meat Delivery',
      description: 'Get premium quality fresh meat delivered right to your doorstep'
    },
    {
      icon: '/images/bike-delivery.png',
      iconType: 'image',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery service to ensure freshness'
    },
    {
      icon: '📱',
      iconType: 'emoji',
      title: 'Easy Ordering',
      description: 'Simple and intuitive interface for seamless ordering experience'
    },
    {
      icon: '🎯',
      iconType: 'emoji',
      title: 'Track Orders',
      description: 'Real-time order tracking to know exactly when your order arrives'
    },
    {
      icon: '💳',
      iconType: 'emoji',
      title: 'Secure Payment',
      description: 'Multiple payment options with secure and encrypted transactions'
    },
    {
      icon: '🎁',
      iconType: 'emoji',
      title: 'Exclusive Offers',
      description: 'Special discounts and coupons for regular customers'
    }
  ]

  // Handle direct APK download - no redirects, immediate download
  const handleDownload = async () => {
    setLoading(true)
    try {
      // Use Google Drive direct download with confirm parameter to bypass virus scan warning
      const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}&confirm=t`
      
      // Fetch the file as a blob for direct download
      const response = await fetch(directDownloadUrl, {
        method: 'GET',
        mode: 'cors',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch APK')
      }
      
      // Convert response to blob
      const blob = await response.blob()
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'SejasFresh.apk'
      link.style.display = 'none'
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
      
    } catch (error) {
      console.error('Error downloading APK:', error)
      // If fetch fails, try direct link download as fallback
      try {
        const directLink = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}&confirm=t`
        const link = document.createElement('a')
        link.href = directLink
        link.download = 'SejasFresh.apk'
        link.target = '_self'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError)
        alert('Download failed. Please try again or contact support.')
      }
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
            <img src="/images/sejas-logo.png" alt="Sejas Fresh" className="logo-image" />
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
          <img src="/images/landing-screen-bg.jpg" alt="Background" className="hero-bg-image" />
          <div className="gradient-overlay"></div>
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
                <div className="feature-icon">
                  {feature.iconType === 'image' ? (
                    <img src={feature.icon} alt={feature.title} className="feature-image" />
                  ) : (
                    <span>{feature.icon}</span>
                  )}
                </div>
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
                  <img src="/images/app-screenshot.png" alt="Sejas Fresh App" className="app-screenshot" />
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
                <img src="/images/sejas-logo.png" alt="Sejas Fresh" className="logo-image" />
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
