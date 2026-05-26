
import { useEffect, useState } from 'react'
import { ClipboardList, BarChart3, Shield, X } from 'lucide-react'

const SERVICE_TYPES = [
  '上門/外出接觸及探訪',
  '電話聯絡/慰問',
  '陪同及協助參與小組',
  '陪同及協助參與其他社區活動',
  '協助連繫社區資源',
  'PSLG',
  '督導會議(樂齡之友會議)',
  '協助治療小組'
]

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('currentVolunteer')) || null
  )

  const [tab, setTab] = useState('input')

  const [records, setRecords] = useState(
    JSON.parse(localStorage.getItem('serviceRecords')) || []
  )

  const [editingRecord, setEditingRecord] = useState(null)

  const [form, setForm] = useState({
    serviceDate: '',
    serviceName: '',
    serviceType: SERVICE_TYPES[0],
    startTime: '',
    endTime: '',
    hours: '',
    serviceTarget: '',
    remark: '',
    confirmed: false
  })

  useEffect(() => {
    localStorage.setItem('serviceRecords', JSON.stringify(records))
  }, [records])

  useEffect(() => {
    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}`)
      const end = new Date(`2000-01-01T${form.endTime}`)

      if (end > start) {
        const diff = (end - start) / 1000 / 60 / 60

        setForm(prev => ({
          ...prev,
          hours: diff.toFixed(1)
        }))
      }
    }
  }, [form.startTime, form.endTime])

  useEffect(() => {
    if (editingRecord?.startTime && editingRecord?.endTime) {
      const start = new Date(`2000-01-01T${editingRecord.startTime}`)
      const end = new Date(`2000-01-01T${editingRecord.endTime}`)

      if (end > start) {
        const diff = (end - start) / 1000 / 60 / 60

        setEditingRecord(prev => ({
          ...prev,
          hours: diff.toFixed(1)
        }))
      }
    }
  }, [editingRecord?.startTime, editingRecord?.endTime])

  if (!user) {
    return (
      <LoginPage
        onLogin={(u) => {
          setUser(u)
          localStorage.setItem('currentVolunteer', JSON.stringify(u))
        }}
      />
    )
  }

  const saveRecord = () => {
    if (!form.serviceDate || !form.serviceName) {
      alert('請填寫服務日期及服務名稱')
      return
    }

    const newRecord = {
      ...form,
      id: Date.now(),
      volunteerNo: user.volunteerNo,
      chineseName: user.chineseName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setRecords([newRecord, ...records])

    setForm({
      serviceDate: '',
      serviceName: '',
      serviceType: SERVICE_TYPES[0],
      startTime: '',
      endTime: '',
      hours: '',
      serviceTarget: '',
      remark: '',
      confirmed: false
    })
  }

  const saveEditedRecord = () => {
    if (!editingRecord.serviceDate || !editingRecord.serviceName) {
      alert('請填寫服務日期及服務名稱')
      return
    }

    setRecords(records.map(r =>
      r.id === editingRecord.id
        ? {
            ...editingRecord,
            updatedAt: new Date().toISOString()
          }
        : r
    ))

    setEditingRecord(null)
  }

  const deleteEditedRecord = () => {
    const confirmDelete = confirm('確定刪除此服務紀錄？')

    if (confirmDelete) {
      setRecords(records.filter(r => r.id !== editingRecord.id))
      setEditingRecord(null)
    }
  }

  const totalHours = records.reduce(
    (sum, item) => sum + Number(item.hours || 0),
    0
  )

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">
            Joyage Volunteer Service Management System
          </h1>

          <p className="text-xs text-slate-500">
            {user.chineseName}
          </p>
        </div>

        <button
          className="bg-red-500 text-white px-3 py-2 rounded-xl text-sm"
          onClick={() => {
            localStorage.removeItem('currentVolunteer')
            setUser(null)
          }}
        >
          登出
        </button>
      </header>

      {tab === 'input' && (
        <main className="p-4 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow">
            <h2 className="font-bold text-lg mb-4">
              新增服務紀錄
            </h2>

            <input
              type="date"
              className="w-full border rounded-2xl p-3 mb-3"
              value={form.serviceDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceDate: e.target.value
                })
              }
            />

            <input
              placeholder="服務名稱"
              className="w-full border rounded-2xl p-3 mb-3"
              value={form.serviceName}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceName: e.target.value
                })
              }
            />

            <select
              className="w-full border rounded-2xl p-3 mb-3"
              value={form.serviceType}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceType: e.target.value
                })
              }
            >
              {SERVICE_TYPES.map(type => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  開始時間
                </label>
                <input
                  type="time"
                  className="w-full border rounded-2xl p-3"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      startTime: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  結束時間
                </label>
                <input
                  type="time"
                  className="w-full border rounded-2xl p-3"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endTime: e.target.value
                    })
                  }
                />
              </div>
            </div>

            <input
              placeholder="服務時數"
              className="w-full border rounded-2xl p-3 mb-3"
              value={form.hours}
              onChange={(e) =>
                setForm({
                  ...form,
                  hours: e.target.value
                })
              }
            />

            <input
              placeholder="服務對象"
              className="w-full border rounded-2xl p-3 mb-3"
              value={form.serviceTarget}
              onChange={(e) =>
                setForm({
                  ...form,
                  serviceTarget: e.target.value
                })
              }
            />

            <textarea
              placeholder="備註"
              className="w-full border rounded-2xl p-3 mb-3"
              value={form.remark}
              onChange={(e) =>
                setForm({
                  ...form,
                  remark: e.target.value
                })
              }
            />

            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={form.confirmed}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmed: e.target.checked
                  })
                }
              />
              已完成客戶確認
            </label>

            <button
              onClick={saveRecord}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold"
            >
              儲存服務紀錄
            </button>
          </div>

          <div className="space-y-4">
            {records.length === 0 && (
              <div className="bg-white rounded-3xl p-8 text-center text-slate-500 shadow">
                暫時未有服務紀錄
              </div>
            )}

            {records.map(record => (
              <div
                key={record.id}
                onClick={() => setEditingRecord({ ...record })}
                className={`bg-white rounded-3xl p-4 shadow border-l-8 cursor-pointer active:scale-[0.99] transition ${
                  record.confirmed
                    ? 'border-green-500'
                    : 'border-yellow-400'
                }`}
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-bold">
                      {record.serviceName}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {record.serviceType}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-3xl font-bold text-emerald-600">
                      + {record.hours}
                    </p>

                    <p className="text-xs text-slate-500">
                      小時
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-600 space-y-1">
                  <p>日期：{record.serviceDate}</p>
                  <p>時間：{record.startTime || '--'} - {record.endTime || '--'}</p>
                  <p>對象：{record.serviceTarget}</p>
                  <p>備註：{record.remark}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {tab === 'stats' && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-3xl p-6 shadow-xl">
            <p className="text-sm opacity-70">
              年度總服務時數
            </p>

            <h2 className="text-5xl font-bold mt-2">
              {totalHours}
            </h2>

            <p className="mt-2">
              服務次數：{records.length}
            </p>
          </div>
        </div>
      )}

      {tab === 'admin' && (
        <div className="p-4">
          <div className="bg-white rounded-3xl p-6 shadow">
            <h2 className="font-bold text-xl">
              管理員頁面
            </h2>
          </div>
        </div>
      )}

      {editingRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-[#f6f3eb] rounded-t-[32px] md:rounded-[32px] w-full max-w-lg p-5 max-h-[88vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">
                編輯服務紀錄
              </h2>

              <button
                className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center"
                onClick={() => setEditingRecord(null)}
              >
                <X />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-slate-600 mb-1 block">
                  服務日期
                </label>
                <input
                  type="date"
                  className="w-full border rounded-2xl p-4 bg-white"
                  value={editingRecord.serviceDate || ''}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      serviceDate: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 mb-1 block">
                  服務名稱
                </label>
                <input
                  className="w-full border rounded-2xl p-4 bg-white"
                  value={editingRecord.serviceName || ''}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      serviceName: e.target.value
                    })
                  }
                  placeholder="服務名稱"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 mb-1 block">
                  服務種類
                </label>
                <select
                  className="w-full border rounded-2xl p-4 bg-white"
                  value={editingRecord.serviceType || SERVICE_TYPES[0]}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      serviceType: e.target.value
                    })
                  }
                >
                  {SERVICE_TYPES.map(type => (
                    <option key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-1 block">
                    開始時間
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded-2xl p-4 bg-white"
                    value={editingRecord.startTime || ''}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        startTime: e.target.value
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 mb-1 block">
                    結束時間
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded-2xl p-4 bg-white"
                    value={editingRecord.endTime || ''}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        endTime: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 mb-1 block">
                  服務時數
                </label>
                <input
                  className="w-full border rounded-2xl p-4 bg-white"
                  value={editingRecord.hours || ''}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      hours: e.target.value
                    })
                  }
                  placeholder="服務時數"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 mb-1 block">
                  服務對象
                </label>
                <input
                  className="w-full border rounded-2xl p-4 bg-white"
                  value={editingRecord.serviceTarget || ''}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      serviceTarget: e.target.value
                    })
                  }
                  placeholder="服務對象"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 mb-1 block">
                  備註
                </label>
                <textarea
                  className="w-full border rounded-2xl p-4 bg-white min-h-[100px]"
                  value={editingRecord.remark || ''}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      remark: e.target.value
                    })
                  }
                  placeholder="備註"
                />
              </div>

              <label className="flex items-center justify-between gap-2 bg-white rounded-2xl p-4">
                <span className="font-bold text-slate-700">
                  已完成客戶確認
                </span>

                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={!!editingRecord.confirmed}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      confirmed: e.target.checked
                    })
                  }
                />
              </label>

              <button
                className="w-full bg-slate-900 text-white rounded-2xl py-4 text-xl font-bold"
                onClick={saveEditedRecord}
              >
                確認修改
              </button>

              <button
                className="w-full bg-red-100 text-red-600 rounded-2xl py-4 text-xl font-bold"
                onClick={deleteEditedRecord}
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/80 backdrop-blur border shadow-xl rounded-3xl py-3 flex justify-around">
        <button
          onClick={() => setTab('input')}
          className={tab === 'input' ? 'text-black' : 'text-slate-400'}
        >
          <ClipboardList />
        </button>

        <button
          onClick={() => setTab('stats')}
          className={tab === 'stats' ? 'text-black' : 'text-slate-400'}
        >
          <BarChart3 />
        </button>

        <button
          onClick={() => setTab('admin')}
          className={tab === 'admin' ? 'text-black' : 'text-slate-400'}
        >
          <Shield />
        </button>
      </nav>
    </div>
  )
}

function LoginPage({ onLogin }) {
  const [volunteerNo, setVolunteerNo] = useState('')
  const [chineseName, setChineseName] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">
          Joyage Volunteer Service Management System
        </h1>

        <p className="text-slate-500 mb-6">
          像記帳一樣，清楚記錄每一次義工服務。
        </p>

        <input
          className="w-full border rounded-2xl p-4 mb-4"
          placeholder="義工編號"
          value={volunteerNo}
          onChange={(e) => setVolunteerNo(e.target.value)}
        />

        <input
          className="w-full border rounded-2xl p-4 mb-6"
          placeholder="中文姓名"
          value={chineseName}
          onChange={(e) => setChineseName(e.target.value)}
        />

        <button
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold"
          onClick={() =>
            onLogin({
              volunteerNo,
              chineseName
            })
          }
        >
          開始記錄
        </button>
      </div>
    </div>
  )
}
