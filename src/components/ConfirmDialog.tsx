import { motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 sm:p-8 rounded-2xl text-center max-w-sm w-full shadow-xl border border-slate-100 mx-4"
      >
        <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">Confirm Deletion</h3>
        <p className="text-slate-500 mb-8 text-sm">Are you sure you want to delete this scholarship? This action cannot be undone.</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onCancel} className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 transition order-2 sm:order-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm order-1 sm:order-2">Yes, Delete</button>
        </div>
      </motion.div>
    </div>
  );
}
