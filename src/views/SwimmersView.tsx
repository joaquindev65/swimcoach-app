import React, { useState, useMemo } from 'react';
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
  Building2,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
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

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto space-y-4">
      {/* Header and Add button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black text-white">Plantel de Nadadores</h2>
          <p className="text-[11px] text-slate-400">
            {swimmers.length} atletas • {uniqueClubs.length} clubes • {uniqueSedes.length} sedes
          </p>
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

      {/* Interactive Grouping & Filter Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5 shadow-md">
        {/* Group By Selector Tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              Agrupar nadadores por:
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setGroupBy('club')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                groupBy === 'club'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Por Club</span>
            </button>

            <button
              onClick={() => setGroupBy('sede')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                groupBy === 'sede'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Por Sede</span>
            </button>

            <button
              onClick={() => setGroupBy('none')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                groupBy === 'none'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Sin Agrupar</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, club o sede..."
            className="w-full pl-8 pr-7 bg-slate-950 border border-slate-800 rounded-xl py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Secondary Filter Dropdowns (Club and Sede) */}
        {(uniqueClubs.length > 1 || uniqueSedes.length > 1) && (
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Filtrar Club</label>
              <select
                value={filterClub}
                onChange={(e) => setFilterClub(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 truncate"
              >
                <option value="all">🏢 Todos los Clubes</option>
                {uniqueClubs.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Filtrar Sede</label>
              <select
                value={filterSede}
                onChange={(e) => setFilterSede(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 truncate"
              >
                <option value="all">📍 Todas las Sedes</option>
                {uniqueSedes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Render Swimmers List / Groups */}
      {filteredSwimmers.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-2">
          <p className="text-sm font-semibold text-slate-300">
            No se encontraron nadadores con los filtros seleccionados.
          </p>
          <button
            onClick={() => {
              setFilterClub('all');
              setFilterSede('all');
              setSearchQuery('');
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-bold"
          >
            Limpiar filtros de búsqueda
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedSwimmers.map((group) => {
            const isCollapsed = collapsedGroups[group.key];
            const isGrouped = groupBy !== 'none';

            return (
              <div key={group.key} className="space-y-2">
                {/* Group Header (if grouping is active) */}
                {isGrouped && (
                  <div
                    onClick={() => toggleGroupCollapse(group.key)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all select-none"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {group.type === 'club' ? (
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-white truncate">{group.title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                        {group.items.length} {group.items.length === 1 ? 'nadador' : 'nadadores'}
                      </span>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                )}

                {/* Swimmer Cards inside Group */}
                {!isCollapsed && (
                  <div className="space-y-2.5">
                    {group.items.map((s) => {
                      const isSelected = s.id === selectedSwimmerId;
                      const maxHR = calculateMaxHR(s.age);

                      let pbCount = 0;
                      Object.values(s.pbs).forEach((strokeMap) => {
                        if (strokeMap) pbCount += Object.keys(strokeMap).length;
                      });

                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedSwimmerId(s.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
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
                            {/* Clickable Avatar */}
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
                                <span className="text-cyan-400 font-medium">
                                  {s.category || 'General'}
                                </span>
                              </div>

                              {/* Club & Sede Badges on Card */}
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {s.club && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded-md">
                                    <Building2 className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>{s.club}</span>
                                  </span>
                                )}
                                {s.sede && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-md">
                                    <MapPin className="w-2.5 h-2.5 text-amber-400" />
                                    <span>{s.sede}</span>
                                  </span>
                                )}
                              </div>

                              {s.notes && (
                                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1 italic">
                                  "{s.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stats Bar */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/60 flex items-center justify-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-slate-400 text-[11px]">FC Máx:</span>
                              <strong className="text-white font-mono">{maxHR} bpm</strong>
                            </div>

                            <div className="bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/60 flex items-center justify-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-slate-400 text-[11px]">Marcas:</span>
                              <strong className="text-white font-mono">{pbCount} pruebas</strong>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/40">
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
                )}
              </div>
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
