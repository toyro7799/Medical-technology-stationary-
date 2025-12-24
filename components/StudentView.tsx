import React, { useState, useEffect, useMemo } from 'react';
import { Bell, BellRing, FileText, Eye, Filter, Calendar, BookOpen, GraduationCap, X, Book, MessageCircle, User, Image as ImageIcon, Search } from 'lucide-react';
import { CURRICULUM, YEARS, getSemestersForYear } from '../constants';
import { Sheet, SheetType } from '../types';
import { getSheets, isSubscribedToTopic, subscribeToTopic } from '../services/storage';
import CustomSelect from './CustomSelect';

const StudentView: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedSem, setSelectedSem] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [allSheets, setAllSheets] = useState<Sheet[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load sheets initially
  useEffect(() => {
    const fetchSheets = async () => {
        setIsLoading(true);
        try {
            const data = await getSheets();
            setAllSheets(data);
        } catch (error) {
            console.error("Error fetching sheets for student view", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchSheets();
    
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  // Update Subscription Status when filters change
  useEffect(() => {
    if (selectedYear && selectedDept && selectedSem) {
      const topic = `${selectedYear}_${selectedDept}_${selectedSem}`;
      setIsSubscribed(isSubscribedToTopic(topic));
    } else {
      setIsSubscribed(false);
    }
  }, [selectedYear, selectedDept, selectedSem]);

  // Derived Logic for Dropdowns
  const availableDepts = useMemo(() => {
    if (!selectedYear) return [];
    return Object.keys(CURRICULUM[selectedYear] || {});
  }, [selectedYear]);

  const availableSems = useMemo(() => {
    if (!selectedYear) return [];
    return getSemestersForYear(selectedYear);
  }, [selectedYear]);

  const availableSubjects = useMemo(() => {
    if (!selectedYear || !selectedDept) return [];
    const baseSubjects = CURRICULUM[selectedYear][selectedDept] || [];
    // Also include subjects from uploaded sheets that might be custom
    const sheetSubjects = allSheets
      .filter(s => s.year === selectedYear && s.department === selectedDept)
      .map(s => s.subject);
    
    return Array.from(new Set([...baseSubjects, ...sheetSubjects])).sort();
  }, [selectedYear, selectedDept, allSheets]);

  // Auto-select "General" for Year 1 or reset selection
  useEffect(() => {
    if (selectedYear === 'Year 1') {
      setSelectedSem('General');
    }
  }, [selectedYear]);

  // Filtered Feed
  const filteredSheets = useMemo(() => {
    // 1. Search Priority
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return allSheets.filter(sheet => 
            sheet.subject.toLowerCase().includes(query) ||
            sheet.doctorName.toLowerCase().includes(query) ||
            sheet.department.toLowerCase().includes(query) ||
            sheet.year.toLowerCase().includes(query)
        );
    }

    // 2. Strict Filter Priority
    if (!selectedYear || !selectedDept || !selectedSem || !selectedSubject) return [];

    return allSheets.filter(sheet => {
      return (
        sheet.year === selectedYear &&
        sheet.department === selectedDept &&
        sheet.semester === selectedSem &&
        sheet.subject === selectedSubject
      );
    });
  }, [allSheets, searchQuery, selectedYear, selectedDept, selectedSem, selectedSubject]);

  const handleNotificationClick = async () => {
    if (!selectedYear || !selectedDept || !selectedSem) {
      alert("Please select Year, Department, and Semester to subscribe.");
      return;
    }

    if (!('Notification' in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    if (permissionState === 'denied') {
      alert("Notifications are blocked. Please enable them in your browser settings.");
      return;
    }

    if (permissionState === 'default') {
      const result = await Notification.requestPermission();
      setPermissionState(result);
      if (result !== 'granted') return;
    }

    const topic = `${selectedYear}_${selectedDept}_${selectedSem}`;
    if (!isSubscribed) {
      subscribeToTopic(topic);
      setIsSubscribed(true);
      new Notification("Subscribed!", {
        body: `You will now receive alerts for ${selectedDept} sheets.`,
        icon: "https://cdn-icons-png.flaticon.com/512/3209/3209994.png"
      });
    }
  };

  const handleReserve = (sheet: Sheet) => {
    // Format values to match the requested clean style
    const yearDisplay = sheet.year.replace('Year ', '');
    const semesterDisplay = sheet.semester.replace('Semester ', '');
    const priceText = sheet.price && sheet.price > 0 ? `${sheet.price} LYD` : 'Free/N/A';

    const message = `السلام عليكم،
أود حجز الشيتات التالية:

Year: ${yearDisplay}
Semester: ${semesterDisplay}
Subject: ${sheet.subject}
Number of sheets: ${sheet.sheetNumber}
Price: ${priceText}
Doctor: Dr. ${sheet.doctorName}`;

    const url = `https://api.whatsapp.com/send?phone=%2B218918501986&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const getSheetStyles = (type: SheetType) => {
    switch (type) {
      case SheetType.Practical:
        return {
          bgClass: 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600',
          badge: 'bg-violet-50 text-violet-700 border-violet-100',
        };
      case SheetType.Theoretical:
        return {
          bgClass: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600',
          badge: 'bg-blue-50 text-blue-700 border-blue-100',
        };
      default:
        return {
          bgClass: 'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500',
          badge: 'bg-orange-50 text-orange-700 border-orange-100',
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header / Intro */}
      <div className="mb-10 text-center space-y-3">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Medical Technology</h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Academic Sheets</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8 relative z-50">
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <Search className="w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input 
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search by subject, doctor, or department..."
               className="w-full pl-11 pr-10 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium group-hover:shadow-md"
            />
            {searchQuery && (
               <button 
                 onClick={() => setSearchQuery('')}
                 className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
               >
                  <X className="w-5 h-5" />
               </button>
            )}
        </div>
      </div>

      {/* Filter Section */}
      <div className={`bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 relative z-40 transition-all duration-300 ${searchQuery ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year */}
          <div className="relative z-40">
            <CustomSelect
              label="Academic Year"
              value={selectedYear}
              onChange={(val) => {
                setSelectedYear(val);
                setSelectedDept('');
                setSelectedSem('');
                setSelectedSubject('');
              }}
              options={YEARS}
              placeholder="Select Year"
              icon={<GraduationCap className="w-5 h-5" />}
            />
          </div>

          {/* Department */}
          {selectedYear && (
          <div key={selectedYear} className="relative z-30 animate-[fadeIn_0.3s_ease-out]">
            <CustomSelect
              label="Department"
              value={selectedDept}
              onChange={(val) => {
                setSelectedDept(val);
                setSelectedSem(selectedYear === 'Year 1' ? 'General' : '');
                setSelectedSubject('');
              }}
              options={availableDepts}
              placeholder="Select Department"
              icon={<BookOpen className="w-5 h-5" />}
            />
          </div>
          )}

          {/* Semester (With Bell) */}
          {selectedDept && (
          <div key={selectedDept} className="relative z-20 animate-[fadeIn_0.3s_ease-out]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 ml-1">Semester</label>
            <div className="flex gap-3">
              <div className="w-full">
                <CustomSelect
                  value={selectedSem}
                  onChange={(val) => {
                    setSelectedSem(val);
                    setSelectedSubject('');
                  }}
                  options={selectedYear === 'Year 1' ? ['General'] : availableSems}
                  placeholder="Select Semester"
                  disabled={selectedYear === 'Year 1'}
                  icon={<Calendar className="w-5 h-5" />}
                />
              </div>
              
              <button 
                onClick={handleNotificationClick}
                disabled={!selectedYear || !selectedDept}
                title={isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
                className={`flex-shrink-0 w-[54px] h-[54px] mt-[1px] flex items-center justify-center rounded-xl border-2 transition-all ${
                  isSubscribed 
                    ? "bg-teal-50 border-teal-500 text-teal-600 shadow-teal-100 shadow-lg" 
                    : "bg-slate-50/50 border-slate-200 text-slate-400 hover:border-teal-400 hover:text-teal-500 shadow-sm"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-400`}
              >
                {isSubscribed ? <BellRing className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
              </button>
            </div>
          </div>
          )}

          {/* Subject */}
          {selectedSem && (
             <div key={selectedSem} className="relative z-10 animate-[fadeIn_0.3s_ease-out]">
                <CustomSelect
                  label="Subject"
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  options={availableSubjects}
                  placeholder="Select Subject"
                  icon={<Book className="w-5 h-5" />}
                />
             </div>
          )}
        </div>
      </div>

      {/* Results Feed */}
      {isLoading ? (
          <div className="text-center py-20 animate-pulse">
             <div className="inline-block w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-400 font-medium">Loading materials...</p>
          </div>
      ) : (selectedSubject || searchQuery) ? (
        filteredSheets.length > 0 ? (
          <div key={selectedSubject || searchQuery} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 z-10 relative animate-[fadeIn_0.5s_ease-out]">
            {filteredSheets.map((sheet) => {
              const styles = getSheetStyles(sheet.type);
              return (
                <div key={sheet.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-row h-full">
                    
                    {/* Left Content */}
                    <div className="flex-1 p-5 flex flex-col relative z-10">
                        {/* Top Badge Row */}
                        <div className="flex items-center gap-2 mb-3">
                             <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border ${styles.badge}`}>
                                {sheet.type}
                            </span>
                            {sheet.imageUrl && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" /> Preview
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 leading-snug mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors" title={sheet.subject}>
                            {sheet.subject}
                        </h3>
                        
                        <p className="text-sm font-medium text-slate-500 mb-5 flex items-center gap-1.5">
                           <User className="w-3.5 h-3.5" />
                           Dr. {sheet.doctorName}
                        </p>

                        <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-1.5 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5" /> <span className="truncate">{sheet.year}</span>
                            </div>
                             <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> <span className="truncate">{sheet.semester}</span>
                            </div>
                             <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" /> <span className="truncate">{sheet.department}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                             <button 
                                onClick={() => handleReserve(sheet)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-3.5 h-3.5" /> Reserve
                            </button>
                            {sheet.imageUrl && (
                                <button 
                                    onClick={() => setPreviewImage(sheet.imageUrl)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-colors"
                                    title="View Preview"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className={`w-24 relative flex flex-col items-center justify-center text-white ${styles.bgClass} flex-shrink-0`}>
                         <div className="relative z-10 flex flex-col items-center">
                             <span className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1">Sheet</span>
                             <span className="text-5xl font-black tracking-tighter leading-none shadow-sm">{sheet.sheetNumber}</span>
                             {sheet.price && sheet.price > 0 && (
                                 <div className="mt-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-center">
                                     <span className="block text-xs font-bold">{sheet.price}</span>
                                     <span className="block text-[8px] uppercase font-semibold opacity-90">LYD</span>
                                 </div>
                             )}
                         </div>
                         
                         {/* Decorative Background Elements */}
                         <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                         <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
                    </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div key={`${selectedSubject}-empty`} className="text-center py-24 opacity-80 z-10 relative animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              {searchQuery ? <Search className="w-10 h-10 text-slate-300" /> : <FileText className="w-10 h-10 text-slate-300" />}
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No sheets found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
                {searchQuery 
                    ? `We couldn't find any sheets matching "${searchQuery}"`
                    : `There are no materials uploaded for ${selectedSubject} yet.`
                }
            </p>
          </div>
        )
      ) : (
        /* Empty State when no Subject selected */
        <div key="start-prompt" className="text-center py-20 z-10 relative opacity-60">
           <p className="text-slate-400">Please select filters or use search to find materials.</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 md:right-0 md:-top-10 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="Sheet Preview" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl bg-white border-[6px] border-white ring-1 ring-black/10" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;