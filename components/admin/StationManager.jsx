import { useState } from 'react'
import { useNetwork } from '../../src/context/NetworkContext'
import { adminApi, getErrorMessage } from '../../src/lib/api'
import Modal from './Modal'
import { SkeletonList } from '../ui/skeleton-blocks'

const STATION_STATUSES = ['Active', 'Inactive']
const CHARGER_STATUSES = ['Available', 'Busy', 'Maintenance', 'Not Working']
const CHARGER_TYPES = ['DC', 'AC']

const emptyStation = { name: '', status: 'Active' }

const emptyCharger = {
  chargerCode: '',
  chargerType: 'DC',
  powerRating: '60kW',
  slotDuration: 150,
  status: 'Available',
}

const statusBadge = (status) => {
  if (status === 'Active' || status === 'Available') return 'admin-badge-green'
  if (status === 'Inactive' || status === 'Busy' || status === 'Maintenance') return 'admin-badge-amber'
  return 'admin-badge-red'
}

const Field = ({ label, children }) => (
  <div>
    <label className="block label-text text-xs mono uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
)

const StationManager = () => {
  const {
    network,
    loading,
    error: loadError,
    addStation,
    updateStation,
    updateStationStatus,
    addCharger,
    updateCharger,
    updateChargerStatus,
  } = useNetwork()

  const [expandedId, setExpandedId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [stationModal, setStationModal] = useState(null)
  const [stationForm, setStationForm] = useState(emptyStation)

  const [chargerModal, setChargerModal] = useState(null)
  const [chargerForm, setChargerForm] = useState(emptyCharger)

  const closeModals = () => {
    setStationModal(null)
    setChargerModal(null)
    setStationForm(emptyStation)
    setChargerForm(emptyCharger)
    setError('')
    setSaving(false)
  }

  const openAddStation = () => {
    setStationForm(emptyStation)
    setError('')
    setStationModal({ mode: 'add' })
  }

  const openEditStation = (station) => {
    setStationForm({ name: station.name, status: station.status })
    setError('')
    setStationModal({ mode: 'edit', id: station.id })
  }

  const openAddCharger = (station) => {
    setExpandedId(station.id)
    setChargerForm(emptyCharger)
    setError('')
    setChargerModal({ mode: 'add', stationId: station.id, stationName: station.name })
  }

  const chargerToForm = (charger) => ({
    chargerCode: charger.chargerCode || charger.name || '',
    chargerType: charger.chargerType || charger.type || 'DC',
    powerRating: charger.powerRating || charger.power || '60kW',
    slotDuration: charger.slotDuration || ((charger.chargerType || charger.type) === 'AC' ? 240 : 150),
    status: charger.status || 'Available',
  })

  const openEditCharger = async (station, charger) => {
    setExpandedId(station.id)
    setChargerForm(chargerToForm(charger))
    setError('')
    setChargerModal({
      mode: 'edit',
      stationId: station.id,
      stationName: station.name,
      chargerId: charger.id,
    })

    try {
      const response = await adminApi.getCharger(charger.id)
      const data = response.data?.charger || response.data?.data || response.data
      if (data?.id || data?._id || data?.chargerCode) {
        setChargerForm(chargerToForm(data))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load latest charger details'))
    }
  }

  const handleStationSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!stationForm.name.trim()) {
      setError('Station name is required')
      return
    }

    setSaving(true)
    try {
      if (stationModal?.mode === 'edit') {
        await updateStation(stationModal.id, {
          name: stationForm.name.trim(),
          status: stationForm.status,
        })
      } else {
        await addStation({
          name: stationForm.name.trim(),
          status: stationForm.status,
        })
      }
      closeModals()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save station'))
      setSaving(false)
    }
  }

  const handleChargerSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!chargerForm.chargerCode.trim()) {
      setError('Charger code is required')
      return
    }

    const payload = {
      chargerCode: chargerForm.chargerCode.trim(),
      chargerType: chargerForm.chargerType,
      powerRating: chargerForm.powerRating.trim(),
      slotDuration: Number(chargerForm.slotDuration),
      status: chargerForm.status,
    }

    setSaving(true)
    try {
      if (chargerModal?.mode === 'edit') {
        await updateCharger(chargerModal.stationId, chargerModal.chargerId, payload)
      } else {
        await addCharger(chargerModal.stationId, payload)
      }
      closeModals()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save charger'))
      setSaving(false)
    }
  }

  return (
    <div className="station-manager">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <p className="text-gray-500 text-sm">Tap a station to manage its chargers.</p>
        <button type="button" onClick={openAddStation} className="btn-green rounded-xl px-5 py-2.5 text-sm font-semibold w-full sm:w-auto">
          + Add station
        </button>
      </div>

      {loadError && <p className="err-text text-sm mb-4">{loadError}</p>}
      {loading && network.length === 0 && <SkeletonList rows={4} />}
      {!loading && network.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No stations yet. Add one to get started.</p>
      )}

      <div className="space-y-3">
        {network.map((station) => {
          const isOpen = expandedId === station.id
          const nextStatus = station.status === 'Active' ? 'Inactive' : 'Active'

          return (
            <div key={station.id} className="admin-panel rounded-xl overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4">
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : station.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <span className={`admin-chevron shrink-0 ${isOpen ? 'admin-chevron-open' : ''}`}>›</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{station.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {station.chargers.length} charger{station.chargers.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className={`admin-badge shrink-0 ${statusBadge(station.status)}`}>{station.status}</span>
                </button>
                <div className="flex flex-wrap gap-2 sm:shrink-0 pl-7 sm:pl-0">
                  <button type="button" onClick={() => openEditStation(station)} className="admin-btn-sm flex-1 sm:flex-none">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`${nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'} this station?`)) {
                        updateStationStatus(station.id, nextStatus)
                      }
                    }}
                    className={`admin-btn-sm flex-1 sm:flex-none ${nextStatus === 'Inactive' ? 'admin-btn-danger' : ''}`}
                  >
                    {nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-200 px-4 sm:px-5 py-4 bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <p className="text-sm font-medium text-gray-700">Chargers</p>
                    <button
                      type="button"
                      onClick={() => openAddCharger(station)}
                      className="btn-green rounded-lg px-4 py-2 text-xs font-semibold w-full sm:w-auto"
                    >
                      + Add charger
                    </button>
                  </div>

                  {station.chargers.length === 0 ? (
                    <p className="text-gray-400 text-xs">No chargers yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {station.chargers.map((charger) => (
                        <div
                          key={charger.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{charger.chargerCode || charger.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {charger.powerRating || charger.power}
                              {charger.slotDuration ? ` · ${charger.slotDuration} min` : ''}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`mono text-xs px-2 py-0.5 rounded ${charger.type === 'DC' ? 'tag-dc' : 'tag-ac'}`}>
                              {charger.type}
                            </span>
                            <span className={`admin-badge ${statusBadge(charger.status)}`}>{charger.status}</span>
                            <select
                              className="admin-btn-sm"
                              value={charger.status}
                              onChange={(e) => updateChargerStatus(station.id, charger.id, e.target.value)}
                              aria-label={`Status for ${charger.chargerCode || charger.name}`}
                            >
                              {CHARGER_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button type="button" onClick={() => openEditCharger(station, charger)} className="admin-btn-sm">
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal
        open={Boolean(stationModal)}
        onClose={closeModals}
        title={stationModal?.mode === 'edit' ? 'Edit station' : 'Add station'}
      >
        {error && stationModal && <p className="err-text text-sm mb-3">{error}</p>}
        <form onSubmit={handleStationSubmit} className="space-y-4">
          <Field label="Station name">
            <input
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              value={stationForm.name}
              onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
              placeholder="e.g. Vismaya"
              required
            />
          </Field>
          <Field label="Status">
            <select
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              value={stationForm.status}
              onChange={(e) => setStationForm({ ...stationForm, status: e.target.value })}
            >
              {STATION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button type="button" onClick={closeModals} className="btn-ghost rounded-xl px-5 py-2.5 text-sm w-full sm:w-auto">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-green rounded-xl px-5 py-2.5 text-sm font-semibold w-full sm:flex-1">
              {saving ? 'Saving...' : stationModal?.mode === 'edit' ? 'Save changes' : 'Add station'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(chargerModal)}
        onClose={closeModals}
        title={
          chargerModal?.mode === 'edit'
            ? 'Edit charger'
            : `Add charger · ${chargerModal?.stationName ?? ''}`
        }
      >
        {error && chargerModal && <p className="err-text text-sm mb-3">{error}</p>}
        <form onSubmit={handleChargerSubmit} className="space-y-4">
          <Field label="Charger code">
            <input
              className="inp w-full rounded-xl px-4 py-2.5 text-sm mono"
              value={chargerForm.chargerCode}
              onChange={(e) => setChargerForm({ ...chargerForm, chargerCode: e.target.value })}
              placeholder="CH001"
              required
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type">
              <select
                className="inp w-full rounded-xl px-4 py-2.5 text-sm"
                value={chargerForm.chargerType}
                onChange={(e) => {
                  const chargerType = e.target.value
                  setChargerForm({
                    ...chargerForm,
                    chargerType,
                    slotDuration: chargerType === 'DC' ? 150 : 240,
                  })
                }}
              >
                {CHARGER_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className="inp w-full rounded-xl px-4 py-2.5 text-sm"
                value={chargerForm.status}
                onChange={(e) => setChargerForm({ ...chargerForm, status: e.target.value })}
              >
                {CHARGER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Power rating">
              <input
                className="inp w-full rounded-xl px-4 py-2.5 text-sm"
                value={chargerForm.powerRating}
                onChange={(e) => setChargerForm({ ...chargerForm, powerRating: e.target.value })}
                placeholder="60kW"
                required
              />
            </Field>
            <Field label="Slot duration (minutes)">
              <input
                type="number"
                min="1"
                className="inp w-full rounded-xl px-4 py-2.5 text-sm"
                value={chargerForm.slotDuration}
                onChange={(e) => setChargerForm({ ...chargerForm, slotDuration: e.target.value })}
                required
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button type="button" onClick={closeModals} className="btn-ghost rounded-xl px-5 py-2.5 text-sm w-full sm:w-auto">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-green rounded-xl px-5 py-2.5 text-sm font-semibold w-full sm:flex-1">
              {saving ? 'Saving...' : chargerModal?.mode === 'edit' ? 'Save changes' : 'Add charger'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StationManager
