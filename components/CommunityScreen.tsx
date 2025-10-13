import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { MOCK_STUDENTS } from '../constants';
import { Search, MessageSquare } from 'lucide-react';
import ChatModal from './ChatModal';

interface StudentCardProps {
  student: UserProfile;
  onMessage: (student: UserProfile) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onMessage }) => (
  <div className="bg-white dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-3 transition-transform transform hover:-translate-y-1">
    <img src={student.profilePictureUrl} alt={student.bns} className="w-20 h-20 rounded-full border-2 border-slate-200 dark:border-white/20" />
    <div>
      <h3 className="font-bold text-lg text-sky-600 dark:text-sky-300">{student.bns}</h3>
      <p className="text-sm text-slate-600 dark:text-gray-300">{student.school}</p>
      <p className="text-xs text-blue-600 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block mt-1">{student.major}</p>
    </div>
    <button
      onClick={() => onMessage(student)}
      className="mt-auto w-full flex items-center justify-center gap-2 bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 hover:bg-sky-500/20 dark:hover:bg-sky-500/40 font-semibold py-2 px-4 rounded-lg transition-colors"
    >
      <MessageSquare size={16} /> Message
    </button>
  </div>
);

interface CommunityScreenProps {
  currentUser: UserProfile;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chattingWith, setChattingWith] = useState<UserProfile | null>(null);
  
  const otherStudents = useMemo(() => MOCK_STUDENTS.filter(s => s.address !== currentUser.address), [currentUser.address]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return otherStudents;
    return otherStudents.filter(student =>
      student.bns.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, otherStudents]);

  return (
    <>
      <div className="w-full max-w-7xl bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10 flex flex-col gap-6 animate-fade-in">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Community Hub</h1>
            <p className="text-slate-500 dark:text-sky-200 mt-1">Find and connect with other students.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, major, school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStudents.map(student => (
            <StudentCard key={student.address} student={student} onMessage={setChattingWith} />
          ))}
        </div>
         {filteredStudents.length === 0 && (
            <div className="col-span-full text-center py-12">
                <p className="text-slate-500 dark:text-gray-400">No students found matching your search.</p>
            </div>
        )}
      </div>

      {chattingWith && (
        <ChatModal 
          currentUser={currentUser}
          otherUser={chattingWith}
          onClose={() => setChattingWith(null)}
        />
      )}
    </>
  );
};

export default CommunityScreen;
