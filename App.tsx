import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { X, ShieldCheck, KeyRound, CheckCircle } from 'lucide-react';
import SecretTrigger from './components/SecretTrigger';
import StudentView from './components/StudentView';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';
import { getAdminPassword } from './services/storage';

const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Animation States
  const [isUnlockAnimating, setIsUnlockAnimating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Secret Trigger Handler
  const handleSecretTrigger = () => {
    if (isAdminLoggedIn) return;
    setShowLoginModal(true);
    setPasswordInput('');
    setLoginError(false);
    setIsUnlockAnimating(false);
    setLoadingProgress(0);
  };

  // Login Verification
  const verifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = await getAdminPassword();
    if (passwordInput === currentPass) {
      setLoginError(false);
      setIsUnlockAnimating(true);
      
      // Start Progress Bar
      setTimeout(() => setLoadingProgress(100), 50);

      // Delay to show animation before switching
      setTimeout(() => {
        setIsAdminLoggedIn(true);
        setShowLoginModal(false);
        // Reset internal states after modal closes
        setTimeout(() => {
             setIsUnlockAnimating(false);
             setLoadingProgress(0);
             setPasswordInput('');
        }, 300);
      }, 2000);
    } else {
      setLoginError(true);
    }
  };

  const logout = () => {
    setIsAdminLoggedIn(false);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <SecretTrigger onUnlock={handleSecretTrigger} className="flex items-center gap-3 group">
              <div className="h-12 w-12 text-teal-600 group-active:scale-95 transition-transform">
                <Logo className="w-full h-full" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">
                Medical Technology <span className="text-teal-600">Stationery</span>
              </span>
            </SecretTrigger>

            {isAdminLoggedIn && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider">
                Admin Mode
              </span>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow bg-slate-50">
          {isAdminLoggedIn ? (
            <AdminDashboard onLogout={logout} />
          ) : (
            <StudentView />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-6">
            
            {/* Social Media Links */}
            <div className="flex items-center gap-6">
              <a 
                href="https://www.facebook.com/share/1BsdNMPMmj/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 hover:border-blue-200 transition-all duration-300 transform hover:scale-110"
                title="Visit us on Facebook"
              >
                {/* Facebook Icon SVG */}
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              
              <a 
                href="https://api.whatsapp.com/send?phone=%2B218918501986" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600 border border-slate-200 hover:border-green-200 transition-all duration-300 transform hover:scale-110"
                title="Contact via WhatsApp"
              >
                {/* WhatsApp Icon SVG */}
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                </svg>
              </a>
            </div>

            <div className="text-center text-slate-400 text-sm">
              <p>&copy; 2025 Medical Technical Stationery. All rights reserved.</p>
              <p className="mt-1 text-slate-300 text-xs">Developed by Youssef Qaisim Al-Mansouri</p>
            </div>
          </div>
        </footer>

        {/* Professional Admin Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative ring-1 ring-slate-900/5 transition-all duration-500 transform scale-100">
              
              {/* Close Button */}
              {!isUnlockAnimating && (
                <button 
                    onClick={() => setShowLoginModal(false)} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full z-10"
                >
                    <X className="w-4 h-4" />
                </button>
              )}

              {/* Content Area */}
              <div className="min-h-[320px] flex flex-col justify-center">
                  {!isUnlockAnimating ? (
                    // --- LOGIN FORM STATE ---
                    <div className="p-8 text-center animate-[fadeIn_0.3s_ease-out]">
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-5">
                            <ShieldCheck className="w-8 h-8 text-teal-600" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2">Admin Portal</h3>
                        <p className="text-slate-500 text-sm mb-6">
                          Please verify your credentials to access the content management system.
                        </p>
                    
                        <form onSubmit={verifyPassword} className="space-y-4">
                          <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-slate-400" />
                              </div>
                              <input
                                type="password"
                                autoFocus
                                placeholder="Enter Passcode"
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${
                                    loginError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                                } rounded-xl outline-none transition-all focus:ring-4 text-slate-800 placeholder:text-slate-400`}
                                value={passwordInput}
                                onChange={(e) => { setPasswordInput(e.target.value); setLoginError(false); }}
                              />
                          </div>
                          
                          <button type="submit" className="w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
                              Sign In
                          </button>
                        </form>
                    </div>
                  ) : (
                    // --- SUCCESS ANIMATION STATE ---
                    <div className="p-12 text-center flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center relative scale-110 transition-transform duration-700">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Authenticated</h3>
                        <p className="text-slate-500 text-sm mb-8">
                            Redirecting to dashboard...
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-teal-500 rounded-full transition-all duration-[1500ms] ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </HashRouter>
  );
};

export default App;