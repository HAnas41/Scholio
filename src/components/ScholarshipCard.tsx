import { motion } from 'motion/react';
import { ArrowUpRight, GraduationCap, MapPin, Award, Sparkles, Clock, Flame, Zap, Calendar } from 'lucide-react';

const NOW = Date.now();

function SmartBadge({ label, icon: Icon, color }: { label: string; icon: any; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value, color = "text-slate-600" }: { icon: any; label: string; value: string; color?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-xs mb-1.5">
      <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-500 font-medium w-20 shrink-0">{label}:</span>
      <span className={`${color} font-semibold truncate`}>{value}</span>
    </div>
  );
}

export default function ScholarshipCard({ match, index }: { match: any, index: number }) {
  const { match_score, explanation, scholarship: s } = match;
  
  const deadline = new Date(s.deadline);
  const daysLeft = Math.ceil((deadline.getTime() - NOW) / (1000 * 60 * 60 * 24));
  const isClosingSoon = daysLeft >= 0 && daysLeft <= 30;
  const isHighMatch = match_score >= 80;
  
  // Placeholder for "New" - assume index < 3 or check timestamp if available
  const isNew = index < 2; 
  const isTrending = index === 0 || index === 2;

  const minVal = isNaN(Number(s.minimumValue)) ? 'Not specified' : `${s.minimumValue}${s.minimumType === 'Percentage' ? '%' : ''}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-black/10 hover:border-yellow-500/30 hover:scale-[1.02] transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {/* Smart Badges Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isClosingSoon && (
          <SmartBadge label="Closing Soon" icon={Clock} color="bg-red-100 text-red-700 border border-red-200" />
        )}
        {isNew && (
          <SmartBadge label="New" icon={Zap} color="bg-green-100 text-green-700 border border-green-200" />
        )}
        {isTrending && (
          <SmartBadge label="Trending" icon={Flame} color="bg-orange-100 text-orange-700 border border-orange-200" />
        )}
        {isHighMatch && (
          <SmartBadge label="High Match" icon={Sparkles} color="bg-amber-100 text-amber-700 border border-amber-200" />
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-bold text-xl text-slate-900 font-heading leading-tight group-hover:text-yellow-600 transition-colors mb-1">
          {s.title}
        </h3>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
          {Array.isArray(s.degreeRequired) ? s.degreeRequired.join(' | ') : s.degreeRequired} | {s.fieldRequired}
        </p>
      </div>

      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-5">
        <DetailRow icon={Award} label="Min Req" value={`${s.minimumType} ${minVal}`} />
        <DetailRow 
          icon={Calendar} 
          label="Deadline" 
          value={deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
          color={isClosingSoon ? "text-red-600" : "text-slate-700"}
        />
        <DetailRow icon={MapPin} label="For" value={s.eligibleProvinces?.includes('All Pakistan') ? 'All Pakistan' : s.eligibleProvinces?.join(', ')} />
        <DetailRow icon={GraduationCap} label="Type" value={s.scholarshipType} />
        {s.quotaSeats && !isNaN(s.quotaSeats) && (
          <DetailRow icon={Zap} label="Seats" value={`${s.quotaSeats} seats`} />
        )}
      </div>

      <div className="flex-grow">
        <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative">
          <span className="block font-bold text-blue-700 mb-1.5 text-[10px] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> AI Analysis
          </span>
          {explanation}
        </div>
      </div>

      <a 
        href={s.applyLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-center gap-2 w-full bg-[#d4af37] hover:bg-[#b5952f] text-white py-4 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg shadow-yellow-600/20"
      >
        Apply Now <ArrowUpRight className="h-4 w-4" />
      </a>

      {/* Match Score Floating Badge */}
      <div className="absolute top-0 right-0 p-2">
         <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-bl-xl">
           {match_score}%
         </span>
      </div>
    </motion.div>
  );
}
