import { useState } from 'react'
import { useNetwork } from '../../src/context/NetworkContext'
import {
  STATION_STATUSES,
  CHARGER_STATUSES,
  CHARGER_TYPES,
} from '../../data/evNetwork'
import Modal from './Modal'

const emptyStation = { name: '', status: 'open', id: '' }

const emptyCharger = {
  id: '',
  name: '',
  type: 'DC',
  power: '60kW',
  connector: 'CCS2',
  status: 'available',
}

const statusBadge = (status) => {
  if (status === 'open' || status === 'available') return 'admin-badge-green'
  if (status === 'closed') return 'admin-badge-amber'
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
    addStation,
    updateStation,
    deleteStation,
    addCharger,
    updateCharger,
    deleteCharger,
  } = useNetwork()

  const [expandedId, setExpandedId] = useState(null)
  const [error, setError] = useState('')

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
  }

  const openAddStation = () => {
    setStationForm(emptyStation)
    setError('')
    setStationModal({ mode: 'add' })
  }

  const openEditStation = (station) => {
    setStationForm({ name: station.name, status: station.status, id: station.id })
    setError('')
    setStationModal({ mode: 'edit', id: station.id })
  }

  const openAddCharger = (station) => {
    setExpandedId(station.id)
    setChargerForm(emptyCharger)
    setError('')
    setChargerModal({ mode: 'add', stationId: station.id, stationName: station.name })
  }

  const openEditCharger = (station, charger) => {
    setExpandedId(station.id)
    setChargerForm({
      id: charger.id,
      name: charger.name,
      type: charger.type,
      power: charger.power,
      connector: charger.connector,
      status: charger.status,
    })
    setError('')
    setChargerModal({
      mode: 'edit',
      stationId: station.id,
      stationName: station.name,
      chargerId: charger.id,
    })
  }

  const handleStationSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!stationForm.name.trim()) {
      setError('Station name is required')
      return
    }

    if (stationModal?.mode === 'edit') {
      updateStation(stationModal.id, {
        name: stationForm.name.trim(),
        status: stationForm.status,
      })
    } else {
      const ok = addStation({
        name: stationForm.name.trim(),
        status: stationForm.status,
        id: stationForm.id.trim() || undefined,
      })
      if (!ok) {
        setError('A station with this ID already exists')
        return
      }
    }
    closeModals()
  }

  const handleChargerSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!chargerForm.id.trim() || !chargerForm.name.trim()) {
      setError('Charger ID and name are required')
      return
    }

    const payload = {
      id: chargerForm.id.trim(),
      name: chargerForm.name.trim(),
      type: chargerForm.type,
      power: chargerForm.power.trim(),
      connector: chargerForm.connector.trim(),
      status: chargerForm.status,
    }

    if (chargerModal?.mode === 'edit') {
      updateCharger(chargerModal.stationId, chargerModal.chargerId, payload)
    } else {
      addCharger(chargerModal.stationId, payload)
    }
    closeModals()
  }

  return (
    <div className="station-manager">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <p className="text-gray-500 text-sm">Tap a station to manage its chargers.</p>
        <button type="button" onClick={openAddStation} className="btn-green rounded-xl px-5 py-2.5 text-sm font-semibold w-full sm:w-auto">
          + Add station
        </button>
      </div>

      {network.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">No stations yet. Add one to get started.</p>
      )}

      <div className="space-y-3">
        {network.map((station) => {
          const isOpen = expandedId === station.id

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
                      if (window.confirm('Delete station and all chargers?')) {
                        deleteStation(station.id)
                        if (expandedId === station.id) setExpandedId(null)
                      }
                    }}
                    className="admin-btn-sm admin-btn-danger flex-1 sm:flex-none"
                  >
                    Delete
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
                            <p className="text-sm font-medium text-gray-900">{charger.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{charger.power} · {charger.connector}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`mono text-xs px-2 py-0.5 rounded ${charger.type === 'DC' ? 'tag-dc' : 'tag-ac'}`}>
                              {charger.type}
                            </span>
                            <span className={`admin-badge ${statusBadge(charger.status)}`}>{charger.status}</span>
                            <button type="button" onClick={() => openEditCharger(station, charger)} className="admin-btn-sm">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Delete this charger?')) {
                                  deleteCharger(station.id, charger.id)
                                }
                              }}
                              className="admin-btn-sm admin-btn-danger"
                            >
                              Delete
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
          <Field label="Name">
            <input
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              value={stationForm.name}
              onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
              placeholder="e.g. Vismaya"
              required
            />
          </Field>
          {stationModal?.mode === 'add' && (
            <Field label="ID (optional)">
              <input
                className="inp w-full rounded-xl px-4 py-2.5 text-sm mono"
                value={stationForm.id}
                onChange={(e) => setStationForm({ ...stationForm, id: e.target.value })}
                placeholder="auto from name"
              />
            </Field>
          )}
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
            <button type="submit" className="btn-green rounded-xl px-5 py-2.5 text-sm font-semibold w-full sm:flex-1">
              {stationModal?.mode === 'edit' ? 'Save changes' : 'Add station'}
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
          <Field label="Charger ID">
            <input
              className="inp w-full rounded-xl px-4 py-2.5 text-sm mono"
              value={chargerForm.id}
              onChange={(e) => setChargerForm({ ...chargerForm, id: e.target.value })}
              disabled={chargerModal?.mode === 'edit'}
              placeholder="INFCMD001-G1"
              required
            />
          </Field>
          <Field label="Display name">
            <input
              className="inp w-full rounded-xl px-4 py-2.5 text-sm"
              value={chargerForm.name}
              onChange={(e) => setChargerForm({ ...chargerForm, name: e.target.value })}
              required
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Type">
              <select
                className="inp w-full rounded-xl px-4 py-2.5 text-sm"
                value={chargerForm.type}
                onChange={(e) => setChargerForm({ ...chargerForm, type: e.target.value })}
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
            <Field label="Power">
              <input
                className="inp w-full rounded-xl px-4 py-2.5 text-sm"
                value={chargerForm.power}
                onChange={(e) => setChargerForm({ ...chargerForm, power: e.target.value })}
                placeholder="60kW"
              />
            </Field>
            <Field label="Connector">
              <input
                className="inp w-full rounded-xl px-4 py-2.5 text-sm"
                value={chargerForm.connector}
                onChange={(e) => setChargerForm({ ...chargerForm, connector: e.target.value })}
                placeholder="CCS2"
              />
            </Field>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button type="button" onClick={closeModals} className="btn-ghost rounded-xl px-5 py-2.5 text-sm w-full sm:w-auto">
              Cancel
            </button>
            <button type="submit" className="btn-green rounded-xl px-5 py-2.5 text-sm font-semibold w-full sm:flex-1">
              {chargerModal?.mode === 'edit' ? 'Save changes' : 'Add charger'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StationManager
