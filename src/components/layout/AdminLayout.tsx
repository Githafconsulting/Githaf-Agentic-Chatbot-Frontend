import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  FileText,
  MessageSquare,
  Flag,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
  Settings,
  Trash2,
  Brain,
  Bot
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { slideInLeft } from '../../utils/animations';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSelector } from '../LanguageSelector';

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: t('nav.analytics'), icon: BarChart3, color: 'text-blue-400' },
    { path: '/admin/documents', label: t('nav.knowledgeBase'), icon: FileText, color: 'text-green-400' },
    { path: '/admin/conversations', label: t('nav.conversations'), icon: MessageSquare, color: 'text-purple-400' },
    { path: '/admin/flagged', label: t('nav.flaggedQueries'), icon: Flag, color: 'text-red-400' },
    { path: '/admin/learning', label: t('nav.learning'), icon: Brain, color: 'text-emerald-400' },
    { path: '/admin/users', label: t('nav.teamMembers'), icon: Users, color: 'text-amber-400' },
    { path: '/admin/chatbot', label: 'Chatbot Config', icon: Bot, color: 'text-cyan-400' },
    { path: '/admin/widget', label: t('nav.widgetSettings'), icon: Settings, color: 'text-pink-400' },
    { path: '/admin/settings', label: t('nav.systemSettings'), icon: Settings, color: 'text-indigo-400' },
    { path: '/admin/deleted', label: t('nav.trash'), icon: Trash2, color: 'text-orange-400' },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile Header */}
      <motion.div
        className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 z-40 shadow-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/githaf_fav.png"
              alt="Githaf Logo"
              className="w-10 h-10 rounded-xl shadow-lg object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-slate-300">Githaf Consulting</p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-50">
            <LanguageSelector />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X size={24} className="text-slate-200" />
              ) : (
                <Menu size={24} className="text-slate-200" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            <motion.aside
              className="lg:hidden fixed top-[60px] left-0 bottom-0 w-80 bg-slate-900 border-r border-slate-700 z-50 overflow-y-auto shadow-2xl"
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <nav className="p-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-white' : item.color} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <ChevronRight size={18} className="ml-auto" />}
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-slate-700">
                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    <Home size={20} className="text-slate-300" />
                    <span className="font-medium">{t('nav.backToHome')}</span>
                  </Link>

                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all mt-2"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">{t('nav.signOut')}</span>
                  </button>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-72 bg-slate-900 border-r border-slate-700 shadow-2xl z-30">
        {/* Logo & Controls - Fixed at top */}
        <div className="flex-shrink-0 p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/githaf_fav.png"
              alt="Githaf Logo"
              className="w-12 h-12 rounded-2xl shadow-lg object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-slate-300">Githaf Consulting</p>
            </div>
          </div>

          {/* Language & Theme Controls */}
          <div className="flex items-center gap-2 relative z-50">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-6 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : item.color} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight size={18} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions - Fixed at bottom */}
        <div className="flex-shrink-0 p-6 pt-4 space-y-2 border-t border-slate-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Home size={20} className="text-slate-300" />
            <span className="font-medium">{t('nav.backToHome')}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('nav.signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-[60px] lg:pt-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
