import React, { useState } from 'react';
import { Menu, X, Home, Calendar, LogIn, ArrowLeft } from 'lucide-react';
import { Church } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentChurch: Church | null;
  onExitChurch: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, currentChurch, onExitChurch }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Início', icon: <Home size={18} /> },
    { id: 'events', label: 'Eventos', icon: <Calendar size={18} /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={onExitChurch}
              className="mr-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Trocar Igreja"
            >
              <ArrowLeft size={20} />
            </button>
            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveTab('home')}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              >
                {currentChurch?.name.charAt(0) || 'E'}
              </div>
              <span className="text-xl font-bold text-gray-800 hidden md:block">
                {currentChurch?.name || 'Ecclesia'}
              </span>
              <span className="text-lg font-bold text-gray-800 md:hidden block truncate max-w-[150px]">
                {currentChurch?.name || 'Ecclesia'}
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('login')}
              className="ml-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
            >
              <LogIn size={18} className="mr-2" />
              Área Administrativa
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-3 py-4 rounded-md text-base font-medium ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setActiveTab('login');
                setIsOpen(false);
              }}
              className="w-full flex items-center px-3 py-4 mt-2 text-base font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
            >
              <LogIn size={18} className="mr-3" />
              Área Administrativa
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;