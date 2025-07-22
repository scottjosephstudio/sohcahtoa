"use client";

/**
 * Secure Storage Test Component
 * Use this component to test secure storage functionality in development
 */

import React, { useState, useEffect } from 'react';
import SecureStorage from '../lib/secureStorage.js';
import secureCartStorage from './cart/Utils/secureCartStorage.js';
import secureAuthStorage from './product-section/hooks/secureAuthStorage.js';

const SecureStorageTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addResult = (test, passed, message = '') => {
    setTestResults(prev => [...prev, { test, passed, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Check availability
      addResult('Secure Storage Available', SecureStorage.isSecureStorageAvailable());

      if (!SecureStorage.isSecureStorageAvailable()) {
        addResult('Using Fallback', true, 'localStorage fallback will be used');
        setIsRunning(false);
        return;
      }

      // Test 2: Session storage
      try {
        await SecureStorage.session.set('test_session', { message: 'Hello from session storage' }, { encrypt: true });
        const sessionData = await SecureStorage.session.get('test_session');
        addResult('Session Storage', sessionData?.message === 'Hello from session storage');
      } catch (error) {
        addResult('Session Storage', false, error.message);
      }

      // Test 3: IndexedDB storage
      try {
        await SecureStorage.database.store('test_db', { message: 'Hello from IndexedDB' });
        const dbData = await SecureStorage.database.get('test_db');
        addResult('IndexedDB Storage', dbData?.message === 'Hello from IndexedDB');
      } catch (error) {
        addResult('IndexedDB Storage', false, error.message);
      }

      // Test 4: Cart storage wrapper
      try {
        const testCartData = { selectedFont: { name: 'Test Font' } };
        await secureCartStorage.saveCartState(testCartData);
        const retrievedCart = await secureCartStorage.getCartState();
        addResult('Cart Storage Wrapper', retrievedCart?.selectedFont?.name === 'Test Font');
      } catch (error) {
        addResult('Cart Storage Wrapper', false, error.message);
      }

      // Test 5: Auth storage wrapper
      try {
        const testRegData = { email: 'test@example.com', firstName: 'John' };
        await secureAuthStorage.saveRegistrationData(testRegData);
        const retrievedRegData = await secureAuthStorage.getSavedRegistrationData();
        addResult('Auth Storage Wrapper', retrievedRegData?.email === 'test@example.com');
      } catch (error) {
        addResult('Auth Storage Wrapper', false, error.message);
      }

      // Test 6: Migration
      try {
        localStorage.setItem('test_migration', JSON.stringify({ migrated: true }));
        await SecureStorage.migrateFromLocalStorage(['test_migration']);
        const migratedData = await SecureStorage.session.get('test_migration');
        const localStorageData = localStorage.getItem('test_migration');
        addResult('Migration', migratedData?.migrated === true && !localStorageData);
      } catch (error) {
        addResult('Migration', false, error.message);
      }

      // Cleanup
      try {
        await SecureStorage.session.remove('test_session');
        await SecureStorage.database.delete('test_db');
        await secureCartStorage.clearCartData();
        await secureAuthStorage.clearAuthData();
        addResult('Cleanup', true);
      } catch (error) {
        addResult('Cleanup', false, error.message);
      }

    } catch (error) {
      addResult('Test Suite', false, error.message);
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep panel within viewport bounds
    const maxX = window.innerWidth - 300; // panel width
    const maxY = window.innerHeight - 400; // panel max height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: `${position.y}px`, 
        left: `${position.x}px`, 
        width: '300px', 
        maxHeight: '400px', 
        backgroundColor: '#1a1a1a', 
        color: '#fff', 
        padding: '15px', 
        borderRadius: '8px', 
        border: '1px solid #333',
        zIndex: 9999,
        overflowY: 'auto',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <h3 style={{ margin: '0 0 15px 0', color: '#00ff00' }}>
        🔒 Secure Storage Test
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={runTests} 
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#666' : '#00ff00',
            color: '#000',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            backgroundColor: '#ff4444',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      {totalTests > 0 && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: passedTests === totalTests ? '#004400' : '#440000',
          borderRadius: '4px'
        }}>
          <strong>Results: {passedTests}/{totalTests} tests passed</strong>
        </div>
      )}

      <div style={{ fontSize: '12px' }}>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '8px', 
              padding: '8px', 
              backgroundColor: result.passed ? '#004400' : '#440000',
              borderRadius: '4px',
              border: '1px solid #333'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{result.test}</span>
              <span style={{ color: result.passed ? '#00ff00' : '#ff4444' }}>
                {result.passed ? '✅' : '❌'}
              </span>
            </div>
            {result.message && (
              <div style={{ fontSize: '11px', color: '#ccc', marginTop: '4px' }}>
                {result.message}
              </div>
            )}
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
              {result.timestamp}
            </div>
          </div>
        ))}
      </div>

      {testResults.length === 0 && (
        <div style={{ color: '#888', fontStyle: 'italic' }}>
          Click "Run Tests" to test secure storage functionality
        </div>
      )}
    </div>
  );
};

export default SecureStorageTest; 