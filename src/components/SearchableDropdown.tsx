import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { Signer } from '../types';

interface SearchableDropdownProps {
  signers: Signer[];
  selectedSigners: Signer[];
  onSignerToggle: (signer: Signer) => void;
  placeholder?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  signers,
  selectedSigners,
  onSignerToggle,
  placeholder = 'Pilih Penandatangan',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSigners = signers.filter((signer) =>
    signer.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (signer.jabatan ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSelected = (signer: Signer) =>
    selectedSigners.some((selected) => selected.id === signer.id);

  // Highlight pencarian
  const highlightMatch = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSigners.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredSigners.length) % filteredSigners.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const signer = filteredSigners[highlightedIndex];
      if (signer) {
        onSignerToggle(signer);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full p-3 border-2 border-gray-200 rounded-lg cursor-pointer bg-white hover:border-green-400 transition-colors duration-200 flex items-center justify-between"
        onClick={() => {
          setIsOpen(!isOpen);
          setHighlightedIndex(0);
        }}
      >
        <span className="text-gray-700">
          {selectedSigners.length > 0
            ? `${selectedSigners.length} penandatangan dipilih`
            : placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-gray-200 rounded-lg mt-1 shadow-xl max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama atau jabatan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredSigners.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                Tidak ada penandatangan yang ditemukan
              </div>
            ) : (
              filteredSigners.map((signer, index) => (
                <div
                  key={signer.id}
                  className={`p-3 hover:bg-green-50 cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                    isSelected(signer) ? 'bg-green-50 text-green-700' : 'text-gray-700'
                  } ${highlightedIndex === index ? 'bg-green-100' : ''}`}
                  onClick={() => onSignerToggle(signer)}
                >
                  <div>
                    <div className="font-medium">{highlightMatch(signer.nama)}</div>
                    <div className="text-sm text-gray-500">
                      {highlightMatch(signer.jabatan ?? '')}
                    </div>
                  </div>
                  {isSelected(signer) && <Check className="w-5 h-5 text-green-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
