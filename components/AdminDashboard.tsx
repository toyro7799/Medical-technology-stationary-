import React, { useState, useMemo, useEffect } from 'react';
import { Upload, Plus, LogOut, CheckCircle, AlertCircle, Settings, FileText, Search, Edit, Trash2, X, ImageIcon, LayoutList, History, AlertTriangle, Lock, Banknote } from 'lucide-react';
import { CURRICULUM, YEARS, getSemestersForYear } from '../constants';
import { SheetType, Sheet } from '../types';
import { addSheet, setAdminPassword, addCustomSubject, getAllCustomSubjects, getSheets, deleteSheet, updateSheet, generateId } from '../services/storage';
import CustomSelect from './CustomSelect';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'settings'>('add');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>(undefined);

  // Manage State
  const [manageSearch, setManageSearch] = useState('');
  const [allSheets, setAllSheets] = useState<Sheet[]>([]);
  const [customSubjectsMap, setCustomSubjectsMap] = useState<Record<string, string[]>>({});
  
  // Recent Sheets (for Add Tab)
  const [recentSheets, setRecentSheets] = useState<Sheet[]>([]);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteImageUrl, setDeleteImageUrl] = useState<string | undefined>(undefined);

  // Form State
  const [year, setYear] = useState('');
  const [sem, setSem] = useState('');
  const [dept, setDept] = useState('');
  const [subject, setSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [docName, setDocName] = useState('');
  const [type, setType] = useState<SheetType>(SheetType.Theoretical);
  const [sheetNum, setSheetNum] = useState<number>(1);
  const [price, setPrice] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Settings State
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passCode, setPassCode] = useState('');
  const [msg, setMsg] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Force update trigger to reload data
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load sheets and custom subjects
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [sheets, customSubs] = await Promise.all([
                getSheets(),
                getAllCustomSubjects()
            ]);
            
            setAllSheets(sheets);
            setRecentSheets(sheets.slice(0, 3));
            setCustomSubjectsMap(customSubs);
        } catch (e) {
            console.error("Failed to load dashboard data", e);
            setMsg({ type: 'error', text: "Failed to load data from server." });
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [refreshKey]);

  // Derived
  const availableDepts = useMemo(() => year ? Object.keys(CURRICULUM[year] || {}) : [], [year]);
  const availableSems = useMemo(() => year ? getSemestersForYear(year) : [], [year]);
  
  // Auto-select "General" for Year 1
  useEffect(() => {
    if (year === 'Year 1') {
      setSem('General');
    }
  }, [year]);

  const availableSubjects = useMemo(() => {
    if (year && dept) {
      const baseSubjects = CURRICULUM[year][dept] || [];
      const customKey = `${year}_${dept}`;
      const customSubjects = customSubjectsMap[customKey] || [];
      // Merge and deduplicate
      return Array.from(new Set([...baseSubjects, ...customSubjects])).sort();
    }
    return [];
  }, [year, dept, customSubjectsMap]);

  const filteredManageSheets = useMemo(() => {
    if (!manageSearch) return allSheets;
    const lower = manageSearch.toLowerCase();
    return allSheets.filter(s => 
      s.subject.toLowerCase().includes(lower) || 
      s.doctorName.toLowerCase().includes(lower) || 
      s.department.toLowerCase().includes(lower)
    );
  }, [allSheets, manageSearch]);

  const resetForm = () => {
    setYear('');
    setSem('');
    setDept('');
    setSubject('');
    setIsCustomSubject(false);
    setDocName('');
    setType(SheetType.Theoretical);
    setSheetNum(1);
    setPrice('');
    setImageFile(null);
    setEditingId(null);
    setExistingImageUrl(undefined);
  };

  const handleStartEdit = (sheet: Sheet) => {
    setYear(sheet.year);
    setSem(sheet.semester);
    setDept(sheet.department);
    setSubject(sheet.subject);
    setDocName(sheet.doctorName);
    setType(sheet.type);
    setSheetNum(sheet.sheetNumber);
    setPrice(sheet.price ? sheet.price.toString() : '');
    setExistingImageUrl(sheet.imageUrl);
    setEditingId(sheet.id);
    setImageFile(null);
    setIsCustomSubject(false); 
    
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const promptDelete = (sheet: Sheet, e?: React.MouseEvent) => {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    setDeleteId(sheet.id);
    setDeleteImageUrl(sheet.imageUrl);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
        await deleteSheet(deleteId, deleteImageUrl);
        setMsg({ type: 'success', text: 'Sheet deleted successfully.' });
        if (editingId === deleteId) {
            resetForm();
        }
        setRefreshKey(prev => prev + 1);
    } catch (e) {
        setMsg({ type: 'error', text: 'Failed to delete sheet.' });
    } finally {
        setDeleteId(null);
        setDeleteImageUrl(undefined);
        setIsLoading(false);
        setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!year || !sem || !dept || !subject || !docName) {
      setMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setIsLoading(true);

    try {
        if (isCustomSubject) {
            const cleanSubject = subject.trim();
            await addCustomSubject(year, dept, cleanSubject);
            // Optimistic update for custom subjects map
            setCustomSubjectsMap(prev => ({
                ...prev,
                [`${year}_${dept}`]: [...(prev[`${year}_${dept}`] || []), cleanSubject]
            }));
        }

        // Handle Image Logic
        let finalImageUrl = existingImageUrl;
        if (imageFile) {
            const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            finalImageUrl = await toBase64(imageFile);
        }

        const sheetData: Sheet = {
            id: editingId || generateId(),
            year,
            semester: sem,
            department: dept,
            subject: subject.trim(),
            doctorName: docName,
            type,
            sheetNumber: sheetNum,
            price: price ? parseFloat(price) : 0,
            createdAt: editingId ? (allSheets.find(s => s.id === editingId)?.createdAt || Date.now()) : Date.now(),
            imageUrl: finalImageUrl
        };

        if (editingId) {
            await updateSheet(sheetData);
            setMsg({ type: 'success', text: 'Sheet updated successfully!' });
            resetForm();
        } else {
            await addSheet(sheetData);
            setMsg({ type: 'success', text: `Sheet uploaded successfully!` });
            setSubject('');
            setIsCustomSubject(false);
            setSheetNum(prev => prev < 30 ? prev + 1 : 1);
            setImageFile(null);
        }
        setRefreshKey(prev => prev + 1);
    } catch (e) {
        console.error(e);
        setMsg({ type: 'error', text: "Operation failed. Please try again." });
    } finally {
        setIsLoading(false);
        setTimeout(() => setMsg(null), 3000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passCode !== '59385939') {
       setMsg({ type: 'error', text: "Access Denied: Invalid Master Pass Code."});
       return;
    }

    if (newPass !== confirmPass) {
      setMsg({ type: 'error', text: "Passwords do not match."});
      return;
    }
    if (newPass.length < 6) {
      setMsg({ type: 'error', text: "Password must be at least 6 characters."});
      return;
    }
    
    setIsLoading(true);
    try {
        await setAdminPassword(newPass);
        setMsg({ type: 'success', text: "Security credentials updated."});
        setNewPass('');
        setConfirmPass('');
        setPassCode('');
    } catch (e) {
        setMsg({ type: 'error', text: "Failed to update password."});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {isLoading && (
          <div className="absolute inset-0 bg-white/50 z-[60] flex items-center justify-center backdrop-blur-[2px] rounded-xl">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Content Management System</p>
        </div>
        <div className="flex gap-2 flex-wrap">
            <button 
                onClick={() => { setActiveTab('add'); if (!editingId) resetForm(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm ${activeTab === 'add' ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
               {editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
               {editingId ? 'Editor' : 'Add Sheet'}
            </button>
            <button 
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm ${activeTab === 'manage' ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
                <LayoutList className="w-4 h-4" /> Manage
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border shadow-sm ${activeTab === 'settings' ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
                <Settings className="w-4 h-4" />
            </button>
            <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors text-sm font-medium shadow-sm ml-auto md:ml-0"
            >
            <LogOut className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Messages */}
      {msg && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 shadow-sm animate-[fadeIn_0.3s_ease-out] ${
          msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {msg.text}
        </div>
      )}

      {/* --- ADD / EDIT TAB --- */}
      {activeTab === 'add' && (
      <>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible relative z-10 transition-all animate-[fadeIn_0.3s_ease-out]">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              {editingId ? <Edit className="w-5 h-5 text-teal-600" /> : <Plus className="w-5 h-5 text-teal-600" />} 
              {editingId ? 'Edit Sheet' : 'New Study Sheet'}
            </h3>
            {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
                >
                  Cancel Edit
                </button>
            )}
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Classification - Column 1 - Highest Z-Index Group */}
            <div className="space-y-6 relative z-50">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">1</span>
                 <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Category</h4>
              </div>
              
              {/* Sequential Fields */}
              <div className="flex flex-col gap-5 z-20 relative">
                <div className="animate-[fadeIn_0.2s_ease-out]">
                  <CustomSelect
                    label="Year"
                    value={year}
                    onChange={(val) => { 
                      setYear(val); 
                      // Only clear downstream if not initially loading edit data (simplification: clear if user manually changes)
                      if (val !== year && !editingId) {
                           setSem(''); 
                           setDept('');
                      }
                    }}
                    options={YEARS}
                    placeholder="Select..."
                  />
                </div>
                
                {year && (
                  <div key={year} className="animate-[fadeIn_0.3s_ease-out]">
                    <CustomSelect
                      label="Semester"
                      value={sem}
                      onChange={setSem}
                      options={year === 'Year 1' ? ['General'] : availableSems}
                      placeholder="Select..."
                      disabled={year === 'Year 1'} 
                    />
                  </div>
                )}

                {sem && (
                  <div key={sem} className="animate-[fadeIn_0.3s_ease-out] z-10 relative">
                    <CustomSelect
                      label="Department"
                      value={dept}
                      onChange={setDept}
                      options={availableDepts}
                      placeholder="Select Department..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Details - Column 2 - Appears after Dept selected */}
            {dept && (
            <div key={dept} className="space-y-6 relative z-40 animate-[fadeIn_0.5s_ease-out]">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">2</span>
                 <h4 className="text-sm uppercase tracking-wider text-slate-500 font-bold">Content Details</h4>
              </div>
              
              <div className="relative z-20">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                <div className="flex flex-col gap-2">
                  {!isCustomSubject ? (
                    <CustomSelect
                      value={subject}
                      onChange={setSubject}
                      options={availableSubjects}
                      placeholder="Select Subject..."
                    />
                  ) : (
                     <input 
                      type="text" 
                      placeholder="Type new subject name..."
                      autoFocus
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-teal-500 ring-4 ring-teal-500/10 text-slate-800 focus:outline-none transition-all"
                    />
                  )}
                  
                  <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={() => { setIsCustomSubject(!isCustomSubject); if (!isCustomSubject) setSubject(''); }}
                        className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1"
                      >
                        {isCustomSubject ? (
                          <>Back to list selection</>
                        ) : (
                          <>+ Add a new subject not in list</>
                        )}
                      </button>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Doctor Name</label>
                <input 
                  type="text" 
                  value={docName} 
                  onChange={e => setDocName(e.target.value)} 
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none bg-slate-50/50 hover:bg-white transition-all hover:border-slate-300" 
                  placeholder="e.g. Dr. Ali" 
                />
              </div>
            </div>
            )}
            
            {/* Metadata - Full Width Row - Appears after Dept selected */}
            {dept && (
            <div key={`${dept}-meta`} className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 z-30 relative animate-[fadeIn_0.7s_ease-out]">
              <div className="z-30 relative">
                <CustomSelect
                  label="Material Type"
                  value={type}
                  onChange={setType}
                  options={[SheetType.Theoretical, SheetType.Practical, SheetType.Both]}
                  placeholder="Select..."
                />
              </div>
              <div className="z-20 relative">
                <CustomSelect
                  label="Sheet No."
                  value={sheetNum}
                  onChange={setSheetNum}
                  options={Array.from({length: 30}, (_, i) => i + 1)}
                  placeholder="Select..."
                />
              </div>
              
              {/* Price Field */}
              <div className="z-20 relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price (LYD)</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 bg-slate-50/50 hover:bg-white transition-all text-slate-800"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="z-10 relative">
                 <label className="block text-sm font-semibold text-slate-700 mb-2">File/Image (Optional)</label>
                 <div className="relative h-[50px]">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                    <div className="absolute inset-0 w-full h-full border border-dashed border-slate-300 rounded-xl text-sm text-slate-500 flex items-center justify-center gap-2 bg-slate-50 group-hover:bg-white transition-colors overflow-hidden">
                      {imageFile ? (
                          <span className="text-teal-600 font-medium flex items-center gap-2">
                               <CheckCircle className="w-4 h-4" /> {imageFile.name.substring(0, 15)}...
                          </span>
                      ) : existingImageUrl ? (
                          <div className="flex items-center gap-2 w-full h-full px-2">
                              <img src={existingImageUrl} className="h-8 w-8 object-cover rounded bg-slate-200" alt="Current" />
                              <span className="text-slate-600 text-xs flex-1 truncate">Current Image</span>
                              <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Change</span>
                          </div>
                      ) : (
                          <>
                              <Upload className="w-4 h-4" />
                              <span>Click to upload</span>
                          </>
                      )}
                    </div>
                 </div>
                 {existingImageUrl && !imageFile && (
                     <button 
                      type="button" 
                      onClick={() => setExistingImageUrl(undefined)}
                      className="text-[10px] text-red-500 hover:underline mt-1 ml-1"
                     >
                         Remove current image
                     </button>
                 )}
              </div>
            </div>
            )}
          </div>

          {dept && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end animate-[fadeIn_0.9s_ease-out]">
            <button disabled={isLoading} type="submit" className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {editingId ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingId ? 'Update Sheet' : 'Publish Sheet'}
            </button>
          </div>
          )}
        </form>

        {/* Recently Added Section (Below Form) */}
        {!editingId && recentSheets.length > 0 && (
          <div className="mt-8 animate-[fadeIn_0.5s_ease-out]">
             <div className="flex items-center gap-2 mb-4 px-2">
                <History className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-700">Recently Published</h3>
             </div>
             <div className="grid gap-3">
                {recentSheets.map(sheet => (
                  <div key={sheet.id} className="bg-white/60 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4 hover:bg-white transition-colors">
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                              <span className="font-semibold text-slate-700">{sheet.year}</span>
                              <span>•</span>
                              <span>{sheet.department}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 truncate">{sheet.subject}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                          <button onClick={() => handleStartEdit(sheet)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => promptDelete(sheet, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </>
      )}

      {/* --- MANAGE TAB --- */}
      {activeTab === 'manage' && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search by subject, doctor, or department..." 
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-white shadow-sm text-slate-800 placeholder:text-slate-400"
                    value={manageSearch}
                    onChange={e => setManageSearch(e.target.value)}
                />
            </div>

            <div className="grid gap-4">
                {filteredManageSheets.map(sheet => (
                    <div key={sheet.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 animate-[fadeIn_0.1s_ease-out] hover:shadow-md transition-shadow">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${sheet.type === SheetType.Practical ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{sheet.type}</span>
                                <span className="text-xs text-slate-400 font-medium">{sheet.year} <span className="mx-1">•</span> Sheet {sheet.sheetNumber}</span>
                                {sheet.price && sheet.price > 0 && (
                                   <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded ml-1">
                                     {sheet.price} LYD
                                   </span>
                                )}
                            </div>
                            <h4 className="font-bold text-slate-800 truncate text-lg">{sheet.subject}</h4>
                            <p className="text-sm text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span> Dr. {sheet.doctorName}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                            {sheet.imageUrl && (
                                <div className="hidden sm:block w-10 h-10 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 mr-2">
                                    <img src={sheet.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <button onClick={() => handleStartEdit(sheet)} className="p-2.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                                <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={(e) => promptDelete(sheet, e)} className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredManageSheets.length === 0 && (
                    <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No sheets found matching your search.</p>
                    </div>
                )}
            </div>
          </div>
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'settings' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 animate-[fadeIn_0.3s_ease-out]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <Settings className="w-6 h-6 text-slate-400" /> Security Settings
              </h3>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-500" /> Master Pass Code
                      </label>
                      <input 
                        type="password" 
                        value={passCode} 
                        onChange={e => setPassCode(e.target.value)} 
                        placeholder="Required for authorization"
                        className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all placeholder:text-slate-400" 
                      />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                      <label className="block text-sm font-medium text-slate-600 mb-1">New Admin Password</label>
                      <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Confirm New Password</label>
                      <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-xl focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all" />
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50">Update Credentials</button>
              </form>
          </div>
      )}

      {/* --- DELETE MODAL --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.1s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Sheet?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Are you sure you want to delete this sheet? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => { setDeleteId(null); setDeleteImageUrl(undefined); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    No, Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;