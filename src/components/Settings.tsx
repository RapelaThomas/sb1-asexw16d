import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, DollarSign, Plus, Trash2, Save, CheckCircle, RotateCcw } from 'lucide-react';
import { UserPreferences, Currency, NotificationState } from '../types';
import { defaultCurrencies } from '../utils/calculations';
import { useTheme } from '../contexts/ThemeContext';
import { useFinancialData } from '../hooks/useFinancialData';

interface SettingsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: UserPreferences) => void;
}

const Settings: React.FC<SettingsProps> = ({ preferences, onUpdatePreferences }) => {
  const { theme, toggleTheme } = useTheme();
  const { resetAllData } = useFinancialData();
  const [formData, setFormData] = useState(preferences);
  const [customCurrency, setCustomCurrency] = useState({ code: '', symbol: '', name: '' });
  const [showCustomCurrency, setShowCustomCurrency] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState(defaultCurrencies);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences(formData);
    showNotification('Settings saved successfully!', 'success');
  };

  const handleCurrencyChange = (currency: Currency) => {
    setFormData({ ...formData, currency });
  };

  const addCustomCurrency = () => {
    if (customCurrency.code && customCurrency.symbol && customCurrency.name) {
      const newCurrency = { ...customCurrency };
      setAvailableCurrencies(prev => [...prev, newCurrency]);
      setFormData({ ...formData, currency: newCurrency });
      setCustomCurrency({ code: '', symbol: '', name: '' });
      setShowCustomCurrency(false);
      showNotification(`Added ${newCurrency.name} currency`, 'success');
    }
  };

  const removeCustomCurrency = (currencyCode: string) => {
    if (!defaultCurrencies.find(c => c.code === currencyCode)) {
      setAvailableCurrencies(prev => prev.filter(c => c.code !== currencyCode));
      if (formData.currency.code === currencyCode) {
        setFormData({ ...formData, currency: defaultCurrencies[0] });
      }
      showNotification('Currency removed', 'info');
    }
  };

  const handleResetData = async () => {
    const success = await resetAllData();
    if (success) {
      showNotification('All data has been reset successfully!', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <CheckCircle className="h-5 w-5" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="text-gray-600 dark:text-gray-300">Customize your financial management experience</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {theme === 'light' ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {theme === 'light' ? 'Light mode' : 'Dark mode'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Currency Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Currency</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Currency
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableCurrencies.map((currency) => (
                    <div key={currency.code} className="relative">
                      <button
                        type="button"
                        onClick={() => handleCurrencyChange(currency)}
                        className={`w-full p-3 text-left rounded-lg border transition-colors duration-200 ${
                          formData.currency.code === currency.code
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {currency.symbol} {currency.code}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{currency.name}</p>
                          </div>
                          {!defaultCurrencies.find(c => c.code === currency.code) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCustomCurrency(currency.code);
                              }}
                              className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Currency */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowCustomCurrency(!showCustomCurrency)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom Currency
                </button>

                {showCustomCurrency && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Code
                        </label>
                        <input
                          type="text"
                          value={customCurrency.code}
                          onChange={(e) => setCustomCurrency({ ...customCurrency, code: e.target.value.toUpperCase() })}
                          placeholder="KES"
                          maxLength={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Symbol
                        </label>
                        <input
                          type="text"
                          value={customCurrency.symbol}
                          onChange={(e) => setCustomCurrency({ ...customCurrency, symbol: e.target.value })}
                          placeholder="KSh"
                          maxLength={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={customCurrency.name}
                          onChange={(e) => setCustomCurrency({ ...customCurrency, name: e.target.value })}
                          placeholder="Kenyan Shilling"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button
                        type="button"
                        onClick={addCustomCurrency}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
                      >
                        Add Currency
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCustomCurrency(false)}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Strategy */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Strategy
                </label>
                <select
                  id="strategy"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="debt-focused">Debt-Focused (70% to debt)</option>
                  <option value="balanced">Balanced Approach</option>
                  <option value="savings-focused">Savings-Focused</option>
                </select>
              </div>
              <div>
                <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Tolerance
                </label>
                <select
                  id="riskTolerance"
                  value={formData.riskTolerance}
                  onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Other Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Other Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergencyFundMonths" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emergency Fund Target (months)
                </label>
                <input
                  type="number"
                  id="emergencyFundMonths"
                  value={formData.emergencyFundMonths}
                  onChange={(e) => setFormData({ ...formData, emergencyFundMonths: parseInt(e.target.value) || 6 })}
                  min="3"
                  max="12"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Daily Reminder Time
                </label>
                <input
                  type="time"
                  id="reminderTime"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoAllocate"
                  checked={formData.autoAllocate}
                  onChange={(e) => setFormData({ ...formData, autoAllocate: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="autoAllocate" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable automatic allocation recommendations
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSuggestStrategy"
                  checked={formData.autoSuggestStrategy}
                  onChange={(e) => setFormData({ ...formData, autoSuggestStrategy: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="autoSuggestStrategy" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Let AI automatically suggest the best financial strategy
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableRecurringTransactions"
                  checked={formData.enableRecurringTransactions || false}
                  onChange={(e) => setFormData({ ...formData, enableRecurringTransactions: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="enableRecurringTransactions" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable recurring transactions automation
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableAICategories"
                  checked={formData.enableAICategories || false}
                  onChange={(e) => setFormData({ ...formData, enableAICategories: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="enableAICategories" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable AI expense categorization
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-300">Reset All Data</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Permanently delete all your financial data and reset everything to zero. This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All Data
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;