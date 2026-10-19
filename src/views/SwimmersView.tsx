import React, { useState, useMemo } from 'react';
import { useSwim } from '../context/SwimContext';
import { calculateMaxHR } from '../utils/swimCalculations';
import { processProfileImage } from '../utils/imageUtils';
import { SwimmerAvatar } from '../components/SwimmerAvatar';
import {
  UserPlus,
  Trash2,
  Edit2,
  X,
  Check,
  Camera,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
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

  // Grouping & Filtering state
  const [groupBy, setGroupBy] = useState<'club' | 'sede' | 'none'>('club');
  const [filterClub, setFilterClub] = useState<string>('all');
  const [filterSede, setFilterSede] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Form states
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState(25);
  const [formCategory, setFormCategory] = useState('Primera');
  const [formClub, setFormClub] = useState('Club Natación Pro');
  const [formSede, setFormSede] = useState('Sede Central');
  const [formNotes, setFormNotes] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string | undefined>(undefined);
  const [isProcessingModalPhoto, setIsProcessingModalPhoto] = useState(false);
  const [modalPhotoError, setModalPhotoError] = useState<string | null>(null);

  // Card fast-upload loading state
  const [uploadingSwimmerId, setUploadingSwimmerId] = useState<string | null>(null);

  // Unique list of Clubs and Sedes for autocomplete and filters
  const uniqueClubs = useMemo(() => {
    return Array.from(
      new Set(swimmers.map((s) => s.club?.trim()).filter(Boolean))
    ) as string[];
  }, [swimmers]);

  const uniqueSedes = useMemo(() => {
    return Array.from(
      new Set(swimmers.map((s) => s.sede?.trim()).filter(Boolean))
    ) as string[];
  }, [swimmers]);

  const openCreateModal = () => {
    setEditingSwimmer(null);
    setFormName('');
    setFormAge(25);
    setFormCategory('Primera');
    setFormClub(uniqueClubs[0] || 'Club Natación Pro');
    setFormSede(uniqueSedes[0] || 'Sede Central');
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
    setFormClub(swimmer.club || '');
    setFormSede(swimmer.sede || '');
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
        club: formClub.trim() || undefined,
        sede: formSede.trim() || undefined,
        notes: formNotes.trim(),
        photoUrl: formPhotoUrl,
      });
    } else {
      addSwimmer({
        name: formName.trim(),
        age: formAge,
        category: formCategory.trim(),
        club: formClub.trim() || undefined,
        sede: formSede.trim() || undefined,
        notes: formNotes.trim(),
        photoUrl: formPhotoUrl,
        pbs: {},
      });
    }
    setIsModalOpen(false);
  };

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // Filter swimmers based on search, club, and sede
  const filteredSwimmers = useMemo(() => {
    return swimmers.filter((s) => {
      if (filterClub !== 'all' && (s.club || 'Sin Club') !== filterClub) {
        return false;
      }
      if (filterSede !== 'all' && (s.sede || 'Sin Sede') !== filterSede) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchClub = s.club?.toLowerCase().includes(q);
        const matchSede = s.sede?.toLowerCase().includes(q);
        const matchCat = s.category?.toLowerCase().includes(q);
        if (!matchName && !matchClub && !matchSede && !matchCat) return false;
      }
      return true;
    });
  }, [swimmers, filterClub, filterSede, searchQuery]);

  // Group swimmers based on selected groupBy mode
  const groupedSwimmers = useMemo(() => {
    if (groupBy === 'none') {
      return [
        {
          key: 'all',
          title: 'Todos los Nadadores',
          type: 'none' as const,
          items: filteredSwimmers,
        },
      ];
    }

    const map = new Map<string, Swimmer[]>();
    filteredSwimmers.forEach((s) => {
      const key =
        groupBy === 'club'
          ? s.club?.trim() || 'Sin Club Asignado'
          : s.sede?.trim() || 'Sin Sede Asignada';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });

    return Array.from(map.entries()).map(([title, items]) => ({
      key: title,
      title,
      type: groupBy,
      items,
    }));
  }, [filteredSwimmers, groupBy]);

  const groupTabs = [
    { id: 'club', label: 'Por club' },
    { id: 'sede', label: 'Por sede' },
    { id: 'none', label: 'Sin agrupar' },
  ] as const;

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-bold text-white leading-tight">Nadadores</h2>
          <p className="text-xs text-slate-400">
            {swimmers.length} en {uniqueClubs.length || 1} {uniqueClubs.length === 1 ? 'club' : 'clubes'} y {uniqueSedes.length || 1}{' '}
            {uniqueSedes.length === 1 ? 'sede' : 'sedes'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setIsBackupOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white"
            title="Copia de seguridad y sincronización"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Copia
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF3F1] text-[#0B1F2A] font-bold text-sm active:scale-95 transition-transform"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </header>

      {/* Agrupar y buscar */}
      <div className="space-y-3">
        <div className="flex gap-4 border-b border-slate-800" role="group" aria-label="Agrupar nadadores">
          {groupTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setGroupBy(t.id)}
              aria-pressed={groupBy === t.id}
              className={`pb-2 -mb-px border-b-2 text-sm font-semibold whitespace-nowrap ${
                groupBy === t.id ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, club o sede"
            aria-label="Buscar nadador"
            className="w-full pl-9 pr-8 bg-slate-900 border border-slate-800 rounded-xl py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Borrar búsqueda"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {(uniqueClubs.length > 1 || uniqueSedes.length > 1) && (
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterClub}
              onChange={(e) => setFilterClub(e.target.value)}
              aria-label="Filtrar por club"
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:border-cyan-500 truncate"
            >
              <option value="all">Todos los clubes</option>
              {uniqueClubs.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filterSede}
              onChange={(e) => setFilterSede(e.target.value)}
              aria-label="Filtrar por sede"
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:border-cyan-500 truncate"
            >
              <option value="all">Todas las sedes</option>
              {uniqueSedes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredSwimmers.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-sm text-slate-300">Ningún nadador coincide con los filtros.</p>
          <button
            onClick={() => {
              setFilterClub('all');
              setFilterSede('all');
              setSearchQuery('');
            }}
            className="text-sm font-semibold text-cyan-300 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedSwimmers.map((group) => {
            const isCollapsed = collapsedGroups[group.key];
            const isGrouped = groupBy !== 'none';

            return (
              <section key={group.key}>
                {isGrouped && (
                  <button
                    onClick={() => toggleGroupCollapse(group.key)}
                    aria-expanded={!isCollapsed}
                    className="w-full flex items-baseline justify-between gap-2 pb-1 border-b border-slate-800 text-left"
                  >
                    <h3 className="font-display text-xl font-bold text-white truncate">{group.title}</h3>
                    <span className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                      {group.items.length}
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </span>
                  </button>
                )}

                {!isCollapsed && (
                  <ul className="divide-y divide-slate-800">
                    {group.items.map((s) => {
                      const isSelected = s.id === selectedSwimmerId;
                      const pbCount = Object.values(s.pbs).reduce(
                        (n, strokeMap) => n + (strokeMap ? Object.keys(strokeMap).length : 0),
                        0
                      );

                      return (
                        <li
                          key={s.id}
                          onClick={() => setSelectedSwimmerId(s.id)}
                          className={`py-3 cursor-pointer border-l-2 pl-3 -ml-3 ${
                            isSelected ? 'border-cyan-400 bg-cyan-500/5' : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <label
                              htmlFor={`card-avatar-input-${s.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="cursor-pointer block flex-shrink-0"
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

                            <div className="flex-1 min-w-0">
                              <h4 className="font-display text-xl font-bold text-white leading-tight truncate">
                                {s.name}
                                {isSelected && <span className="ml-2 text-xs font-sans font-semibold text-cyan-300">en foco</span>}
                              </h4>
                              <p className="text-xs text-slate-400 truncate">
                                {s.age} años · {s.category || 'General'}
                                {s.club ? ` · ${s.club}` : ''}
                                {s.sede ? ` · ${s.sede}` : ''}
                              </p>
                              <p className="text-xs text-slate-300 tabular-nums">
                                FC máx {calculateMaxHR(s.age)} · {pbCount} {pbCount === 1 ? 'marca' : 'marcas'}
                              </p>
                              {s.notes && <p className="text-xs text-slate-400 line-clamp-1 italic">{s.notes}</p>}
                            </div>

                            <div className="flex flex-col items-center flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(s);
                                }}
                                className="p-2 text-slate-400 hover:text-cyan-300"
                                title="Editar nadador"
                                aria-label={`Editar a ${s.name}`}
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
                                  className="p-2 text-slate-500 hover:text-red-400"
                                  title="Eliminar nadador"
                                  aria-label={`Eliminar a ${s.name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Create / Edit Swimmer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                {editingSwimmer ? 'Editar Nadador' : 'Añadir Nuevo Nadador'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
              {/* Photo Upload in Modal */}
              <div className="flex flex-col items-center justify-center py-2 bg-slate-950/50 rounded-xl border border-slate-800">
                <label
                  htmlFor="modal-photo-upload-input"
                  className="cursor-pointer relative group block mb-2"
                  title="Toca para subir o cambiar foto"
                >
                  <SwimmerAvatar
                    name={formName || 'Nuevo'}
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
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Nombre y Apellido *
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

              {/* Club and Sede Fields with Autocomplete */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    Club / Equipo
                  </label>
                  <input
                    type="text"
                    list="club-modal-suggestions"
                    placeholder="Ej: Club Natación Pro"
                    value={formClub}
                    onChange={(e) => setFormClub(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                  <datalist id="club-modal-suggestions">
                    {uniqueClubs.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    Sede / Pileta
                  </label>
                  <input
                    type="text"
                    list="sede-modal-suggestions"
                    placeholder="Ej: Sede Central"
                    value={formSede}
                    onChange={(e) => setFormSede(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                  <datalist id="sede-modal-suggestions">
                    {uniqueSedes.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
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
                  <Check className="w-4 h-4 stroke-[2.5]" />
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
