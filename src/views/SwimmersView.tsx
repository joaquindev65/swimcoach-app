import React, { useState } from 'react';
import { useSwim } from '../context/SwimContext';
import { calculateMaxHR } from '../utils/swimCalculations';
import { processProfileImage } from '../utils/imageUtils';
import { SwimmerAvatar } from '../components/SwimmerAvatar';
import {
  UserPlus,
  UserCheck,
  Trash2,
  Edit2,
  Activity,
  Trophy,
  X,
  Check,
  Camera,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import type { Swimmer } from '../types/swim';
import { BackupModal } from '../components/BackupModal';

export const SwimmersView: React.FC = () => {
  const {
    swimmers,
    selectedSwimmerId,
    setSelectedSwimmerId,
    addSwimmer,
    updateSwimmer,
    deleteSwimmer,
  } = useSwim();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [editingSwimmer, setEditingSwimmer] = useState<Swimmer | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState(25);
  const [formCategory, setFormCategory] = useState('Primera');
  const [formNotes, setFormNotes] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string | undefined>(undefined);
  const [isProcessingModalPhoto, setIsProcessingModalPhoto] = useState(false);
  const [modalPhotoError, setModalPhotoError] = useState<string | null>(null);

  // Card fast-upload loading state
  const [uploadingSwimmerId, setUploadingSwimmerId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingSwimmer(null);
    setFormName('');
    setFormAge(25);
    setFormCategory('Primera');
    setFormNotes('');
    setFormPhotoUrl(undefined);
    setModalPhotoError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (swimmer: Swimmer) => {
    setEditingSwimmer(swimmer);
    setFormName(swimmer.name);
    setFormAge(swimmer.age);
    setFormCategory(swimmer.category || '');
    setFormNotes(swimmer.notes || '');
    setFormPhotoUrl(swimmer.photoUrl);
    setModalPhotoError(null);
    setIsModalOpen(true);
  };

  const handleModalPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingModalPhoto(true);
    setModalPhotoError(null);

    try {
      const dataUrl = await processProfileImage(file, { targetSize: 320, quality: 0.82 });
      setFormPhotoUrl(dataUrl);
    } catch (err: any) {
      setModalPhotoError(err.message || 'Error al procesar la foto');
    } finally {
      setIsProcessingModalPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDirectCardUpload = async (swimmerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSwimmerId(swimmerId);
    try {
      const dataUrl = await processProfileImage(file, { targetSize: 320, quality: 0.82 });
      updateSwimmer(swimmerId, { photoUrl: dataUrl });
    } catch (err: any) {
      alert(err.message || 'No se pudo cargar la imagen. Intenta con otra foto.');
    } finally {
      setUploadingSwimmerId(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingSwimmer) {
      updateSwimmer(editingSwimmer.id, {
        name: formName.trim(),
        age: formAge,
        category: formCategory.trim(),
        notes: formNotes.trim(),
        photoUrl: formPhotoUrl,
      });
    } else {
      addSwimmer({
        name: formName.trim(),
        age: formAge,
        category: formCategory.trim(),
        notes: formNotes.trim(),
        photoUrl: formPhotoUrl,
        pbs: {},
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Header and Add button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-white">Plantel de Nadadores</h2>
          <p className="text-xs text-slate-400">Toca la foto o el botón para cargar imagen</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsBackupOpen(true)}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-semibold text-xs border border-slate-700 active:scale-95 transition-all"
            title="Copia de seguridad y sincronización"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Copia</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Swimmer Cards */}
      <div className="space-y-3">
        {swimmers.map((s) => {
          const isSelected = s.id === selectedSwimmerId;
          const maxHR = calculateMaxHR(s.age);

          // Count registered PBs
          let pbCount = 0;
          Object.values(s.pbs).forEach((strokeMap) => {
            if (strokeMap) pbCount += Object.keys(strokeMap).length;
          });

          return (
            <div
              key={s.id}
              onClick={() => setSelectedSwimmerId(s.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                  <UserCheck className="w-3 h-3" />
                  Activo
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Clickable Avatar directly uploads photo via native label */}
                <label
                  htmlFor={`card-avatar-input-${s.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-pointer relative block flex-shrink-0 group"
                  title="Toca para cambiar la foto"
                >
                  <SwimmerAvatar
                    name={s.name}
                    photoUrl={s.photoUrl}
                    size="md"
                    shape="rounded-2xl"
                    border={isSelected}
                    showUploadBadge={true}
                    isUploading={uploadingSwimmerId === s.id}
                  />
                  <input
                    id={`card-avatar-input-${s.id}`}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleDirectCardUpload(s.id, e)}
                  />
                </label>

                <div className="flex-1 min-w-0 pr-12">
                  <h3 className="font-bold text-white text-base truncate">{s.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                    <span>{s.age} años</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-medium">{s.category || 'General'}</span>
                  </div>

                  {s.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                      "{s.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60 flex items-center justify-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-slate-400 text-[11px]">FC Máx:</span>
                  <strong className="text-white font-mono">{maxHR} bpm</strong>
                </div>

                <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60 flex items-center justify-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400 text-[11px]">Marcas:</span>
                  <strong className="text-white font-mono">{pbCount} pruebas</strong>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40">
                {/* Native label button to trigger file picker directly */}
                <label
                  htmlFor={`card-btn-input-${s.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-cyan-300 text-xs font-semibold cursor-pointer active:scale-95 transition-all border border-slate-700/60"
                  title="Subir o cambiar foto del atleta"
                >
                  {uploadingSwimmerId === s.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span>{s.photoUrl ? 'Cambiar foto' : 'Subir foto'}</span>
                  <input
                    id={`card-btn-input-${s.id}`}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleDirectCardUpload(s.id, e)}
                  />
                </label>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(s);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    title="Editar atleta"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {swimmers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`¿Eliminar a ${s.name}?`)) {
                          deleteSwimmer(s.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Eliminar nadador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Swimmer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-base">
                {editingSwimmer ? 'Editar Atleta' : 'Nuevo Nadador'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload Area */}
              <div className="flex flex-col items-center justify-center p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <label
                  htmlFor="modal-photo-upload-input"
                  className="cursor-pointer relative block group mb-2.5"
                  title="Toca para seleccionar foto"
                >
                  <SwimmerAvatar
                    name={formName || 'Atleta'}
                    photoUrl={formPhotoUrl}
                    size="xl"
                    shape="rounded-2xl"
                    border={true}
                    isUploading={isProcessingModalPhoto}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </label>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="modal-photo-upload-input"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold text-xs rounded-xl border border-cyan-500/30 transition-all active:scale-95 cursor-pointer"
                  >
                    {isProcessingModalPhoto ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    <span>{formPhotoUrl ? 'Cambiar Foto' : 'Subir Foto'}</span>
                    <input
                      id="modal-photo-upload-input"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleModalPhotoChange}
                      disabled={isProcessingModalPhoto}
                    />
                  </label>

                  {formPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormPhotoUrl(undefined);
                        setModalPhotoError(null);
                      }}
                      disabled={isProcessingModalPhoto}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 font-semibold text-xs rounded-xl border border-red-800/40 transition-all active:scale-95 disabled:opacity-50"
                      title="Quitar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Quitar
                    </button>
                  )}
                </div>

                {modalPhotoError && (
                  <div className="mt-2 text-[11px] text-red-400 flex items-center gap-1 text-center px-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{modalPhotoError}</span>
                  </div>
                )}

                <span className="text-[10px] text-slate-500 mt-2 text-center">
                  Cámara o galería (JPG, PNG). Se optimiza automáticamente en 1:1.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Nombre y Apellido
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Martín Rodríguez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Edad
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={100}
                    required
                    value={formAge}
                    onChange={(e) => setFormAge(parseInt(e.target.value) || 18)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    FCM: {220 - formAge} bpm
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Máster / Juvenil"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Notas / Estilos clave
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Fondista, trabaja en 400 y 1500m libre..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-750"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Check className="w-4 h-4" />
                  {editingSwimmer ? 'Guardar Cambios' : 'Crear Nadador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} />
    </div>
  );
};
