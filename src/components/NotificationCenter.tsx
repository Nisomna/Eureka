import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Plus, Trash2, Clock, AlarmClock, RotateCcw, X, ChevronDown, ChevronUp, Save, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScheduledNotification, ActiveToast } from '../lib/notificationTypes';
import { loadNotifications, saveNotifications, scheduleViaSW, cancelViaSW } from '../lib/notificationUtils';

interface Props {
  onFireToast: (toast: ActiveToast) => void;
}

export function NotificationCenter({ onFireToast }: Props) {
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [datetime, setDatetime] = useState('');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly'>('none');
  const [repeatMins, setRepeatMins] = useState<number | null>(null);
  const [sound, setSound] = useState(true);
  const [soundRepeat, setSoundRepeat] = useState(3);

  useEffect(() => {
    setNotifications(loadNotifications());
    
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === 'NOTIFICATION_FIRED') {
          const { notifId } = event.data;
          setNotifications(prev => {
            const updated = prev.map(n => n.id === notifId && n.repeat === 'none' && n.repeatMinutes === null ? { ...n, fired: true } : n);
            saveNotifications(updated);
            return updated;
          });
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);
      return () => navigator.serviceWorker.removeEventListener('message', handler);
    }
  }, []);

  // Polling for UI firing when app is open
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const updated = notifications.map(n => {
        if (!n.fired && n.scheduledAt <= now) {
          onFireToast({ id: n.id, title: n.title, message: n.message, sound: n.sound, soundRepeat: n.soundRepeat });
          changed = true;
          
          if (n.repeatMinutes != null) {
            return { ...n, scheduledAt: n.scheduledAt + n.repeatMinutes * 60_000 };
          }
          if (n.repeat === 'none') return { ...n, fired: true };
          const delta = n.repeat === 'daily' ? 86_400_000 : 604_800_000;
          return { ...n, scheduledAt: n.scheduledAt + delta };
        }
        return n;
      });

      if (changed) {
        setNotifications(updated);
        saveNotifications(updated);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [notifications, onFireToast]);

  const requestPermission = async () => {
    const perm = await Notification.requestPermission();
    setPermission(perm);
  };

  const handleSave = async () => {
    if (!title.trim() || !datetime) return;
    
    const scheduledAt = new Date(datetime).getTime();
    if (scheduledAt <= Date.now()) return;

    const newNotif: ScheduledNotification = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      title,
      message,
      scheduledAt,
      repeat,
      repeatMinutes: repeatMins,
      sound,
      soundRepeat,
      fired: false,
      createdAt: Date.now()
    };

    const updated = editingId 
      ? notifications.map(n => n.id === editingId ? newNotif : n)
      : [...notifications, newNotif];
    
    setNotifications(updated);
    saveNotifications(updated);
    await scheduleViaSW(newNotif);
    
    // Reset
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setMessage('');
    setDatetime('');
    setRepeat('none');
    setRepeatMins(null);
  };

  const handleDelete = async (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
    await cancelViaSW(id);
  };

  const startEdit = (n: ScheduledNotification) => {
    setEditingId(n.id);
    setTitle(n.title);
    setMessage(n.message);
    setRepeat(n.repeat);
    setRepeatMins(n.repeatMinutes);
    setSound(n.sound);
    setSoundRepeat(n.soundRepeat);
    
    const d = new Date(n.scheduledAt > Date.now() ? n.scheduledAt : Date.now() + 5 * 60000);
    const pad = (v: number) => v.toString().padStart(2, '0');
    setDatetime(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    setShowForm(true);
  };

  const reactivate = (n: ScheduledNotification) => {
    const d = new Date(Date.now() + 5 * 60000);
    startEdit({ ...n, scheduledAt: d.getTime(), fired: false });
  };

  const pendingCount = notifications.filter(n => !n.fired).length;

  return (
    <div className="bg-slate-900/50 border-t border-slate-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <div className="relative">
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-slate-900">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-sm font-bold">Alarmas y Recordatorios</span>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        
        <button 
          onClick={() => {
            setEditingId(null);
            setTitle('');
            setMessage('');
            setRepeat('none');
            setRepeatMins(null);
            const d = new Date(Date.now() + 5 * 60000);
            const pad = (v: number) => v.toString().padStart(2, '0');
            setDatetime(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
            setShowForm(true);
            setIsExpanded(true);
          }}
          className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg hover:bg-teal-500/20 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {permission === 'default' && (
              <button 
                onClick={requestPermission}
                className="w-full mb-3 p-3 bg-blue-500/10 text-blue-400 rounded-xl text-xs flex items-center gap-2 hover:bg-blue-500/20 transition-colors"
              >
                <Bell size={14} /> Activar notificaciones del sistema
              </button>
            )}

            {showForm ? (
              <div className="bg-slate-800 rounded-2xl p-4 mb-4 space-y-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {editingId ? 'Editar Alarma' : 'Nueva Alarma'}
                  </h4>
                  <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Título" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm focus:border-teal-500 outline-none"
                />
                
                <textarea 
                  placeholder="Mensaje opcional" 
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm focus:border-teal-500 outline-none h-16"
                />

                <input 
                  type="datetime-local" 
                  value={datetime}
                  onChange={e => setDatetime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm focus:border-teal-500 outline-none"
                />

                <div className="flex items-center justify-between gap-4">
                  <select 
                    value={repeat} 
                    onChange={e => setRepeat(e.target.value as any)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm outline-none"
                  >
                    <option value="none">Sin repetición</option>
                    <option value="daily">Cada día</option>
                    <option value="weekly">Cada semana</option>
                    <option value="custom">Cada X minutos</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSound(!sound)}
                      className={`p-2 rounded-xl transition-colors ${sound ? 'bg-teal-500 text-white' : 'bg-slate-900 text-slate-500'}`}
                    >
                      {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    {sound && (
                      <input 
                        type="number" 
                        min="1" max="10" 
                        value={soundRepeat} 
                        onChange={e => setSoundRepeat(Number(e.target.value))}
                        className="w-12 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-sm outline-none text-center"
                      />
                    )}
                  </div>
                </div>

                {repeat === ('custom' as any) && (
                   <div className="flex flex-wrap gap-2">
                    {[5, 10, 15, 30, 60].map(m => (
                      <button
                        key={m}
                        onClick={() => setRepeatMins(m)}
                        className={`px-3 py-1 rounded-full text-xs border ${repeatMins === m ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 text-slate-500'}`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                )}

                <button 
                  onClick={handleSave}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Save size={18} /> Guardar Recordatorio
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                No tienes alarmas programadas.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {notifications.sort((a,b) => b.createdAt - a.createdAt).map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      n.fired ? 'bg-slate-900/30 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${n.fired ? 'bg-slate-900 text-slate-600' : 'bg-teal-500/10 text-teal-400'}`}>
                      {n.fired ? <Clock size={16} /> : <AlarmClock size={16} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-200 truncate">{n.title}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(n.scheduledAt).toLocaleString()}
                        {n.repeat !== 'none' && <span className="bg-slate-700 px-1 rounded">R</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {n.fired ? (
                        <button onClick={() => reactivate(n)} className="p-1.5 text-slate-400 hover:text-white" title="Reactivar">
                          <RotateCcw size={16} />
                        </button>
                      ) : (
                        <button onClick={() => startEdit(n)} className="p-1.5 text-slate-400 hover:text-white" title="Editar">
                          <Clock size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(n.id)} className="p-1.5 text-red-400 hover:text-red-300" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
