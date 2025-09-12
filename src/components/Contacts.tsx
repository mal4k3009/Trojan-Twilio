import React, { useState, useEffect, useCallback } from 'react';
import { Phone, FileText, Plus, Trash2, CheckCircle, AlertCircle, Download, Save, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { DatabaseService } from '../services/database';
import * as XLSX from 'xlsx';

interface Contact {
  id: string;
  name: string;
  phone: string;
  source: 'phone' | 'csv' | 'manual';
}

interface ContactsProps {
  onContactsChange?: (contacts: Contact[]) => void;
}

const Contacts: React.FC<ContactsProps> = ({ onContactsChange }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedContacts, setSavedContacts] = useState<Contact[]>([]);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Helper function to clean and format phone numbers
  const cleanPhoneNumber = (phone: string): string | null => {
    if (!phone || typeof phone !== 'string') return null;
    
    // Remove "p:" prefix if present
    let cleanPhone = phone.replace(/^p:\s*/, '').trim();
    
    // Remove all non-digit characters except +
    cleanPhone = cleanPhone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with + if it doesn't
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }
    
    // Validate phone number length (at least 7 digits)
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      return null;
    }
    
    return cleanPhone;
  };

  const loadSavedContacts = useCallback(async (preserveImported = false) => {
    setIsLoadingContacts(true);
    try {
      console.log('🔄 Loading contacts from database...');
      const saved = await DatabaseService.getSavedContacts();
      const savedContactsData: Contact[] = saved.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        source: contact.source as 'phone' | 'csv' | 'manual'
      }));
      
      console.log('✅ Loaded contacts from database:', savedContactsData);
      setSavedContacts(savedContactsData);
      
      if (preserveImported) {
        // When preserving imported contacts, merge with current contacts
        setContacts(prevContacts => {
          const currentImportedContacts = prevContacts.filter(contact => 
            !savedContactsData.some(saved => saved.phone === contact.phone)
          );
          
          const allContacts = [...savedContactsData, ...currentImportedContacts];
          onContactsChange?.(allContacts);
          
          // Reset unsaved changes if we're just loading from DB
          if (currentImportedContacts.length === 0) {
            setHasUnsavedChanges(false);
          }
          
          return allContacts;
        });
      } else {
        // Just load database contacts
        setContacts(savedContactsData);
        onContactsChange?.(savedContactsData);
        setHasUnsavedChanges(false);
      }
      
      if (savedContactsData.length > 0) {
        setImportStatus({
          type: 'success',
          message: `Loaded ${savedContactsData.length} contacts from database`
        });
      }
    } catch (error) {
      console.error('Error loading saved contacts:', error);
      setImportStatus({
        type: 'error',
        message: 'Failed to load contacts from database'
      });
    } finally {
      setIsLoadingContacts(false);
    }
  }, [onContactsChange]);

  // Load saved contacts on component mount
  useEffect(() => {
    loadSavedContacts(false);
  }, [loadSavedContacts]);

  // Save contacts to database
  const handleSaveContacts = async () => {
    if (contacts.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'No contacts to save'
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await DatabaseService.saveContacts(contacts);
      
      if (result.success) {
        setSavedContacts([...contacts]);
        setHasUnsavedChanges(false);
        setImportStatus({
          type: 'success',
          message: `Successfully saved ${result.savedCount} contacts to database`
        });
      } else {
        setImportStatus({
          type: 'error',
          message: `Failed to save contacts: ${result.errors.join(', ')}`
        });
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: `Error saving contacts: ${(error as Error).message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle CSV file import
  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportStatus({
        type: 'error',
        message: 'Please select a CSV file'
      });
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const importedContacts: Contact[] = [];

        // Skip header if present
        const startIndex = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('phone') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
          
          if (columns.length >= 2) {
            const name = columns[0] || `Contact ${i}`;
            const phone = columns[1];
            
            // Clean and validate phone number
            const cleanPhone = cleanPhoneNumber(phone);
            if (cleanPhone) {
              importedContacts.push({
                id: `csv_${Date.now()}_${i}`,
                name: name,
                phone: cleanPhone,
                source: 'csv'
              });
            }
          }
        }

        if (importedContacts.length > 0) {
          // Filter out contacts that already exist (by phone number)
          const uniqueImportedContacts = importedContacts.filter(imported => 
            !contacts.some(existing => existing.phone === imported.phone)
          );
          
          if (uniqueImportedContacts.length > 0) {
            const newContacts = [...contacts, ...uniqueImportedContacts];
            setContacts(newContacts);
            onContactsChange?.(newContacts);
            setHasUnsavedChanges(true);
            setImportStatus({
              type: 'success',
              message: `Successfully imported ${uniqueImportedContacts.length} new contacts${importedContacts.length > uniqueImportedContacts.length ? ` (${importedContacts.length - uniqueImportedContacts.length} duplicates skipped)` : ''}`
            });
          } else {
            setImportStatus({
              type: 'error',
              message: 'All contacts already exist in your list'
            });
          }
        } else {
          setImportStatus({
            type: 'error',
            message: 'No valid contacts found in CSV file'
          });
        }
      } catch {
        setImportStatus({
          type: 'error',
          message: 'Error parsing CSV file'
        });
      } finally {
        setIsImporting(false);
        setShowImportModal(false);
      }
    };

    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Error reading file'
      });
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  // Handle Excel file import
  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isExcelFile = file.name.toLowerCase().endsWith('.xlsx') || 
                       file.name.toLowerCase().endsWith('.xls') ||
                       file.name.toLowerCase().endsWith('.xlsm');
    
    if (!isExcelFile) {
      setImportStatus({
        type: 'error',
        message: 'Please select an Excel file (.xlsx, .xls, or .xlsm)'
      });
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log('📊 Excel data:', jsonData);
        
        if (jsonData.length < 2) {
          setImportStatus({
            type: 'error',
            message: 'Excel file must contain at least a header row and one data row'
          });
          return;
        }

        const importedContacts: Contact[] = [];
        const headers = jsonData[0] as string[];
        
        // Find the correct column indices
        const nameColumnIndex = headers.findIndex(header => 
          header && header.toLowerCase().includes('name')
        );
        const phoneColumnIndex = headers.findIndex(header => 
          header && header.toLowerCase().includes('phone')
        );

        if (nameColumnIndex === -1 || phoneColumnIndex === -1) {
          setImportStatus({
            type: 'error',
            message: 'Excel file must contain "Name" and "Phone" columns'
          });
          return;
        }

        console.log(`📋 Found columns - Name: ${nameColumnIndex}, Phone: ${phoneColumnIndex}`);

        // Process data rows (skip header)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          const name = row[nameColumnIndex]?.toString()?.trim() || `Contact ${i}`;
          const phone = row[phoneColumnIndex]?.toString()?.trim();
          
          if (!phone) continue;

          // Clean and validate phone number
          const cleanPhone = cleanPhoneNumber(phone);
          if (cleanPhone) {
            importedContacts.push({
              id: `excel_${Date.now()}_${i}`,
              name: name,
              phone: cleanPhone,
              source: 'csv' // Use 'csv' as source for Excel imports
            });
          }
        }

        if (importedContacts.length > 0) {
          // Filter out contacts that already exist (by phone number)
          const uniqueImportedContacts = importedContacts.filter(imported => 
            !contacts.some(existing => existing.phone === imported.phone)
          );
          
          if (uniqueImportedContacts.length > 0) {
            const newContacts = [...contacts, ...uniqueImportedContacts];
            setContacts(newContacts);
            onContactsChange?.(newContacts);
            setHasUnsavedChanges(true);
            setImportStatus({
              type: 'success',
              message: `Successfully imported ${uniqueImportedContacts.length} new contacts from Excel${importedContacts.length > uniqueImportedContacts.length ? ` (${importedContacts.length - uniqueImportedContacts.length} duplicates skipped)` : ''}`
            });
          } else {
            setImportStatus({
              type: 'error',
              message: 'All contacts already exist in your list'
            });
          }
        } else {
          setImportStatus({
            type: 'error',
            message: 'No valid contacts found in Excel file'
          });
        }
      } catch (error) {
        console.error('Excel import error:', error);
        setImportStatus({
          type: 'error',
          message: 'Error parsing Excel file. Please ensure it\'s a valid Excel file.'
        });
      } finally {
        setIsImporting(false);
        setShowImportModal(false);
      }
    };

    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Error reading Excel file'
      });
      setIsImporting(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle phone contacts import
  const handlePhoneContactsImport = async () => {
    if (!('contacts' in navigator) || !navigator.contacts) {
      setImportStatus({
        type: 'error',
        message: 'Phone contacts are not supported in this browser'
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // TypeScript doesn't have types for Contact Picker API yet
      const contactsAPI = (navigator as { contacts?: { select: (props: string[], options: { multiple: boolean }) => Promise<unknown[]> } }).contacts;
      if (!contactsAPI) {
        throw new Error('Contact Picker API not supported');
      }
      const selectedContacts = await contactsAPI.select(['name', 'tel'], { multiple: true });
      const importedContacts: Contact[] = [];

      selectedContacts.forEach((contactData: unknown, index: number) => {
        const contact = contactData as { name?: string[]; tel?: string[] };
        if (contact.tel && contact.tel.length > 0) {
          contact.tel.forEach((phone: string, phoneIndex: number) => {
            const cleanPhone = cleanPhoneNumber(phone);
            if (cleanPhone) {
              importedContacts.push({
                id: `phone_${Date.now()}_${index}_${phoneIndex}`,
                name: contact.name?.[0] || `Contact ${index + 1}`,
                phone: cleanPhone,
                source: 'phone'
              });
            }
          });
        }
      });

      if (importedContacts.length > 0) {
        // Filter out contacts that already exist (by phone number)
        const uniqueImportedContacts = importedContacts.filter(imported => 
          !contacts.some(existing => existing.phone === imported.phone)
        );
        
        if (uniqueImportedContacts.length > 0) {
          const newContacts = [...contacts, ...uniqueImportedContacts];
          setContacts(newContacts);
          onContactsChange?.(newContacts);
          setHasUnsavedChanges(true);
          setImportStatus({
            type: 'success',
            message: `Successfully imported ${uniqueImportedContacts.length} new contacts from phone${importedContacts.length > uniqueImportedContacts.length ? ` (${importedContacts.length - uniqueImportedContacts.length} duplicates skipped)` : ''}`
          });
        } else {
          setImportStatus({
            type: 'error',
            message: 'All phone contacts already exist in your list'
          });
        }
      } else {
        setImportStatus({
          type: 'error',
          message: 'No valid phone contacts found'
        });
      }
    } catch (error) {
      const errorMessage = (error as Error).name === 'NotAllowedError' 
        ? 'Permission denied to access phone contacts'
        : 'Error importing phone contacts';
      
      setImportStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsImporting(false);
      setShowImportModal(false);
    }
  };

  // Delete contact
  const handleDeleteContact = async (contactId: string) => {
    const contactToDelete = contacts.find(c => c.id === contactId);
    if (!contactToDelete) return;

    setDeletingContactId(contactId);
    
    try {
      // Delete from database first
      const result = await DatabaseService.deleteContact(contactId, contactToDelete.phone);
      
      if (result.success) {
        // If database deletion was successful, remove from UI
        const newContacts = contacts.filter(c => c.id !== contactId);
        setContacts(newContacts);
        onContactsChange?.(newContacts);
        
        // Update saved contacts list as well
        setSavedContacts(prev => prev.filter(c => c.id !== contactId));
        
        setImportStatus({
          type: 'success',
          message: `Contact "${contactToDelete.name}" deleted successfully`
        });
      } else {
        // If database deletion failed, still remove from UI but show warning
        const newContacts = contacts.filter(c => c.id !== contactId);
        setContacts(newContacts);
        onContactsChange?.(newContacts);
        setHasUnsavedChanges(true);
        
        setImportStatus({
          type: 'error',
          message: `Contact removed from list but may still exist in database: ${result.error}`
        });
      }
    } catch (error) {
      // If there's an error, still remove from UI
      const newContacts = contacts.filter(c => c.id !== contactId);
      setContacts(newContacts);
      onContactsChange?.(newContacts);
      setHasUnsavedChanges(true);
      
      setImportStatus({
        type: 'error',
        message: `Error deleting contact: ${(error as Error).message}`
      });
    } finally {
      setDeletingContactId(null);
    }
  };

  // Export contacts to CSV
  const handleExportContacts = () => {
    if (contacts.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'No contacts to export'
      });
      return;
    }

    const csvContent = [
      'Name,Phone,Source',
      ...contacts.map(contact => `"${contact.name}","${contact.phone}","${contact.source}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setImportStatus({
      type: 'success',
      message: 'Contacts exported successfully'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Contacts ({contacts.length})
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {savedContacts.length} saved in database • {contacts.length - savedContacts.filter(saved => contacts.some(c => c.phone === saved.phone)).length} unsaved
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadSavedContacts(true)}
              disabled={isLoadingContacts}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh contacts from database"
            >
              {isLoadingContacts ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-gray-500"></div>
              ) : (
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">{isLoadingContacts ? 'Loading...' : 'Refresh'}</span>
            </button>
            <a
              href="/sample-contacts.csv"
              download="sample-contacts.csv"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">CSV Template</span>
            </a>
            <a
              href="/sample-contacts.xlsx"
              download="sample-contacts.xlsx"
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Excel Template</span>
            </a>
            <button
              onClick={handleExportContacts}
              disabled={contacts.length === 0}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            {(hasUnsavedChanges || contacts.some(contact => !savedContacts.some(saved => saved.phone === contact.phone))) && (
              <button
                onClick={handleSaveContacts}
                disabled={isSaving || contacts.length === 0}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save to Database'}</span>
              </button>
            )}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Import Contacts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {importStatus.type && (
        <div className={`mx-4 sm:mx-6 mt-4 p-3 rounded-lg flex items-center space-x-2 ${
          importStatus.type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {importStatus.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="text-sm">{importStatus.message}</span>
        </div>
      )}

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Phone className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              No contacts yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 px-4">
              Import contacts from your phone or CSV file to get started
            </p>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Import Contacts</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {contact.name}
                      </div>
                      {savedContacts.some(saved => saved.phone === contact.phone) ? (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span>Saved</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full w-fit">
                          <AlertCircle className="w-3 h-3" />
                          <span>Unsaved</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1 sm:space-x-2">
                      <span className="truncate">{contact.phone}</span>
                      <span>•</span>
                      <span className="capitalize">{contact.source}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  disabled={deletingContactId === contact.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {deletingContactId === contact.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Import Contacts
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Phone Contacts Import */}
              <button
                onClick={handlePhoneContactsImport}
                disabled={isImporting}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    Import from Phone
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Access your device contacts
                  </div>
                </div>
              </button>

              {/* CSV Import */}
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      Import from CSV
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Upload a CSV file with Name, Phone columns
                    </div>
                  </div>
                </div>
              </div>

              {/* Excel Import */}
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls,.xlsm"
                  onChange={handleExcelImport}
                  disabled={isImporting}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      Import from Excel
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Upload Excel file with Name, Phone columns (supports p: prefix)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
                className="px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>

            {isImporting && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-green-500"></div>
                <span>Importing contacts...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
